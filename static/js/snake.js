/* Implements Snake Game */

// Board Variables
var blocksize = 25;
var rows = 20;
var cols = 20;
var board;
var context;

// Snake
var snakeX = blocksize * 5;
var snakeY = blocksize * 5;
var velocityX = 0;
var velocityY = 0;
var snakeBody = []

// Food
var foodX;
var foodY;

// Game variables
var gameOver;
var score;


window.onload = startGame;

function startGame() {
    // Initialise new game
    board = document.getElementById("snake-board");
    board.height = rows * blocksize;
    board.width = cols * blocksize;
    context = board.getContext("2d");
    gameOver = false;
    score = 0;
    document.getElementById("snake-score").innerHTML = "Score: " + score;
    placeFood();
    document.addEventListener("keyup", changeDirection);
    setInterval(update, 100);
}

function update() {
    // Draws board
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);

    // Gameover
    if (gameOver) {
        context.font = "64px Courier New";
        context.fillStyle = "red";
        context.textAlign = "center";
        context.fillText("Game Over", board.width/2, board.height/2);
        return;
    }

    // Snake
    updateSnake();

    // Food
    updateFood();

    // Check for gameover conditions
    checkGameOver();
}

function changeDirection(e) {
    // Move up
    if (e.code == "KeyW" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    }

    // Move down
    else if (e.code == "KeyS" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    }

    // Move left
    else if (e.code == "KeyA" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    }

    // Move right
    else if (e.code == "KeyD" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

function updateSnake() {
    // Updates snake position
    for (let i = snakeBody.length-1; i > 0; i--) {
        snakeBody[i] = snakeBody[i-1]
    }
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY]
    }
    snakeX += velocityX * blocksize;
    snakeY += velocityY * blocksize;

    // Draws snake
    context.fillStyle = "lime";
    context.fillRect(snakeX, snakeY, blocksize, blocksize);
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blocksize, blocksize)
    }
}

function placeFood() {
    // Generates food at random coordinates
    foodX = Math.floor(Math.random() * cols) * blocksize;
    foodY = Math.floor(Math.random() * rows) * blocksize;
}

function updateFood() {
    // Check if the snake ate the food and updates food position if needed
    if (snakeX == foodX && snakeY == foodY) {
        snakeBody.push([snakeX - velocityX, snakeY - velocityY])
        placeFood();
        score++;
        document.getElementById("snake-score").innerHTML = "Score: " + score;
    }

    // Draws food
    context.fillStyle = "red";
    context.fillRect(foodX, foodY, blocksize, blocksize);
}

function checkGameOver() {
    // Check if snake hit board boundary
    if (snakeX < 0 || snakeX > cols*blocksize || snakeY < 0 || snakeY > rows.blocksize) {
        gameOver = true;
    }

    // Check if snake hit own tail
    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            gameOver = true;
        }
    }
}