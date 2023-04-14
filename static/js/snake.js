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

// Food variables
var foodX;
var foodY;
var specialFoodX;
var specialFoodY;
var specialFood = false;
var specialFoodSetting = "Off";

// Game variables
var speed = 75;
var speedSetting = "Normal"
var gameOver;
var score;
var updateGameInteralId;

// Enemy variables
var enemyOn = false;
var enemySetting = "Off";
var enemies;

// Sound effects
var soundSetting = "Off";
var gameOverSound = new Audio("/static/sounds/gameover-sound.mp3");
gameOverSound.volume = 0.2;
var eatSound = new Audio("/static/sounds/eat-sound.mp3");
eatSound.volume = 0.7;
var clickSound = new Audio("/static/sounds/click-sound.mp3");
clickSound.volume = 0.5;

// Background Music
var bgmSetting = 0;
var bgm = new Audio();
bgm.loop = true;
bgm.volume = 0.5;

// Color theme
var color_theme = 1;
var snake_color= "lime";
var regular_food_color = "red";
var special_food_color = "yellow";
var enemy_color = "steelblue";
var board_color = "black";
var score_color = "white";

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
    placeEnemies();
    snakeX = BLOCKSIZE * 5;
    snakeY = BLOCKSIZE * 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    updateButtons();
    document.addEventListener("keyup", respondKeyPress);
    updateGameInteralId = setInterval(update, speed);
}

function update() {
    // Draws board
    context.fillStyle = board_color;
    context.fillRect(0, 0, board.width, board.height);

    // Gameover
    if (gameOver) {
        gameOverState();
        return;
    }

    // Snake
    updateSnake();

    // Check if snake ate food
    checkFoodCollision();

    // Food
    updateFood();

    // Enemies
    updateEnemies();

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
    context.fillStyle = snake_color;
    context.fillRect(snakeX, snakeY, BLOCKSIZE, BLOCKSIZE);
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], BLOCKSIZE, BLOCKSIZE)
    }
}

function placeFood() {
    // Generates food at random coordinates
    foodX = Math.floor(Math.random() * COLS) * BLOCKSIZE;
    foodY = Math.floor(Math.random() * ROWS) * BLOCKSIZE;

    // Determines if special food is generated
    if (Math.floor(Math.random()*10) >= 9 && specialFoodSetting == "On") {
        specialFoodX = Math.floor(Math.random() * COLS) * BLOCKSIZE;
        specialFoodY = Math.floor(Math.random() * ROWS) * BLOCKSIZE;
        specialFood = true;
    }
    else {
        specialFood = false;
    }
}

function checkFoodCollision() {
    // Check if the snake ate regular food
    if (snakeX == foodX && snakeY == foodY) {
        if (soundSetting == "On") {
            eatSound.play();
        }
        score++;
        snakeBody.push([snakeX - velocityX, snakeY - velocityY])
        placeFood();
        placeEnemies();
    }
    // Check if the snake ate special food
    if (snakeX == specialFoodX && snakeY == specialFoodY && specialFood) {
        if (soundSetting == "On") {
            eatSound.play();
        }
        score+= 3;
        snakeBody.push([snakeX - velocityX, snakeY - velocityY])
        placeFood();
        placeEnemies();
    }
}

function updateFood() {
    // Draws food
    context.fillStyle = regular_food_color;
    context.beginPath();
    context.arc(foodX+BLOCKSIZE/2, foodY+BLOCKSIZE/2, BLOCKSIZE/2, 0, 2*Math.PI);
    context.fill();

    if (specialFood) {
        context.fillStyle = special_food_color;
        context.beginPath();
        context.arc(specialFoodX+BLOCKSIZE/2, specialFoodY+BLOCKSIZE/2, BLOCKSIZE/2, 0, 2*Math.PI);
        context.fill();
    }
}

function placeEnemies() {
    enemies = [];

    // Enemies are turned off
    if (!enemyOn) {
        return;
    }

    // Generates three enemies at random coordinates
    for (let i = 0; i < 3; i++) {
        var enemyX = Math.floor(Math.random() * COLS) * BLOCKSIZE;
        var enemyY = Math.floor(Math.random() * ROWS) * BLOCKSIZE;

        // Ensure enemy is not spawned on food location or in path of snake head
        while ((enemyX == foodX && enemyY == foodY) || (enemyX == snakeX) || (enemyY == snakeY) 
        || (specialFood && enemyX == specialFoodX && enemyY == specialFoodY)) {
            enemyX = Math.floor(Math.random() * COLS) * BLOCKSIZE;
            enemyY = Math.floor(Math.random() * ROWS) * BLOCKSIZE;
        }
        enemies.push([enemyX, enemyY]);
    }
}

function updateEnemies() {
    // Draws enemies
    context.fillStyle = enemy_color;
    for (let i = 0; i < enemies.length; i++) {
        context.fillRect(enemies[i][0], enemies[i][1], BLOCKSIZE, BLOCKSIZE);
    }
}

