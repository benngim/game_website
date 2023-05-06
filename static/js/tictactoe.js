/* Implements tictactoe game */


/* Game variables */
var board;
var gameover;
var player1 = 'O';
var player2 = 'X';
var curPlayer = player1;
var cpuMode = false;
var cpuLv = 1;
var cpuPlayer;
var clickable;

/* Color variable */
var theme = 1;
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
    curPlayer = player1;
    board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
    setTheme();

    for (let i = 0; i < board.length; i++) {
        let tile = document.getElementById("tile-"+i);
        tile.innerHTML = " ";
        tile.addEventListener("click", makeMove);
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
    var tileid;

    if (cpuLv == 0) {
        tileid = getRandomMove();
    }
    else if (cpuLv == 1) {
        tileid = "tile-" + minimaxMove(2, true, board)[1];
    }
    else if (cpuLv == 2) { 
        tileid = "tile-" + minimaxMove(7, true, board)[1];
    }
    tile = document.getElementById(tileid).click();
}

/* Chooses a random move from remaining valid moves */
function getRandomMove() {
    let valid_moves = getValidMoves(board);
    let move = valid_moves[Math.floor(Math.random() * valid_moves.length)];

    return "tile-" + move;
}

/* Get all remaining valid moves */
function getValidMoves(board) {
    let valid_moves = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] == " ") {
            valid_moves.push(i);
        }
    }

    return valid_moves;
}

/* Returns copy of board */
function copy_board(board) {
    let board_copy = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] == " ") {
            board_copy.push(" ");
        }
        else if (board[i] == player1) {
            board_copy.push(player1);
        }
        else {
            board_copy.push(player2);
        }
    }

    return board_copy;
}

/* Use minmax algorithm to search for move based on given depth */
function minimaxMove(depth, maximising, board) {
    let valid_moves = getValidMoves(board);
    let best_evaluation = 2;
    if (maximising) {
        best_evaluation = -2;
    }
    let best_move = valid_moves[0];
    let board_copy = copy_board(board);

    for (let i=0; i < valid_moves.length; i++) {
        if (maximising) {
            cur_evaluation = evaluateMove(board_copy, valid_moves[i], curPlayer);
            if (cur_evaluation == 1) {
                return [cur_evaluation, valid_moves[i]];
            }
            if (depth != 1 && (valid_moves.length > 1)) {
                board_copy[valid_moves[i]] = curPlayer;
                cur_evaluation = minimaxMove(depth - 1, false, board_copy)[0];
                board_copy[valid_moves[i]] = " ";
            }
            if (cur_evaluation >= best_evaluation) {
                best_evaluation = cur_evaluation;
                best_move = valid_moves[i];
            }
        }
        else {
            if (curPlayer == player1) {
                opp_player = player2;
            }
            else {
                opp_player = player1;
            }
            cur_evaluation = -1 * evaluateMove(board_copy, valid_moves[i], opp_player);
            if (cur_evaluation == -1) {
                return [cur_evaluation, valid_moves[i]];
            }
            if (depth != 1 && (valid_moves.length > 1)) {
                board_copy[valid_moves[i]] = opp_player;
                cur_evaluation = minimaxMove(depth - 1, true, board_copy)[0];
                board_copy[valid_moves[i]] = " ";
            }
            if (cur_evaluation <= best_evaluation) {
                best_evaluation = cur_evaluation;
                best_move = valid_moves[i];
            }

        }
    }

    return [best_evaluation, best_move];
}

/* Simple valuation function for minimax */
function evaluateMove(board, move, player) {
    board[move] = player;

    /* Evaluation is 1 for win, 0 for anything else */
    if (checkWinner(board, player) >= 0) {
        evaluation = 1;
    }
    else {
        evaluation = 0;
    }
    board[move] = " ";
    return evaluation;
}

