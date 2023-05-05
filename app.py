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
    host = "127.0.0.1",
    user = "root",
    password = ""
)

mycursor = mydb.cursor(dictionary=True)
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


# Website routes
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login", methods=['GET', 'POST'])
def login():
    status_msg = ""
    # Login form submitted
    if request.method == "POST" and "username" in request.form and "password" in request.form:
        username = request.form["username"]
        password = request.form["password"]
        # Check if account is in database
        mycursor.execute(
            """SELECT * 
            FROM accounts 
            WHERE username = %s
            AND password = %s""",
            (username, password))
        account = mycursor.fetchone()
        # Account exists, log in and redirect to home page
        if account:
            session["loggedin"] = True
            session["id"] = account["account_id"]
            session["username"] = account["username"]
            return redirect("/")
        # Username and password doesn't match any account in database
        else:
            status_msg = "Incorrect username or password!"

    return render_template("login.html", msg = status_msg)

@app.route("/register", methods=['GET', 'POST'])
def register():
    status_msg = ""
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
            """SELECT * 
            FROM accounts 
            WHERE username = %s""",
            (username, ))
        account = mycursor.fetchone()
        if account:
            status_msg = "Username is already taken!"
        elif not re.match(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}\b', email):
            status_msg = "Invalid email!"
        elif not re.match(r'[A-Za-z0-9]+', username):
            status_msg = "Username can only contain numbers or letters!"
        elif not re.match(r'[0-9]+', age):
            status_msg = "Please enter a valid age!"
        else:
            mycursor.execute(
                """SELECT *
                FROM locations
                WHERE country = %s
                AND state = %s
                AND city = %s""",
                (country, state, city)
            )
            location = mycursor.fetchone()
            if not location:
                mycursor.execute(
                    """INSERT INTO locations VALUES
                    (NULL, %s, %s, %s)
                    """,
                    (country, state, city)
                )
                mydb.commit()
                mycursor.execute(
                    """SELECT *
                    FROM locations
                    WHERE country = %s
                    AND state = %s
                    AND city = %s""",
                    (country, state, city)
                )
                location = mycursor.fetchone()
            mycursor.execute(
                """INSERT INTO accounts VALUES
                (NULL, %s, %s, %s, %s, %s)
                """,
                (username, password, email, age, location["location_id"])
            )
            mydb.commit()
            status_msg = "You have successfuly registered an account!"

    return render_template("register.html", msg = status_msg)

@app.route("/snake")
def snake():
    return render_template("snake.html")

@app.route("/tictactoe")
def tictactoe():
    return render_template("tictactoe.html")

@app.route("/pong")
def pong():
    return render_template("pong.html")

if __name__=='__main__':
    app.run(debug = True)