const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const retryBtn = document.getElementById("retryBtn");

let box = 20; // grid size
let gridWidth, gridHeight;
let snake, direction, food, score, game;
let highScore = localStorage.getItem('snakeHighScore') || 0;

document.getElementById("highScore").innerText = "High Score: " + highScore;

function initGame() {
  snake = [{ x: Math.floor(gridWidth / 2) * box, y: Math.floor(gridHeight / 2) * box }];
  direction = null;
  food = {
    x: Math.floor(Math.random() * gridWidth) * box,
    y: Math.floor(Math.random() * gridHeight) * box
  };
  score = 0;
  document.getElementById("score").innerText = "Score: " + score;
  retryBtn.style.display = "none";

  if (game) clearInterval(game);
  game = setInterval(draw, 100);
}

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// Retry button click
retryBtn.addEventListener("click", initGame);

let touchStartX = 0, touchStartY = 0;

canvas.addEventListener("touchstart", function(e) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener("touchend", function(e) {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal swipe
    if (dx > 30 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < -30 && direction !== "RIGHT") direction = "LEFT";
  } else {
    // Vertical swipe
    if (dy > 30 && direction !== "UP") direction = "DOWN";
    else if (dy < -30 && direction !== "DOWN") direction = "UP";
  }
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!direction) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    const startMsg = "Press an arrow key to start";
    const startTextWidth = ctx.measureText(startMsg).width;
    ctx.fillText(startMsg, (canvas.width - startTextWidth) / 2, canvas.height / 2);
    return;
  }

  // Draw snake
  snake.forEach((s, i) => {
    ctx.fillStyle = (i === 0) ? "lime" : "green";
    ctx.fillRect(s.x, s.y, box, box);
  });

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // Snake head
  let head = { ...snake[0] };
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "DOWN") head.y += box;

  // Collision
  if (
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width || head.y >= canvas.height ||
    snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    clearInterval(game);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    const msg = "Game Over! Final Score: " + score;
    const textWidth = ctx.measureText(msg).width;
    ctx.fillText(msg, (canvas.width - textWidth) / 2, canvas.height / 2);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snakeHighScore', highScore);
      document.getElementById("highScore").innerText = "High Score: " + highScore;
    }
    retryBtn.style.display = "inline-flex"; // show retry button
    return;
  }

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").innerText = "Score: " + score;
    food = {
      x: Math.floor(Math.random() * gridWidth) * box,
      y: Math.floor(Math.random() * gridHeight) * box
    };
  } else {
    snake.pop();
  }

  snake.unshift(head);
}

function resizeCanvas() {
  // Set canvas size to fit window, but keep it square and a multiple of box
  const minDim = Math.min(window.innerWidth, window.innerHeight, 500);
  canvas.width = Math.floor(minDim / box) * box;
  canvas.height = Math.floor(minDim / box) * box;
  gridWidth = canvas.width / box;
  gridHeight = canvas.height / box;
}

window.addEventListener("resize", () => {
  resizeCanvas();
  initGame();
});

// Start first game
resizeCanvas();
initGame();
