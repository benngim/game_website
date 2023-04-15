/* Implements tictactoe game */


/* Game variables */
var board;
var gameover;
var player1 = 'O';
var player2 = 'X';
var curPlayer = player1;

/* Win Patterns of Board */
var winpatterns = [
    /* Horizontal Win Patterns */
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    /* Vertical Win Patterns */
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    /* Diagonal Win Patterns */
    [0, 4, 8], [2, 4, 6]
]


window.onload = initialiseGame;

/* Set up game board for new game */
function initialiseGame() {
    gameover = false;
    board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

    for (let i = 0; i < board.length; i++) {
        let tile = document.getElementById("tile-"+i);
        tile.innerHTML = " ";
        tile.addEventListener("click", clickTile);
    }
}

/* Action when a tile is clicked */
function clickTile() {
    /* Gameover or game hasn't started */
    if (gameover) {
        return;
    }

    let tilenum = this.id.split("-")[1];

    /* Tile is not empty */
    if (board[tilenum] != " ") {
        return;
    }


    /* Update board */
    board[tilenum] = curPlayer;
    this.innerHTML = curPlayer;

    /* Check if current player won */
    checkWinner();

    /* Switch to next player */
    if (curPlayer == player1) {
        curPlayer = player2;
    }

    else {
        curPlayer = player1;
    }

}

/* Check for winner */
function checkWinner() {
    for (let i = 0; i < winpatterns.length; i++) {
        console.log("i = "+ i + " board: " + board[winpatterns[i][0]] + board[winpatterns[i][1]] + board[winpatterns[i][2]])
        if ((board[winpatterns[i][0]] == board[winpatterns[i][1]]) &&
            (board[winpatterns[i][1]] == board[winpatterns[i][2]]) &&
            (board[winpatterns[i][2]] == curPlayer)) {
            gameover = true;
            return;
        }
    }
}