function checkGameOver() {
    // Check if snake hit board boundary
    console.log("snakeX= " + snakeX);
    console.log("snakeY= " + snakeY);
    if (snakeX < 0 || snakeX >= COLS*BLOCKSIZE || snakeY < 0 || snakeY >= ROWS*BLOCKSIZE) {
        if (soundSetting == "On") {
            gameOverSound.play();
        }
        gameOver = true;
    }

    // Check if snake hit own tail
    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            if (soundSetting == "On") {
                gameOverSound.play();
            }
            gameOver = true;
        }
    }

    // Check if snake hit enemy
    for (let i = 0; i < enemies.length; i++) {
        if (snakeX == enemies[i][0] && snakeY == enemies[i][1]) {
            if (soundSetting == "On") {
                gameOverSound.play();
            }
            gameOver = true;
        }
    }
}

function gameOverState() {
    // Display gameover screen and stop running the game
    context.font = "64px Courier New";
    context.fillStyle = regular_food_color;
    context.textAlign = "center";
    context.fillText("Game Over", board.width/2, board.height/2);
    context.font = "24px Courier New";
    context.fillText("Press 'space' to retry", board.width/2, board.height/2 + 32);
    updateScore();
    clearInterval(updateGameInteralId);
}

function updateScore() {
    context.font = "15px Courier New";
    context.fillStyle = score_color;
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

function toggleEnemySetting() {
    if (enemyOn) {
        enemyOn = false;
        enemySetting = "Off";
    }
    else {
        enemyOn = true;
        enemySetting = "On";
    }
    placeEnemies();
    updateButtons();
}

function toggleColorTheme() {
    if (color_theme == 1) {
        color_theme = 2;
        snake_color = "darkmagenta";
        regular_food_color = "gold";
        special_food_color = "cyan";
        enemy_color = "teal";
        board_color = "black";
        score_color = "white";
    }
    else if (color_theme == 2) {
        color_theme = 3;
        snake_color = "lightgray";
        regular_food_color = "mediumaquamarine";
        special_food_color = "darkslategray";
        enemy_color = "mediumpurple";
        board_color = "black";
        score_color = "white";
    }
    else if (color_theme == 3) {
        color_theme = 4;
        snake_color = "darkkhaki";
        regular_food_color = "ghostwhite";
        special_food_color = "chocolate";
        enemy_color = "seagreen";
        board_color = "black";
        score_color = "white";

    }
    else if (color_theme == 4) {
        color_theme = 1;
        snake_color = "lime";
        regular_food_color = "red";
        special_food_color = "yellow";
        enemy_color = "steelblue";
        board_color = "black";
        score_color = "white";
    }
    updateButtons();
}

function toggleSoundSetting() {
    if (soundSetting == "Off") {
        soundSetting = "On";
    }
    else {
        soundSetting = "Off"
    }
    updateButtons();
}

function toggleBgmSetting() {
    if (bgmSetting == 0) {
        bgm.src = "/static/bgm/clockTowerTheme.mp3";
        bgm.play();
        bgmSetting = 1;
    }
    else if (bgmSetting == 1) {
        bgm.pause();
        bgm.src = "/static/bgm/cookieTheme.mp3";
        bgm.play();
        bgmSetting = 2;
    }
    else if (bgmSetting == 2) {
        bgm.pause();
        bgm.src = "/static/bgm/electricFountainTheme.mp3";
        bgm.play();
        bgmSetting = 3;
    }
    else if (bgmSetting == 3) {
        bgm.pause();
        bgm.src = "/static/bgm/pacmanTheme.mp3";
        bgm.play();
        bgmSetting = 4;
    }
    else if (bgmSetting == 4) {
        bgm.pause();
        bgm.src = "/static/bgm/snakeTheme.mp3";
        bgm.play();
        bgmSetting = 5;
    }
    else if (bgmSetting == 5) {
        bgm.pause();
        bgm.src = "/static/bgm/swampTheme.mp3";
        bgm.play();
        bgmSetting = 6;
    }
    else if (bgmSetting == 6) {
        bgm.pause();
        bgmSetting = 0;
    }
    updateButtons();
}

function updateButtons() {
    if (soundSetting == "On") {
        clickSound.pause();
        clickSound.currentTime = 0;
        clickSound.play();
    }
    document.getElementById("snake-speed-button").innerHTML = "Game Speed: " + speedSetting;
    document.getElementById("snake-food-button").innerHTML = "Special Food: " + specialFoodSetting;
    document.getElementById("snake-enemy-button").innerHTML = "Enemies: " + enemySetting;
    document.getElementById("snake-color-button").innerHTML = "Color Theme: " + color_theme;
    document.getElementById("snake-sound-button").innerHTML = "Sound Effects: " + soundSetting;
    if (bgmSetting == 0) {
        document.getElementById("snake-bgm-button").innerHTML = "BGM: Off";
    }
    else {
        document.getElementById("snake-bgm-button").innerHTML = "BGM: Theme " + bgmSetting;
    }
}