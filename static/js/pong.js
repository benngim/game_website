/* Implements Pong Game */

// Game variables
const BLOCKSIZE = 25;
const BALLSIZE = 15;
const ROWS = 20;
const COLS = 50;
const PADDLE_SIZE = 3;
var board;
var context;
var gameId;
var gameOver = true;
var p1Score;
var p2Score;
var scoreSetting = 3;
var winner;

// Player variables
var p1_x;
var p1_y;
var p2_x;
var p2_y;

// Survival mode variable
var survivalMode = false;

// Movement variables
const controller = {
    "KeyW": {pressed: false}, // P1 Up
    "KeyS": {pressed: false}, // P1 Down
    "KeyI": {pressed: false}, // P2 Up
    "KeyK": {pressed: false}, // P2 Down
}

// Ball variables
var ball_x;
var ball_y;
var ball_direction;
var ball_xSpeed;
var ball_ySpeed;

// Color theme
var color_theme = 1;
var paddle_color = "white";
var ball_color = "steelblue";
var net_color = "white";
var board_color = "black";


window.onload = initialiseGame;

function initialiseGame() {
    // Get board
    board = document.getElementById("pong-board");
    board.height = ROWS * BLOCKSIZE;
    board.width = COLS * BLOCKSIZE;
    context = board.getContext("2d");

    // Initialise position variables
    p1_x = 2 * BLOCKSIZE;
    p1_y = (ROWS/2 - 2) * BLOCKSIZE;
    p2_x = (COLS - 3) * BLOCKSIZE;
    p2_y = (ROWS/2 - 2) * BLOCKSIZE;

    // Initialise score
    p1Score = "";
    p2Score = "";

    // Adds event listener for keyboard press and release
    document.addEventListener("keydown", (e) => {
        if(controller[e.code]) {
            controller[e.code].pressed = true;
        }
    });
    document.addEventListener("keyup", (e) => {
        if(controller[e.code]) {
            controller[e.code].pressed = false;
        }
    });
    
    // Draws game elements
    drawGame();
}

/* Draws all game elements */
function drawGame() {
    // Draw board
    context.fillStyle = board_color;
    context.fillRect(0, 0, board.width, board.height);

    // Draw score
    context.font = "45px Courier New";
    context.fillStyle = net_color;
    context.textAlign = "left";
    context.fillText(p1Score, 20, 45);
    // Don't draw 2p score if playing survival mode
    if (!survivalMode) {
        context.textAlign = "right";
        context.fillText(p2Score, COLS*BLOCKSIZE - 20, 45);
    }

    // Display winner text on gameover
    if (gameOver && winner != null) {
        drawGameOver();
        return;
    }

    // Draw net
    context.strokeStyle = net_color;
    context.setLineDash([BLOCKSIZE, BLOCKSIZE]);
    context.lineWidth = BLOCKSIZE/5 - 1;
    context.beginPath();
    context.moveTo((COLS/2) * BLOCKSIZE, BLOCKSIZE/2);
    context.lineTo((COLS/2) * BLOCKSIZE, ROWS * BLOCKSIZE);
    context.stroke();

    // Draw paddles
    context.fillStyle = paddle_color;
    context.fillRect(p1_x + BLOCKSIZE/2, p1_y, BLOCKSIZE/2, BLOCKSIZE * PADDLE_SIZE);
    context.fillRect(p2_x, p2_y, BLOCKSIZE/2, BLOCKSIZE * PADDLE_SIZE);

    // Survival Mode - Draw wall
    if (survivalMode) {
        context.fillRect(p2_x, 0, board.width, board.height);
    }

    // Draw ball
    context.fillStyle = ball_color;
    context.fillRect(ball_x, ball_y, BALLSIZE, BALLSIZE);
}

