# Flask app and routes

from flask import Flask, render_template, redirect, request, session
import mysql.connector
import re
import os
from dotenv import load_dotenv

app = Flask(__name__)

# Secret Key
load_dotenv()
app.secret_key = os.getenv("SECRET_KEY")

# Initialise Database
mydb = mysql.connector.connect(
    host = os.getenv("HOST"),
    user = os.getenv("USERDB"),
    password = os.getenv("PASSWORD")
)

mycursor = mydb.cursor(dictionary=True, buffered=True)
mycursor.execute("CREATE DATABASE IF NOT EXISTS websitedb")
mycursor.execute("USE websitedb")
mycursor.execute("""CREATE TABLE IF NOT EXISTS locations (
    location_id INT NOT NULL AUTO_INCREMENT,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    PRIMARY KEY (location_id)
    )""")
mycursor.execute("""CREATE TABLE IF NOT EXISTS accounts (
    account_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    location_id INT NOT NULL,
    PRIMARY KEY (account_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id)
    )""")
mycursor.execute("""CREATE TABLE IF NOT EXISTS games (
    game_id INT NOT NULL AUTO_INCREMENT,
    game_name VARCHAR(100) NOT NULL,
    highest_score INT,
    hs_account_id INT,
    hs_date DATE,
    PRIMARY KEY (game_id),
    FOREIGN KEY (hs_account_id) REFERENCES accounts(account_id)
    )""")
mycursor.execute("""CREATE TABLE IF NOT EXISTS userstats (
    userstat_id INT NOT NULL AUTO_INCREMENT,
    game_id INT NOT NULL,
    account_id INT NOT NULL,
    high_score INT NOT NULL,
    last_played DATE NOT NULL,
    times_played INT NOT NULL,
    PRIMARY KEY (userstat_id),
    FOREIGN KEY (account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
    )""")

# Website routes
@app.route("/")
def index():
    # Get stats for website
    # Number of games and number of users
    mycursor.execute("SELECT COUNT(*) AS stat_1 FROM games")
    stat_1 = mycursor.fetchone()['stat_1']
    mycursor.execute("SELECT COUNT(*) AS stat_2 FROM accounts")
    stat_2 = mycursor.fetchone()['stat_2']
    # High scores for each game
    mycursor.execute(
        """
        SELECT game_name, highest_score, hs_date, username
        FROM games INNER JOIN accounts
        ON games.hs_account_id = accounts.account_id
        """)
    stat_3 = mycursor.fetchall()
    # Number of people who play pong that live in Australia
    mycursor.execute(
        """
        SELECT COUNT(*) AS stat_4
        FROM userstats INNER JOIN 
            (SELECT account_id
            FROM accounts INNER JOIN locations
            WHERE accounts.location_id = locations.location_id
            AND locations.country = 'australia') aus_accounts
        ON userstats.account_id = aus_accounts.account_id
        WHERE userstats.game_id IN 
            (SELECT game_id FROM games WHERE game_name = 'pong')
        """)
    stat_4 = mycursor.fetchone()['stat_4']
    # Number of people who play snake that live in Australia but not Melbourne and are aged between 13-18
    mycursor.execute(
        """
        SELECT COUNT(*) AS stat_5
        FROM userstats INNER JOIN
            (SELECT account_id
            FROM accounts
            WHERE age BETWEEN 13 AND 18
            AND location_id IN 
                (SELECT location_id 
                FROM locations
                WHERE country = 'australia'
                AND NOT city = 'melbourne')) accs
        ON userstats.account_id = accs.account_id
        WHERE userstats.game_id IN 
            (SELECT game_id FROM games WHERE game_name = 'snake')
        """
    )
    stat_5 = mycursor.fetchone()['stat_5']
    # Number of people who played snake at least 5 times but never played tictactoe, aged over 18
    mycursor.execute(
        """
        SELECT COUNT(*) AS stat_6
        FROM accounts
        WHERE age > 18
        AND account_id IN
            (SELECT account_id
            FROM userstats
            WHERE game_id IN
                (SELECT game_id FROM games WHERE game_name = 'snake')
            AND times_played >= 5)
        AND NOT account_id IN
            (SELECT account_id
            FROM userstats
            WHERE game_id IN
                (SELECT game_id FROM games WHERE game_name = 'tictactoe'))
        """
    )
    stat_6 = mycursor.fetchone()['stat_6']
    # Person with the lowest score in pong (played at least once)
    mycursor.execute(
        """
        SELECT username, high_score, times_played
        FROM accounts INNER JOIN userstats
        ON accounts.account_id = userstats.account_id
        WHERE userstats.userstat_id IN
            (SELECT userstat_id
            FROM userstats
            WHERE game_id IN
                (SELECT game_id FROM games WHERE game_name = 'pong')
            AND high_score IN
                (SELECT MIN(high_score)
                FROM userstats 
                WHERE game_id IN
                    (SELECT game_id FROM games WHERE game_name = 'pong')
                AND times_played > 0
                )
            )
        LIMIT 1
        """
    )
    stat_7 = mycursor.fetchone()
    # Average high score for each game in comparison to how many people have played it
    mycursor.execute(
        """
        SELECT games.game_name, ROUND(AVG(userstats.high_score), 0) as avg_high_score, 
        SUM(userstats.times_played) as total_times_played, COUNT(*) AS num_users
        FROM accounts INNER JOIN userstats
        ON accounts.account_id = userstats.account_id
        INNER JOIN games
        ON games.game_id = userstats.game_id
        GROUP BY games.game_name
        HAVING total_times_played > 0
        """
    )
    stat_8 = mycursor.fetchall()

    return render_template("index.html", stat_1=stat_1, stat_2=stat_2, stat_3=stat_3, stat_4=stat_4,
    stat_5=stat_5, stat_6=stat_6, stat_7=stat_7, stat_8=stat_8)

