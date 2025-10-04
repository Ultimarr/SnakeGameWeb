// script.js - draws checkerboard on canvas and runs the game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const popup = document.getElementById('popup');
const gameOverScreen = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const scoreDisplay = document.getElementById('score');

const gridSize = 32;
const canvasSize = 640;
canvas.width = canvasSize;
canvas.height = canvasSize;
const cellSize = canvasSize / gridSize; // 20 px per cell

// colors for checkerboard
const lightGreen = '#3fa34d';  // softer, less neon
const darkGreen = '#1f522a';  // deeper, not too black

let snake, food, direction, nextDirection, gameStarted, score, gameOver, tickTimeout;

function init() {
    snake = [{ x: 32, y: 32 }];       // start center
    direction = { x: 1, y: 0 };       // start moving right
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameStarted = false;
    gameOver = false;
    scoreDisplay.textContent = 'Score: 0';
    popup.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');

    // place food not on snake
    food = randomFoodPosition();

    // draw initial frame
    draw();
}

function randomFoodPosition() {
    let pos;
    while (true) {
        pos = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
        // ensure not on snake
        let onSnake = snake.some(s => s.x === pos.x && s.y === pos.y);
        if (!onSnake) return pos;
    }
}

function drawCheckerboard() {
    // draw checkerboard squares aligned to cellSize
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            ctx.fillStyle = ((x + y) % 2 === 0) ? lightGreen : darkGreen;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function draw() {
    // draw background checkerboard
    drawCheckerboard();

    // draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);

    // draw snake
    ctx.fillStyle = 'blue';
    snake.forEach(seg => {
        ctx.fillRect(seg.x * cellSize, seg.y * cellSize, cellSize, cellSize);
    });
}

function move() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // wrap around edges
    head.x = (head.x + gridSize) % gridSize;
    head.y = (head.y + gridSize) % gridSize;

    // self-collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    // eat food?
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
        food = randomFoodPosition();
    } else {
        snake.pop();
    }
}

function endGame() {
    gameOver = true;
    gameStarted = false;
    clearTimeout(tickTimeout);
    popup.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScore.textContent = `Points Earned: ${score}`;
}

function loop() {
    if (!gameStarted || gameOver) return;
    direction = nextDirection;
    move();
    draw();
    tickTimeout = setTimeout(loop, 100); // control speed here
}

// handle input (WASD + arrows). prevent arrow scrolling.
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        e.preventDefault();
    }

    // start the game on first key press
    if (!gameStarted && !gameOver) {
        gameStarted = true;
        popup.classList.add('hidden');
        loop();
    }

    if (['ArrowUp', 'w', 'W'].includes(key) && direction.y === 0) nextDirection = { x: 0, y: -1 };
    if (['ArrowDown', 's', 'S'].includes(key) && direction.y === 0) nextDirection = { x: 0, y: 1 };
    if (['ArrowLeft', 'a', 'A'].includes(key) && direction.x === 0) nextDirection = { x: -1, y: 0 };
    if (['ArrowRight', 'd', 'D'].includes(key) && direction.x === 0) nextDirection = { x: 1, y: 0 };
});

// restart button
restartBtn.addEventListener('click', () => {
    clearTimeout(tickTimeout);
    init();
});

// kick things off
init();