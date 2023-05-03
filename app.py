# Flask app and routes

from flask import Flask, render_template, request, session
import mysql.connector

app = Flask(__name__)

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

@app.route("/login")
def login():
    return

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