/* Moves player paddles */
function updatePaddles() {
    // Update paddle positions
    if (controller["KeyW"].pressed == true) {
        p1_y += -1 * BLOCKSIZE/3;
    }
    if (controller["KeyS"].pressed == true) {
        p1_y += BLOCKSIZE/3;
    }
    if (controller["KeyI"].pressed == true) {
        p2_y += -1 * BLOCKSIZE/3;
    }
    if (controller["KeyK"].pressed == true) {
        p2_y += BLOCKSIZE/3;
    }

    // Ensure paddles don't go out of bound
    if (p1_y <= 0) {
        p1_y = 0;
    }
    else if(p1_y >= board.height - (BLOCKSIZE * PADDLE_SIZE)) {
        p1_y = board.height - (BLOCKSIZE * PADDLE_SIZE);
    }
    if (p2_y <= 0) {
        p2_y = 0;
    }
    else if(p2_y >= board.height - (BLOCKSIZE * PADDLE_SIZE)) {
        p2_y = board.height - (BLOCKSIZE * PADDLE_SIZE);
    }
}

/* Generates new ball at center of screen with random velocity and direction */
function generateBall() {
    // Set initial xspeed and random yspeed
    ball_xSpeed = 6;
    ball_ySpeed = 0;
    while (ball_ySpeed == 0) {
        ball_ySpeed = Math.floor(15*Math.random() - 7);
    }
    ball_x = (COLS/2) * BLOCKSIZE;
    ball_y = (ROWS/2) * BLOCKSIZE;

    // Set random initial ball direction, set to left initially if survival mode
    if (Math.floor(2 * Math.random() + 1) == 1 || survivalMode) {
        ball_direction = "Left";
    }
    else {
        ball_direction = "Right";
    }
}

/* Updates ball position */
function updateBall() {
    if (ball_direction == "Left") {
        ball_x += -1 * ball_xSpeed;
    }
    else {
        ball_x += ball_xSpeed;
    }
    ball_y += ball_ySpeed;
}

/* Checks for ball collision */
function checkCollisions() {

    // Check if ball hit p1 paddle, update score if survival mode
    if ((ball_x >= (p1_x + BLOCKSIZE/2)) && (ball_x <= (p1_x + BLOCKSIZE))
    && (ball_y >= p1_y) && ball_y <= (p1_y + BLOCKSIZE * PADDLE_SIZE)) {
        while (ball_ySpeed == 0) {
            ball_ySpeed = Math.floor(15*Math.random() - 7);
        }
        ball_direction = "Right";
        if (survivalMode) {
            updateScore(1);
        }
    }

    // Check if ball hit p2 paddle
    if ((ball_x >= (p2_x - BALLSIZE)) && (ball_x <= (p2_x + BLOCKSIZE/2 - BALLSIZE))
    && (ball_y >= p2_y) && ball_y <= (p2_y + BLOCKSIZE * PADDLE_SIZE)) {
        while (ball_ySpeed == 0) {
            ball_ySpeed = Math.floor(15*Math.random() - 7);
        }
        ball_direction = "Left";
    }

    // Survival Mode - Check if ball hit wall
    if ((ball_x >= (p2_x - BALLSIZE)) && (ball_y >= 0) && ball_y <= (board.height) && survivalMode) {
        while (ball_ySpeed == 0) {
            ball_ySpeed = Math.floor(15*Math.random() - 7);
        }
        ball_direction = "Left";
    }

    // Check if ball hit vertical wall
    if (ball_y < 0 || ball_y >= ROWS * BLOCKSIZE - BALLSIZE) {
        ball_ySpeed = -ball_ySpeed;
    }

    // Check if ball hit p1 wall
    if (ball_x < 0 - BALLSIZE) {
        // Game ends in survival mode
        if (survivalMode) {
            winner = 3;
            gameOver = true;
            return;
        }
        updateScore(2);
    }

    // Check if ball hit p2 wall
    if (ball_x >= COLS * BLOCKSIZE) {
        updateScore(1);
    }
}

/* Updates score and resests ball when player scores */
function updateScore(player) {
    if (player == 1) {
        p1Score += 1;
        // Only update score if in surival mode
        if (survivalMode) {
            return;
        }

        if (p1Score == scoreSetting) {
            winner = 1;
            gameOver = true;
            return;
        }
        generateBall();
    }
    else {
        p2Score += 1;
        if (p2Score == scoreSetting) {
            winner = 2;
            gameOver = true;
            return;
        }
        generateBall();
    }
}