/* Action when a tile is clicked */
function makeMove() {
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

    /* Check if current player won */
    let winner = checkWinner(board, curPlayer);
    if (winner >= 0) {
        clickable = false;
        gameover = true;
        var win_color;
        if (player1 == curPlayer) {
            win_color = player1_wincol;
            if (cpuMode && (player1 == cpuPlayer)) {
                document.getElementById("gamelog").innerHTML = "CPU Wins";
            }
            else {
                document.getElementById("gamelog").innerHTML = "Player 1 Wins";
            }
        }
        else {
            win_color = player2_wincol;
            if (cpuMode && (player2 == cpuPlayer)) {
                document.getElementById("gamelog").innerHTML = "CPU Wins";
            }
            else {
                document.getElementById("gamelog").innerHTML = "Player 2 Wins";
            }
        }
        document.getElementById("tile-"+[winpatterns[winner][0]]).style.backgroundColor = win_color;
        document.getElementById("tile-"+[winpatterns[winner][1]]).style.backgroundColor = win_color;
        document.getElementById("tile-"+[winpatterns[winner][2]]).style.backgroundColor = win_color;
        fetch("/tictactoe",
        {
            method: "POST",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
        })
        return;
    }

    /* Check if there is a tie */
    if (checkTie(board)) {
        clickable = false;
        gameover = true;
        document.getElementById("gamelog").innerHTML = "Draw";
        fetch("/tictactoe",
        {
            method: "POST",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
        })
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
function checkWinner(board, player) {
    for (let i = 0; i < winpatterns.length; i++) {
        if ((board[winpatterns[i][0]] == board[winpatterns[i][1]]) &&
            (board[winpatterns[i][1]] == board[winpatterns[i][2]]) &&
            (board[winpatterns[i][2]] == player)) {
            return i;
        }
    }
    return -1;
}

/* Check if game ended in tie */
function checkTie(board) {
    for (let i = 0; i < board.length; i++) {
        if (board[i] == " ") {
            return false;
        }
    }
    return true;
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

/* Toggle color theme */
function toggleTheme() {
    if (!gameover) {
        return;
    }
    if (theme == 1) {
        theme = 2;
        player1_col = 'lightblue';
        player1_wincol = 'deepskyblue';
        player2_col = 'burlywood';
        player2_wincol = 'chocolate';
        board_color = 'saddlebrown';
        line_color = 'sandybrown';
        document.getElementById("tictactoe-color-button").innerHTML = "Color Theme: 2";
    }
    else if (theme == 2) {
        theme = 3;
        player1_col = 'mediumpurple';
        player1_wincol = 'purple';
        player2_col = 'magenta';
        player2_wincol = 'darkmagenta';
        board_color = 'rebeccapurple';
        line_color = 'pink';
        document.getElementById("tictactoe-color-button").innerHTML = "Color Theme: 3";
    }

    else if (theme == 3) {
        theme = 4;
        player1_col = 'lightgreen';
        player1_wincol = 'forestgreen';
        player2_col = 'yellow';
        player2_wincol = 'goldenrod';
        board_color = 'darkgreen';
        line_color = 'darkkhaki';
        document.getElementById("tictactoe-color-button").innerHTML = "Color Theme: 4";
    }

    else if (theme == 4) {
        theme = 5;
        player1_col = 'steelblue';
        player1_wincol = 'darkslategray';
        player2_col = 'seashell';
        player2_wincol = 'lightslategray';
        board_color = 'aquamarine';
        line_color = 'aliceblue';
        document.getElementById("tictactoe-color-button").innerHTML = "Color Theme: 5";
    }

    else {
        theme = 1;
        player1_col = 'red';
        player1_wincol = 'darkred';
        player2_col = 'blue';
        player2_wincol = 'darkblue';
        board_color = 'black';
        line_color = 'oldlace';
        document.getElementById("tictactoe-color-button").innerHTML = "Color Theme: 1";
    }

    initialiseGame();
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

/* Toggle cpu difficulty */
function toggleCPULevel() {
    if (!gameover) {
        return;
    }

    if (cpuLv == 0) {
        cpuLv = 1;
        document.getElementById("tictactoe-cpuLv-button").innerHTML = "CPU Level: Normal";
    }

    else if (cpuLv == 1) {
        cpuLv = 2;
        document.getElementById("tictactoe-cpuLv-button").innerHTML = "CPU Level: Unbeatable";
    }

    else {
        cpuLv = 0;
        document.getElementById("tictactoe-cpuLv-button").innerHTML = "CPU Level: Easy";
    }
}

