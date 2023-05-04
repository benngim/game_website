# Flask app and routes

from flask import Flask, render_template, redirect, request, session
import mysql.connector
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

mycursor = mydb.cursor()
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
            session["id"] = account["id"]
            session["username"] = account["username"]
            return redirect("/")
        # Username and password doesn't match any account in database
        else:
            status_msg = "Incorrect username or password!"

    return render_template("login.html", msg = status_msg)

@app.route("/register", methods=['GET', 'POST'])
def register():
    return render_template("register.html")

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