/* Implements tictactoe game */


/* Game variables */
var board;
var gameover;
var player1 = 'O';
var player2 = 'X';
var curPlayer = player1;
var cpuMode = false;
var cpuPlayer;
var clickable;

/* Color variable */
var player1_col = 'red';
var player1_wincol = 'darkred';
var player2_col = 'blue';
var player2_wincol = 'darkblue';
var board_color = 'black';
var line_color = 'oldlace';

/* Win Patterns of Board */
var winpatterns = [
    /* Horizontal Win Patterns */
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    /* Vertical Win Patterns */
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    /* Diagonal Win Patterns */
    [0, 4, 8], [2, 4, 6]
];


window.onload = initialiseGame;

/* Set up game board for new game */
function initialiseGame() {
    gameover = true;
    clickable = true;
    board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
    setTheme();

    for (let i = 0; i < board.length; i++) {
        let tile = document.getElementById("tile-"+i);
        tile.innerHTML = " ";
        tile.addEventListener("click", humanMove);
    }
    document.getElementById("gamelog").innerHTML = " ";
}

/* Start game based on game mode chosen */
function startGame() {
    if (cpuMode) {
        playGameCPU();
    }
    else {
        playGame();
    }
}

/* Start new game against human player */
function playGame() {
    if (!gameover) {
        return;
    }
    initialiseGame();
    gameover = false;
    document.getElementById("gamelog").innerHTML = "Player 1's Turn";
}

/* Start new game against computer player */
function playGameCPU() {
    if (!gameover) {
        return;
    }
    initialiseGame();
    gameover = false;

    // Sets cpu to random player
    let cpuNumber = Math.floor(Math.random() * 2) + 1;
    if (cpuNumber == 1) {
        clickable = false;
        cpuPlayer = player1;
        document.getElementById("gamelog").innerHTML = "CPU's Turn";
        setTimeout(cpuMove, 500);
    }
    else {
        clickable = true;
        cpuPlayer = player2;
        document.getElementById("gamelog").innerHTML = "Player 1's Turn";
    }
}

/* Cpu places a move */
function cpuMove() {
    clickable = true;
    let tileid = getRandomMove();
    tile = document.getElementById(tileid).click();
}

/* Chooses a random move from remaining valid moves */
function getRandomMove() {
    /* Get list of all valid moves */
    let valid_moves = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] == " ") {
            valid_moves.push(i);
        }
    }

    let move = valid_moves[Math.floor(Math.random() * valid_moves.length)];

    return "tile-" + move;
}

/* Action when a tile is clicked */
function humanMove() {
    /* Gameover or cpu move */
    if (gameover || !clickable) {
        return;
    }

    clickable = false;
    let tilenum = this.id.split("-")[1];

    /* Tile is not empty */
    if (board[tilenum] != " ") {
        return;
    }

    /* Update board */
    board[tilenum] = curPlayer;
    var current_color;
    if (player1 == curPlayer) {
        current_color = player1_col;
    }
    else {
        current_color = player2_col;
    }
    this.style.color = current_color;
    this.innerHTML = curPlayer;

    /* Check if current player won or if there is a tie */
    checkWinner();
    checkTie();
    if (gameover) {
        return;
    }

    /* Switch to next player */
    if (curPlayer == player1) {
        curPlayer = player2;
        if ((curPlayer == cpuPlayer) && cpuMode) {
            document.getElementById("gamelog").innerHTML = "CPU's turn";
            setTimeout(cpuMove, 500);
        }
        else {
            document.getElementById("gamelog").innerHTML = "Player 2's Turn";
            clickable = true;
        }
    }

    else {
        curPlayer = player1;
        if ((curPlayer == cpuPlayer) && cpuMode) {
            document.getElementById("gamelog").innerHTML = "CPU's turn";
            setTimeout(cpuMove, 500);
        }
        else {
            document.getElementById("gamelog").innerHTML = "Player 1's Turn";
            clickable = true;
        }
    }
}

/* Check for winner */
function checkWinner() {
    for (let i = 0; i < winpatterns.length; i++) {
        if ((board[winpatterns[i][0]] == board[winpatterns[i][1]]) &&
            (board[winpatterns[i][1]] == board[winpatterns[i][2]]) &&
            (board[winpatterns[i][2]] == curPlayer)) {
            gameover = true;
            var win_color;
            if (player1 == curPlayer) {
                win_color = player1_wincol;
                document.getElementById("gamelog").innerHTML = "Player 1 Wins";
            }
            else {
                win_color = player2_wincol;
                document.getElementById("gamelog").innerHTML = "Player 2 Wins";
            }
            document.getElementById("tile-"+[winpatterns[i][0]]).style.backgroundColor = win_color;
            document.getElementById("tile-"+[winpatterns[i][1]]).style.backgroundColor = win_color;
            document.getElementById("tile-"+[winpatterns[i][2]]).style.backgroundColor = win_color;
            return;
        }
    }
}

/* Check if game ended in tie */
function checkTie() {
    for (let i = 0; i < board.length; i++) {
        if (board[i] == " ") {
            return;
        }
    }
    gameover = true;
    document.getElementById("gamelog").innerHTML = "Draw";
    return;
}

/* Sets game color theme */
function setTheme() {
    document.querySelectorAll('.tictactoe-tile, .tictactoe-board').forEach(tile => {
        tile.style.backgroundColor = board_color;
        tile.style.borderColor = line_color;
    }); 
    document.getElementById("gamelog").style.backgroundColor = line_color;
    document.getElementById("gamelog").style.color = board_color;
}

/* Toggle game mode */
function toggleGameMode() {
    if (!gameover) {
        return;
    }

    if (cpuMode) {
        cpuMode = false;
        document.getElementById("tictactoe-mode-button").innerHTML = "Game Mode: Multiplayer";
    }
    else {
        cpuMode = true;
        document.getElementById("tictactoe-mode-button").innerHTML = "Game Mode: Vs CPU";
    }
}

