const canva = document.getElementById("gameCanvas");
const ctx = canva.getContext("2d");
const grid = 25;
const caseSize = canva.width / grid;
const snake = [
  { col: 2, row: 5 },
  { col: 2, row: 4 },
  { col: 2, row: 3 },
  { col: 2, row: 2 },
];
const dir = { dx: 1, dy: 0 };
let stepDelay = 200;
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
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
  }
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

// charging snake images
const imgHead = new Image();
imgHead.src = "./img/head.png";
const imgTail = new Image();
imgTail.src = "./img/tail2.png";
const imgBody = new Image();
imgBody.src = "./img/body2.png";
const imgCorner = new Image();
imgCorner.src = "./img/corner.png";

const foodImages = [
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
];
foodImages[0].src = "./img/pizza.png";
foodImages[1].src = "./img/burger.png";
foodImages[2].src = "./img/hotdog.png";
foodImages[3].src = "./img/rice.png";
foodImages[4].src = "./img/grapes.png";
foodImages[5].src = "./img/strawberry.png";

// draw a part of the snake or food
function drawPart(img, col, row, angle = 0) {
  ctx.save();
  ctx.translate(col * caseSize + caseSize / 2, row * caseSize + caseSize / 2);
  ctx.rotate(angle);
  ctx.drawImage(img, -caseSize / 2, -caseSize / 2, caseSize, caseSize);
  ctx.restore();
}

// add high score feature using localStorage
let highScore = localStorage.getItem("snakeHighScore")
  ? parseInt(localStorage.getItem("snakeHighScore"))
  : 0;

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
  }
}

let playerName = "";

const form = document.getElementById("playerForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  playerName = document.getElementById("playerName").value.trim() || "Anonyme";
  form.style.display = "none";
  canva.style.display = "";
});

// game loop
function frame(timestamp) {
  if (running && timestamp - lastStepTime >= stepDelay) {
    lastStepTime = timestamp;
    tick();
  }
  // clear the canvas
  ctx.clearRect(0, 0, canva.width, canva.height);
  ctx.fillStyle = "#15193a";
  ctx.fillRect(0, 0, canva.width, canva.height);

  // draw the snake
  snake.forEach((cell, i) => {
    let img = imgBody;
    let angle = 0;
    if (i === 0) {
      // head
      img = imgHead;
      const next = snake[1];
      if (next) {
        if (next.col < cell.col) angle = -Math.PI / 2;
        else if (next.col > cell.col) angle = Math.PI / 2;
        else if (next.row < cell.row) angle = 0;
        else if (next.row > cell.row) angle = Math.PI;
      }
    } else if (i === snake.length - 1) {
      // tail
      img = imgTail;
      const prev = snake[i - 1];
      if (prev) {
        if (prev.col < cell.col) angle = -Math.PI / 2;
        else if (prev.col > cell.col) angle = Math.PI / 2;
        else if (prev.row < cell.row) angle = 0;
        else if (prev.row > cell.row) angle = Math.PI;
      }
    } else {
      // body
      const prev = snake[i - 1];
      const next = snake[i + 1];
      if (prev && next) {
        if (prev.col === next.col) {
          img = imgBody;
          if (prev.row < cell.row) angle = Math.PI;
        } else if (prev.row === next.row) {
          img = imgBody;
          angle = Math.PI / 2;
        } else {
          // turns: detect the orientation and apply the correct image + angle
          // Case 1
          if (
            (prev.row > cell.row && next.col < cell.col) ||
            (next.row > cell.row && prev.col < cell.col)
          ) {
            img = imgCorner;
            angle = 0;
          }
          // Case 2
          else if (
            (prev.row > cell.row && next.col > cell.col) ||
            (next.row > cell.row && prev.col > cell.col)
          ) {
            img = imgCorner;
            angle = -Math.PI / 2;
          }
          // Case 3
          else if (
            (prev.row < cell.row && next.col < cell.col) ||
            (next.row < cell.row && prev.col < cell.col)
          ) {
            img = imgCorner;
            angle = Math.PI / 2;
          }
          // Case 4
          else if (
            (prev.row < cell.row && next.col > cell.col) ||
            (next.row < cell.row && prev.col > cell.col)
          ) {
            img = imgCorner;
            angle = Math.PI;
          }
        }
      }
    }
    drawPart(img, cell.col, cell.row, angle);
  });

  // show the score
  ctx.fillStyle = "#d3b4fcd8";
  ctx.font = "20px Montserrat, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Score : ${score}`, 10, 30);
  ctx.textAlign = "right";
  ctx.fillText(`Meilleur score : ${highScore}`, canva.width - 10, 30);
  ctx.textAlign = "left";

  // draw the food
  if (!food) {
    spawnFood();
  } else if (food && food.img) {
    drawPart(food.img, food.col, food.row);
  }

  // if the game is over, display a message
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
    onGameOver();
    return;
  }

  snake.unshift(headNext);

  // check for food collision
  if (eaten) {
    food = null;
    score += 1; // increase score
    stepDelay *= 0.97; // increase speed
  } else {
    snake.pop();
  }
  updateHighScore();
  console.log("score:", score);
  console.log("meilleur score:", highScore);
}

// check if two directions are opposite
function isOpposite(a, b) {
  if (a.dx + b.dx === 0 && a.dy + b.dy === 0) {
    return true;
  }
  return false;
}

// check if the snake hits itself
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
      img: foodImages[Math.floor(Math.random() * foodImages.length)],
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
  stepDelay = 200;
  lastStepTime = 0;
  running = true;
}

// supabase initialization
const SUPABASE_URL = "https://nsehvfxtwesojfmrivpq.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZWh2Znh0d2Vzb2pmbXJpdnBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTA2NzAsImV4cCI6MjA3MjY2NjY3MH0.YU_Rp5BGfbLUzFdPhHfQLNoAUMRl7RiDa8Nv3i_yGqw";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// send score to supabase
async function submitScore(name, score) {
  const { error } = await supabaseClient
    .from("score")
    .insert([{ name, score }]);
  if (error) {
    alert("Erreur lors de l'envoi du score !");
    console.error(error);
  }
}

// fetch top 10 leaderboard from supabase
async function fetchLeaderboard() {
  const { data, error } = await supabaseClient
    .from("score")
    .select("name, score")
    .order("score", { ascending: false })
    .limit(10);
  if (error) {
    alert("Erreur lors de la récupération du classement !");
    console.error(error);
    return [];
  }
  return data;
}

// display leaderboard
async function displayLeaderboard() {
  const leaderboard = await fetchLeaderboard();
  const div = document.getElementById("leaderboard");
  div.textContent = "";
  const title = document.createElement("h2");
  title.textContent = "🏆 Top 10 joueurs";
  div.appendChild(title);
  const ol = document.createElement("ol");
  leaderboard.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.name} : ${entry.score}`;
    ol.appendChild(li);
  });
  div.appendChild(ol);
}

// handle game over
async function onGameOver() {
  await submitScore(playerName, score);
  await displayLeaderboard();
}

displayLeaderboard();
