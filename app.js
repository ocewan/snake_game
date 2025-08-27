const canva = document.getElementById("gameCanvas");
const ctx = canva.getContext("2d");
const grid = 20;
const caseSize = canva.width / grid;
const snake = [
  { col: 2, row: 5 },
  { col: 2, row: 4 },
  { col: 2, row: 3 },
  { col: 2, row: 2 },
  { col: 2, row: 1 },
  { col: 2, row: 0 },
];
const dir = { dx: 1, dy: 0 };
const stepDelay = 200;
let lastStepTime = 0;
let pendingDir = null;

// draw the initial game state
ctx.fillStyle = "#15193a";
ctx.fillRect(0, 0, canva.width, canva.height);

// handle keyboard input
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      if (!isOpposite(dir, { dx: 0, dy: -1 })) {
        pendingDir = { dx: 0, dy: -1 };
      }
      break;
    case "ArrowDown":
      if (!isOpposite(dir, { dx: 0, dy: 1 })) {
        pendingDir = { dx: 0, dy: 1 };
      }
      break;
    case "ArrowLeft":
      if (!isOpposite(dir, { dx: -1, dy: 0 })) {
        pendingDir = { dx: -1, dy: 0 };
      }
      break;
    case "ArrowRight":
      if (!isOpposite(dir, { dx: 1, dy: 0 })) {
        pendingDir = { dx: 1, dy: 0 };
      }
      break;
  }
});

// game loop
function frame(timestamp) {
  if (timestamp - lastStepTime >= stepDelay) {
    lastStepTime = timestamp;
    tick();
  }
  ctx.clearRect(0, 0, canva.width, canva.height);
  ctx.fillStyle = "#15193a";
  ctx.fillRect(0, 0, canva.width, canva.height);
  snake.forEach((cell) => drawCell(cell.col, cell.row));

  requestAnimationFrame(frame);
}

// start the game loop
requestAnimationFrame(frame);

// draw each cell of the snake
function drawCell(col, row) {
  const x_px = col * caseSize;
  const y_px = row * caseSize;
  ctx.fillStyle = "#1ddd2dff";
  ctx.fillRect(x_px, y_px, caseSize, caseSize);
}

// update the game state
function tick() {
  if (pendingDir) {
    dir.dx = pendingDir.dx;
    dir.dy = pendingDir.dy;
    pendingDir = null;
  }
  const head = { col: snake[0].col + dir.dx, row: snake[0].row + dir.dy };
  snake.unshift(head);
  snake.pop();
}

// check if two directions are opposite
function isOpposite(a, b) {
  if (a.dx + b.dx === 0 && a.dy + b.dy === 0) {
    return true;
  }
  return false;
}
