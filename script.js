const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const retryBtn = document.getElementById("retryBtn");
const touchButtons = document.querySelectorAll(".control-btn");
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || ("ontouchstart" in window);

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

function setDirection(nextDirection) {
  if (nextDirection === "LEFT" && direction !== "RIGHT") direction = "LEFT";
  else if (nextDirection === "UP" && direction !== "DOWN") direction = "UP";
  else if (nextDirection === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
  else if (nextDirection === "DOWN" && direction !== "UP") direction = "DOWN";
}

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") setDirection("LEFT");
  else if (event.key === "ArrowUp") setDirection("UP");
  else if (event.key === "ArrowRight") setDirection("RIGHT");
  else if (event.key === "ArrowDown") setDirection("DOWN");
});

touchButtons.forEach(btn => {
  btn.addEventListener("click", () => setDirection(btn.dataset.dir));
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    setDirection(btn.dataset.dir);
  }, { passive: false });
});

// Retry button click
retryBtn.addEventListener("click", initGame);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!direction) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    const startMsg = isTouchDevice ? "Swipe or use touch buttons to start" : "Swipe or use arrows to start";
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
