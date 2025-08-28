const canva = document.getElementById("gameCanvas");
const ctx = canva.getContext("2d");
const grid = 20;
const caseSize = canva.width / grid;
const snake = [
  { col: 2, row: 5 },
  { col: 2, row: 4 },
  { col: 2, row: 3 },
  { col: 2, row: 2 },
];
const dir = { dx: 1, dy: 0 };
const stepDelay = 200;
let lastStepTime = 0;
let pendingDir = null;
let food = null;
let score = 0;
let running = true;

// draw the initial game state
ctx.fillStyle = "#15193a";
ctx.fillRect(0, 0, canva.width, canva.height);

// handle keyboard input
document.addEventListener("keydown", (event) => {
  if (pendingDir) return;
  switch (event.key) {
    case "ArrowUp":
    case "z":
    case "Z":
      if (!isOpposite(dir, { dx: 0, dy: -1 })) {
        pendingDir = { dx: 0, dy: -1 };
      }
      break;
    case "ArrowDown":
    case "s":
    case "S":
      if (!isOpposite(dir, { dx: 0, dy: 1 })) {
        pendingDir = { dx: 0, dy: 1 };
      }
      break;
    case "ArrowLeft":
    case "q":
    case "Q":
      if (!isOpposite(dir, { dx: -1, dy: 0 })) {
        pendingDir = { dx: -1, dy: 0 };
      }
      break;
    case "ArrowRight":
    case "d":
    case "D":
      if (!isOpposite(dir, { dx: 1, dy: 0 })) {
        pendingDir = { dx: 1, dy: 0 };
      }
      break;
    case "r":
    case "R":
      reset();
      break;
  }
});

// game loop
function frame(timestamp) {
  if (running && timestamp - lastStepTime >= stepDelay) {
    lastStepTime = timestamp;
    tick();
  }
  ctx.clearRect(0, 0, canva.width, canva.height);
  ctx.fillStyle = "#15193a";
  ctx.fillRect(0, 0, canva.width, canva.height);
  snake.forEach((cell) => drawCell(cell.col, cell.row));

  // show the score
  const scoreText = `score : ${score}`;
  ctx.fillStyle = "#ba85ffd8";
  ctx.font = "20px Arial";
  ctx.fillText(scoreText, 10, 30);

  // draw the food
  if (!food) {
    spawnFood();
  } else {
    drawCell(food.col, food.row, food.color);
  }

  if (!running) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, canva.width, canva.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "GAME OVER — R pour rejouer",
      canva.width / 2,
      canva.height / 2
    );
    ctx.restore();
  }

  // request the next animation frame
  requestAnimationFrame(frame);
}

// start the game loop
requestAnimationFrame(frame);

// draw each cell of the snake
function drawCell(col, row, color = "#1ddd2dff") {
  const x_px = col * caseSize;
  const y_px = row * caseSize;
  ctx.fillStyle = color;
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

  // wrap the head position
  const headNext = {
    col: (head.col + grid) % grid,
    row: (head.row + grid) % grid,
  };

  const eaten = food && headNext.col === food.col && headNext.row === food.row;

  // check for self-collision
  if (hitItself(headNext, eaten)) {
    running = false;
    return;
  }

  snake.unshift(headNext);

  // check for food collision
  if (eaten) {
    food = null;
    score += 1;
  } else {
    snake.pop();
  }
  console.log("Score:", score);
}

// check if two directions are opposite
function isOpposite(a, b) {
  if (a.dx + b.dx === 0 && a.dy + b.dy === 0) {
    return true;
  }
  return false;
}

function hitItself(headNext, willGrow) {
  const body = willGrow ? snake : snake.slice(0, snake.length - 1);
  return body.some(
    (cell) => cell.col === headNext.col && cell.row === headNext.row
  );
}

// add a new food item
function spawnFood() {
  let newFood;
  do {
    newFood = {
      col: Math.floor(Math.random() * grid),
      row: Math.floor(Math.random() * grid),
      color:
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0"),
    };
  } while (
    snake.some((cell) => cell.col === newFood.col && cell.row === newFood.row)
  );
  food = newFood;
}

// reset the game state
function reset() {
  snake.length = 0;
  snake.push(
    { col: 2, row: 5 },
    { col: 2, row: 4 },
    { col: 2, row: 3 },
    { col: 2, row: 2 }
  );
  dir.dx = 1;
  dir.dy = 0;
  pendingDir = null;
  food = null;
  score = 0;
  lastStepTime = 0;
  running = true;
}
