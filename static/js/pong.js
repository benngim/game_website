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

// Player variables
var p1_x;
var p1_y;
var p2_x;
var p2_y;

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
var ball_ySpeed;
const BALL_XSPEED = 4;

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

    context.fillStyle = paddle_color;
    context.fillRect(p1_x * BLOCKSIZE, p1_y * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE * PADDLE_SIZE);

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

    // Draw ball
    context.fillStyle = ball_color;
    context.fillRect(ball_x, ball_y, BALLSIZE, BALLSIZE);

    // Draw score
    context.font = "45px Courier New";
    context.fillStyle = net_color;
    context.textAlign = "left";
    context.fillText(p1Score, 20, 45);
    context.textAlign = "right";
    context.fillText(p2Score, COLS*BLOCKSIZE - 20, 45);
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
    ball_ySpeed = 0;
    while (ball_ySpeed == 0) {
        ball_ySpeed = Math.floor(9*Math.random() - 4);
    }
    ball_x = (COLS/2) * BLOCKSIZE;
    ball_y = (ROWS/2) * BLOCKSIZE;

    if (Math.floor(2 * Math.random() + 1) == 1) {
        ball_direction = "Left";
    }
    else {
        ball_direction = "Right";
    }
}

/* Updates ball position */
function updateBall() {
    if (ball_direction == "Left") {
        ball_x += -1 * BALL_XSPEED;
    }
    else {
        ball_x += BALL_XSPEED;
    }
    ball_y += ball_ySpeed;
}

/* Checks for ball collision */
function checkCollisions() {
    // Check if ball hit p1 paddle
    if ((ball_x >= (p1_x + BLOCKSIZE/2)) && (ball_x <= (p1_x + BLOCKSIZE))
    && (ball_y >= p1_y) && ball_y <= (p1_y + BLOCKSIZE * PADDLE_SIZE)) {
        ball_direction = "Right";
        ball_ySpeed = -ball_ySpeed;
    }

    // Check if ball hit p1 paddle
    if ((ball_x >= (p2_x - BALLSIZE)) && (ball_x <= (p2_x + BLOCKSIZE/2 - BALLSIZE))
    && (ball_y >= p2_y) && ball_y <= (p2_y + BLOCKSIZE * PADDLE_SIZE)) {
        ball_direction = "Left";
        ball_ySpeed = -ball_ySpeed;
    }

    // Check if ball hit vertical wall
    if (ball_y < 0 || ball_y >= ROWS * BLOCKSIZE - BALLSIZE) {
        ball_ySpeed = -ball_ySpeed;
    }

    // Check if ball hit p1 wall
    if (ball_x < 0 - BALLSIZE) {
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
        if (p1Score == 3) {
            gameOver = true;
            return;
        }
        generateBall();
    }
    else {
        p2Score += 1;
        if (p2Score == 3) {
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