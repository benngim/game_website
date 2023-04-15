var board;
var gameover;
var player1 = 'O';
var player2 = 'X';
var curPlayer = player1;

window.onload = initialiseGame;

/* Set up game board for new game */
function initialiseGame() {
    gameover = false;
    board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
    console.log(board.length)

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


    /* Update board and curplayer */
    board[tilenum] = curPlayer;
    this.innerHTML = curPlayer;

    if (curPlayer == player1) {
        curPlayer = player2;
    }

    else {
        curPlayer = player1;
    }

    checkWinner();
}

/* Check for winner */
function checkWinner() {
    return;
}

