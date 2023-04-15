var board;
var gamestart = false;
var gameover = false;
var player1 = 'O';
var player2 = 'X';
var curPlayer = player1;

window.onload = initialiseGame;

/* Set up game board for new game */
function initialiseGame() {
    board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
    console.log(board.length)

    for (let i = 0; i < board.length; i++) {
        let tile = document.getElementById("tile-"+i);
        tile.innerHTML = " ";
        tile.addEventListener(onclick, clickTile);
    }
}