@app.route("/user")
def user():
    if "loggedin" in session:
        return render_template("user.html", user=session["username"])
    else:
        return redirect("/login")

@app.route("/logout")
def logout():
    session.pop('loggedin', None)
    session.pop('id', None)
    session.pop('username', None)
    return redirect("/")

@app.route("/login", methods=['GET', 'POST'])
def login():
    status_msg = ""
    # Login form submitted
    if request.method == "POST" and "username" in request.form and "password" in request.form:
        username = request.form["username"]
        password = request.form["password"]
        # Check if account is in database
        mycursor.execute(
            """
            SELECT * 
            FROM accounts 
            WHERE username = %s
            AND password = %s
            """,
            (username, password))
        account = mycursor.fetchone()
        # Account exists, log in and redirect to home page
        if account:
            session["loggedin"] = True
            session["id"] = account["account_id"]
            session["username"] = account["username"]
            return redirect("/user")
        # Username and password doesn't match any account in database
        else:
            status_msg = "Incorrect username or password!"

    return render_template("login.html", msg = status_msg)

@app.route("/register", methods=['GET', 'POST'])
def register():
    status_msg = ""
    # Register form submitted
    if request.method == "POST" and "username" in request.form and "password" in request.form\
    and "email" in request.form and "age" in request.form and "country" in request.form\
    and "state" in request.form and "city" in request.form:
        username = request.form["username"]
        password = request.form["password"]
        email = request.form["email"]
        age = request.form["age"]
        country = request.form["country"].lower()
        state = request.form["state"].lower()
        city = request.form["city"].lower()

        # Check if account is already in database
        mycursor.execute(
            """
            SELECT * 
            FROM accounts 
            WHERE username = %s
            """,
            (username, ))
        account = mycursor.fetchone()
        # Account already exists
        if account:
            status_msg = "Username is already taken!"
        # Check email, age and username is valid
        elif not re.match(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}\b', email):
            status_msg = "Invalid email!"
        elif not re.match(r'[A-Za-z0-9]+', username):
            status_msg = "Username can only contain numbers or letters!"
        elif not re.match(r'[0-9]+', age):
            status_msg = "Please enter a valid age!"
        # Create new account
        else:
            mycursor.execute(
                """
                SELECT *
                FROM locations
                WHERE country = %s
                AND state = %s
                AND city = %s
                """,
                (country, state, city)
            )
            location = mycursor.fetchone()
            if not location:
                mycursor.execute(
                    """
                    INSERT INTO locations VALUES
                    (NULL, %s, %s, %s)
                    """,
                    (country, state, city)
                )
                mydb.commit()
                mycursor.execute(
                    """
                    SELECT *
                    FROM locations
                    WHERE country = %s
                    AND state = %s
                    AND city = %s
                    """,
                    (country, state, city)
                )
                location = mycursor.fetchone()
            mycursor.execute(
                """
                INSERT INTO accounts VALUES
                (NULL, %s, %s, %s, %s, %s)
                """,
                (username, password, email, age, location["location_id"])
            )
            mydb.commit()
            status_msg = "You have successfuly registered an account!"

    return render_template("register.html", msg = status_msg)

