const cells = document.querySelectorAll('[data-cell]');
const gameStatus = document.getElementById('gameStatus');
const restartButton = document.getElementById('restartButton');
const singlePlayerButton = document.getElementById('singlePlayer');
const twoPlayersButton = document.getElementById('twoPlayers');

let currentPlayer = 'X'; // Player X always starts
let isGameActive = false; // Game starts inactive until a mode is selected
let isSinglePlayerMode = false; // Flag to track if AI should play
const board = ['', '', '', '', '', '', '', '', ''];

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Handle player's move
function handleClick(e) {
    const cell = e.target;
    const cellIndex = Array.from(cells).indexOf(cell);

    if (board[cellIndex] !== '' || !isGameActive || (isSinglePlayerMode && currentPlayer !== 'X')) {
        return;
    }

    updateCell(cell, cellIndex);
    checkWinner();

    // In single player mode, after Player X's move, let AI (O) make a move
    if (isGameActive && isSinglePlayerMode && currentPlayer === 'O') {
        setTimeout(() => aiMove(), 500); // AI moves after a short delay
    }
}

// Update the board and UI for the current player's move
function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
}

// Switch to the next player
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    gameStatus.textContent = `Player ${currentPlayer}'s Turn`;
}

// Check for a winner or a draw
function checkWinner() {
    let gameWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameWon = true;
            break;
        }
    }

    if (gameWon) {
        gameStatus.textContent = `Player ${currentPlayer} wins!`;
        isGameActive = false;
    } else if (!board.includes('')) {
        gameStatus.textContent = 'It\'s a draw!';
        isGameActive = false;
    } else {
        switchPlayer();
    }
}

// Restart the game
function restartGame() {
    currentPlayer = 'X'; // X always starts
    isGameActive = true; // Set game to active
    board.fill(''); // Clear the board
    gameStatus.textContent = `Player X's Turn`; // Reset game status
    cells.forEach(cell => (cell.textContent = '')); // Clear cell text
}

// AI's move using Minimax Algorithm
function aiMove() {
    if (!isGameActive) return; // Exit if game is already over

    const bestMove = minimax(board, 'O').index;
    const cell = cells[bestMove];
    currentPlayer = 'O'; // AI is always O
    updateCell(cell, bestMove);
    checkWinner();

    if (isGameActive) {
        currentPlayer = 'X'; // After AI move, switch to human
        gameStatus.textContent = `Player X's Turn`;
    }
}

// Minimax algorithm
function minimax(newBoard, player) {
    const availSpots = newBoard.map((val, index) => val === '' ? index : null).filter(val => val !== null);

    // Check for terminal states (win/loss/draw)
    if (checkWin(newBoard, 'X')) return { score: -10 };
    if (checkWin(newBoard, 'O')) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };

    const moves = [];

    // Loop through available spots
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i]; // Store the index of the spot

        // Temporarily make the move
        newBoard[availSpots[i]] = player;

        // Recursively call minimax for the opponent's turn
        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        // Undo the move
        newBoard[availSpots[i]] = '';

        // Add the move to the array of moves
        moves.push(move);
    }

    // Find the best move for the player (max for 'O' and min for 'X')
    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

// Check if a player has won
function checkWin(board, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true;
        }
    }
    return false;
}

// Set game mode (Single Player vs AI or Two Players)
function selectGameMode(mode) {
    if (mode === 'single') {
        isSinglePlayerMode = true;
        restartGame(); // Start a fresh game for single-player mode
        singlePlayerButton.classList.add('active');
        twoPlayersButton.classList.remove('active');
    } else {
        isSinglePlayerMode = false;
        restartGame(); // Start a fresh game for two-player mode
        twoPlayersButton.classList.add('active');
        singlePlayerButton.classList.remove('active');
    }
}

// Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleClick));
restartButton.addEventListener('click', restartGame);
singlePlayerButton.addEventListener('click', () => selectGameMode('single'));
twoPlayersButton.addEventListener('click', () => selectGameMode('two'));
