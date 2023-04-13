/* Implements Snake Game */

// Board variables
const BLOCKSIZE = 25;
const ROWS = 20;
const COLS = 20;
var board;
var context;

// Snake variables
var snakeX;
var snakeY;
var velocityX;
var velocityY;
var snakeBody;
const SNAKE_COLOR = "lime";

// Food variables
var foodX;
var foodY;
var specialFood = false;
var specialFoodSetting = "Off";
const REGULAR_FOOD_COLOR = "red";
const SPECIAL_FOOD_COLOR = "yellow";

// Game variables
var speed = 75;
var speedSetting = "Normal"
var gameOver;
var score;
var updateGameInteralId;


window.onload = startGame;

function startGame() {
    // Initialise new game
    board = document.getElementById("snake-board");
    board.height = ROWS * BLOCKSIZE;
    board.width = COLS * BLOCKSIZE;
    context = board.getContext("2d");
    gameOver = false;
    score = 0;
    placeFood();
    snakeX = BLOCKSIZE * 5;
    snakeY = BLOCKSIZE * 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = []
    updateButtons();
    document.addEventListener("keyup", respondKeyPress);
    updateGameInteralId = setInterval(update, speed);
}

function update() {
    // Draws board
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);

    // Gameover
    if (gameOver) {
        gameOverState();
        return;
    }

    // Snake
    updateSnake();

    // Food
    updateFood();

    // Score
    updateScore();

    // Check for gameover conditions
    checkGameOver();
}

function respondKeyPress(e) {
    // Currently in game over state
    if (gameOver) {
        // Retry button pressed
        if (e.code == "Space") {
            startGame();
        }
        return;
    }

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
    snakeX += velocityX * BLOCKSIZE;
    snakeY += velocityY * BLOCKSIZE;

    // Draws snake
    context.fillStyle = SNAKE_COLOR;
    context.fillRect(snakeX, snakeY, BLOCKSIZE, BLOCKSIZE);
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], BLOCKSIZE, BLOCKSIZE)
    }
}

function placeFood() {
    // Generates food at random coordinates
    foodX = Math.floor(Math.random() * COLS) * BLOCKSIZE;
    foodY = Math.floor(Math.random() * ROWS) * BLOCKSIZE;
    // Determines if food is special
    if (Math.floor(Math.random()*10) >= 9 && specialFoodSetting == "On") {
        specialFood = true;
    }
    else {
        specialFood = false;
    }
}

function updateFood() {
    // Check if the snake ate the food and updates food position if needed
    if (snakeX == foodX && snakeY == foodY) {
        score++;
        if (specialFood) {
            score += 2;
        }
        snakeBody.push([snakeX - velocityX, snakeY - velocityY])
        placeFood();
    }

    // Draws food
    context.fillStyle = REGULAR_FOOD_COLOR;
    if (specialFood) {
        context.fillStyle = SPECIAL_FOOD_COLOR;
    }
    context.fillRect(foodX, foodY, BLOCKSIZE, BLOCKSIZE);
}

function checkGameOver() {
    // Check if snake hit board boundary
    console.log("snakeX= " + snakeX);
    console.log("snakeY= " + snakeY);
    if (snakeX < 0 || snakeX >= COLS*BLOCKSIZE || snakeY < 0 || snakeY >= ROWS*BLOCKSIZE) {
        gameOver = true;
    }

    // Check if snake hit own tail
    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            gameOver = true;
        }
    }
}

function gameOverState() {
    // Display gameover screen and stop running the game
    context.font = "64px Courier New";
    context.fillStyle = "red";
    context.textAlign = "center";
    context.fillText("Game Over", board.width/2, board.height/2);
    context.font = "24px Courier New";
    context.fillText("Press 'space' to retry", board.width/2, board.height/2 + 32);
    updateScore();
    clearInterval(updateGameInteralId);
}

function updateScore() {
    context.font = "15px Courier New";
    context.fillStyle = "white";
    context.textAlign = "left";
    context.fillText("Score: " + score, 10, 20);
}

function toggleSpeedSetting() {
    // Toggle speed to next speed (slow-normal-fast)
    if (speedSetting == "Slow") {
        speedSetting = "Normal";
        speed = 75;
    }
    else if (speedSetting == "Normal") {
        speedSetting = "Fast";
        speed = 50;
    }
    else if (speedSetting == "Fast") {
        speedSetting = "Slow";
        speed = 100;
    }
    clearInterval(updateGameInteralId);
    updateGameInteralId = setInterval(update, speed);
    updateButtons();
}

function toggleFoodSetting() {
    if (specialFoodSetting == "Off") {
        specialFoodSetting = "On";
    }
    else {
        specialFoodSetting = "Off"
    }
    updateButtons();
}

function updateButtons() {
    document.getElementById("snake-speed-button").innerHTML = "Game Speed: " + speedSetting;
    document.getElementById("snake-food-button").innerHTML = "Special Food: " + specialFoodSetting;
}