@app.route("/snake", methods=['GET', 'POST'])
def snake():
    # Set game to snake
    mycursor.execute(
        """
        SELECT *
        FROM games
        WHERE game_name = %s
        """,
        ("snake", ))
    game = mycursor.fetchone()
    # Game is not yet in database
    if not game:
        mycursor.execute(
            """
            INSERT INTO games VALUES
            (NULL, %s, %s, NULL, NULL)
            """,
            ("snake", 0))
        mydb.commit()
        mycursor.execute(
            """
            SELECT *
            FROM games
            WHERE game_name = %s
            """,
            ("snake", ))
        game = mycursor.fetchone()
    session["game_id"] = game["game_id"]

    # Update info if user is logged in
    if request.method ==  "POST" and "score" in request.json and "loggedin" in session:
        # Check if user stat already exists, else create user stat
        mycursor.execute(
            """
            SELECT *
            FROM userstats
            WHERE game_id = %s
            AND account_id = %s
            """,
            (session["game_id"], session["id"]))
        userstat = mycursor.fetchone()
        # Userstat is not yet in database
        if not userstat:
            mycursor.execute(
                """
                INSERT INTO userstats VALUES
                (NULL, %s, %s, %s, CURDATE(), %s)
                """,
                (session["game_id"], session["id"], 0, 0))
            mydb.commit()
            mycursor.execute(
                """
                SELECT *
                FROM userstats
                WHERE game_id = %s
                AND account_id = %s
                """,
                (session["game_id"], session["id"]))
            userstat = mycursor.fetchone()

        # Update userstat
        if request.json["score"] > userstat["high_score"]:
            high_score = request.json["score"]
        else:
            high_score = userstat["high_score"]
        mycursor.execute(
            """
            UPDATE userstats
            SET high_score = %s, last_played = CURDATE(), times_played = times_played + 1
            WHERE game_id = %s AND account_id = %s
            """,
            (high_score, session["game_id"], session["id"]))
        mydb.commit()

        # Update game stat
        mycursor.execute(
            """
            SELECT *
            FROM games
            WHERE game_id = %s
            """,
            (session["game_id"], ))
        game = mycursor.fetchone()
        # New high score achieved
        if high_score > game["highest_score"]:
            mycursor.execute(
                """
                UPDATE games
                SET highest_score = %s, hs_account_id = %s, hs_date = CURDATE()
                WHERE game_id = %s
                """,
                (high_score, session["id"], session["game_id"])
            )
            mydb.commit()
            
    return render_template("snake.html")

