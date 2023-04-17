/* Implements Pong Game */

// Board variables
const BLOCKSIZE = 25;
const BALLSIZE = 15;
const ROWS = 20;
const COLS = 50;
const PADDLE_SIZE = 3;
var board;
var context;
var gameOver = false;

// Player variables
var p1_x;
var p1_y;
var p2_x;
var p2_y;

// Ball variables
var ball_x;
var ball_y;

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
    p2_x = (COLS - 2) * BLOCKSIZE;
    p2_y = (ROWS/2 - 2) * BLOCKSIZE;
    ball_x = (COLS/2 + 1) * BLOCKSIZE;
    ball_y = (ROWS/2 - 1) * BLOCKSIZE;

    // Draws game elements
    drawGame();

}

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
    context.fillRect(p2_x - BLOCKSIZE/2, p2_y, BLOCKSIZE/2, BLOCKSIZE * PADDLE_SIZE);

    // Draw ball
    context.fillStyle = ball_color;
    context.fillRect(ball_x, ball_y, BALLSIZE, BALLSIZE);
}