/* Start game */
function startGame() {
    if (!gameOver) {
        return;
    }
    if (gameId != null) {
        cancelAnimationFrame(gameId);
    }
    generateBall();
    initialiseGame();
    p1Score = 0;
    p2Score = 0;
    gameOver = false;
    gameId = requestAnimationFrame(playGame);
}

/* Play game */
function playGame() {
    updatePaddles();
    updateBall();
    checkCollisions();
    drawGame();
    if (!gameOver) {
        gameId = requestAnimationFrame(playGame);
    }
}

/* Render gameover screen */
function drawGameOver() {
    // Display winner
    context.font = "64px Courier New";
    context.fillStyle = ball_color;
    context.textAlign = "center";

    if (survivalMode) {
        context.fillText("Gameover!", board.width/2, board.height/2);
        return;
    }

    if (winner == 1) {
        context.fillText("Player 1 Wins!", board.width/2, board.height/2);
    }
    else if (winner == 2) {
        context.fillText("Player 2 Wins!", board.width/2, board.height/2);
    }
}

/* Change score setting */
function toggleScoreSetting() {
    if (!gameOver) {
        return;
    }
    if (scoreSetting == 3) {
        scoreSetting = 5;
        document.getElementById("pong-score-button").innerHTML = "Score Setting: FT5";
    }
    else if (scoreSetting == 5) {
        scoreSetting = 7;
        document.getElementById("pong-score-button").innerHTML = "Score Setting: FT7";
    }
    else if (scoreSetting == 7) {
        scoreSetting = 10;
        document.getElementById("pong-score-button").innerHTML = "Score Setting: FT10";
    }
    else {
        scoreSetting = 3;
        document.getElementById("pong-score-button").innerHTML = "Score Setting: FT3";
    }
}

/* Toggle game mode */
function toggleGameMode() {
    if (!gameOver) {
        return;
    }
    if (!survivalMode) {
        survivalMode = true;
        document.getElementById("pong-mode-button").innerHTML = "Game Mode: Survival";
    }
    else {
        survivalMode = false;
        document.getElementById("pong-mode-button").innerHTML = "Game Mode: Multiplayer"
    }
    winner = null;
    initialiseGame();
}

function toggleColor() {
    if (color_theme == 1) {
        color_theme = 2;
        paddle_color = "#0C0404";
        ball_color = "#8E340b";
        net_color = "#FCF9C2";
        board_color = "#4E2728";
        document.getElementById("pong-color-button").innerHTML = "Color: 2";
    }
    else if (color_theme == 2) {
        color_theme = 3;
        paddle_color = "#3A4928";
        ball_color = "#907A48";
        net_color = "#3B2E1E";
        board_color = "#4B6B3C";
        document.getElementById("pong-color-button").innerHTML = "Color: 3";
    }
    else if (color_theme == 3) {
        color_theme = 4;
        paddle_color = "#026EC9";
        ball_color = "#5831A5";
        net_color = "#F7FEE0";
        board_color = "#96DEBF";
        document.getElementById("pong-color-button").innerHTML = "Color: 4";
    }
    else if (color_theme == 4) {
        color_theme = 5;
        paddle_color = "#ED82A9";
        ball_color = "#A18060";
        net_color = "#CCCCCC";
        board_color = "#815CAB";
        document.getElementById("pong-color-button").innerHTML = "Color: 5";
    }
    else if (color_theme == 5) {
        color_theme = 6;
        paddle_color = "#F2BA29";
        ball_color = "#354045";
        net_color = "#17171C";
        board_color = "#995C15";
        document.getElementById("pong-color-button").innerHTML = "Color: 6";
    }
    else {
        color_theme = 1;
        paddle_color = "white";
        ball_color = "steelblue";
        net_color = "white";
        board_color = "black";
        document.getElementById("pong-color-button").innerHTML = "Color: 1";
    }
    if (gameOver) {
        drawGame();
    }
}