@app.route("/tictactoe", methods=['GET', 'POST'])
def tictactoe():
    # Set game to tictactoe
    mycursor.execute(
        """
        SELECT *
        FROM games
        WHERE game_name = %s
        """,
        ("tictactoe", ))
    game = mycursor.fetchone()
    # Game is not yet in database
    if not game:
        mycursor.execute(
            """
            INSERT INTO games VALUES
            (NULL, %s, %s, NULL, NULL)
            """,
            ("tictactoe", 0))
        mydb.commit()
        mycursor.execute(
            """
            SELECT *
            FROM games
            WHERE game_name = %s
            """,
            ("tictactoe", ))
        game = mycursor.fetchone()
    session["game_id"] = game["game_id"]

    # Update info if user is logged in
    if request.method ==  "POST" and "loggedin" in session:
        # Check if user stat already exists, else create user stat
        mycursor.execute(
            """
            SELECT *
            FROM userstats
            WHERE game_id = %s
            AND account_id = %s
            """,
            (session["game_id"], session["id"]))
        userstat = mycursor.fetchone()
        # Userstat is not yet in database
        if not userstat:
            mycursor.execute(
                """
                INSERT INTO userstats VALUES
                (NULL, %s, %s, %s, CURDATE(), %s)
                """,
                (session["game_id"], session["id"], 0, 0))
            mydb.commit()
            mycursor.execute(
                """
                SELECT *
                FROM userstats
                WHERE game_id = %s
                AND account_id = %s
                """,
                (session["game_id"], session["id"]))
            userstat = mycursor.fetchone()

        # Update userstat (no scoring in tictactoe)
        mycursor.execute(
            """
            UPDATE userstats
            SET last_played = CURDATE(), times_played = times_played + 1
            WHERE game_id = %s AND account_id = %s
            """,
            (session["game_id"], session["id"]))
        mydb.commit()

    return render_template("tictactoe.html")

@app.route("/pong", methods=['GET', 'POST'])
def pong():
    # Set game to pong
    mycursor.execute(
        """
        SELECT *
        FROM games
        WHERE game_name = %s
        """,
        ("pong", ))
    game = mycursor.fetchone()
    # Game is not yet in database
    if not game:
        mycursor.execute(
            """
            INSERT INTO games VALUES
            (NULL, %s, %s, NULL, NULL)
            """,
            ("pong", 0))
        mydb.commit()
        mycursor.execute(
            """
            SELECT *
            FROM games
            WHERE game_name = %s
            """,
            ("pong", ))
        game = mycursor.fetchone()
    session["game_id"] = game["game_id"]

    # Update info if user is logged in
    if request.method ==  "POST" and "score" in request.json and "mode" in request.json and "loggedin" in session:
        # Check if user stat already exists, else create user stat
        mycursor.execute(
            """
            SELECT *
            FROM userstats
            WHERE game_id = %s
            AND account_id = %s
            """,
            (session["game_id"], session["id"]))
        userstat = mycursor.fetchone()
        # Userstat is not yet in database
        if not userstat:
            mycursor.execute(
                """
                INSERT INTO userstats VALUES
                (NULL, %s, %s, %s, CURDATE(), %s)
                """,
                (session["game_id"], session["id"], 0, 0))
            mydb.commit()
            mycursor.execute(
                """
                SELECT *
                FROM userstats
                WHERE game_id = %s
                AND account_id = %s
                """,
                (session["game_id"], session["id"]))
            userstat = mycursor.fetchone()

        # Update userstat (only update high score if played in survival mode)
        if request.json["score"] > userstat["high_score"] and request.json["mode"] == "survival":
            high_score = request.json["score"]
        else:
            high_score = userstat["high_score"]
        mycursor.execute(
            """
            UPDATE userstats
            SET high_score = %s, last_played = CURDATE(), times_played = times_played + 1
            WHERE game_id = %s AND account_id = %s
            """,
            (high_score, session["game_id"], session["id"]))
        mydb.commit()

        # Update game stat if played in survival mode
        if request.json["mode"] == "survival":
            mycursor.execute(
                """
                SELECT *
                FROM games
                WHERE game_id = %s
                """,
                (session["game_id"], ))
            game = mycursor.fetchone()
            # New high score
            if high_score > game["highest_score"]:
                mycursor.execute(
                    """
                    UPDATE games
                    SET highest_score = %s, hs_account_id = %s, hs_date = CURDATE()
                    WHERE game_id = %s
                    """,
                    (high_score, session["id"], session["game_id"])
                )
                mydb.commit()

    return render_template("pong.html")

if __name__=='__main__':
    app.run(debug = True)