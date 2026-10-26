const GOAL_CANS = 20;
let currentCans = 0;
let timeLeft = 30;
let gameActive = false;
let spawnInterval;
let timerInterval;

const winningMessages = [
  "Amazing! You are a Water Quest champion!",
  "Great job! You reached the clean water goal!",
  "You won! Every drop matters!"
];

const losingMessages = [
  "Good try! Play again and collect more cans!",
  "Time is up! You can do better next time!",
  "Keep trying! Every drop counts!"
];

function createGrid() {
  const grid = document.querySelector(".game-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    grid.appendChild(cell);
  }
}

function updateScore() {
  document.getElementById("current-cans").textContent = currentCans;
}

function spawnWaterCan() {
  if (!gameActive) return;

  const cells = document.querySelectorAll(".grid-cell");

  cells.forEach(cell => {
    cell.innerHTML = "";
  });

  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // 20% chance of dirty water
  const isDirty = Math.random() < 0.2;

  const can = document.createElement("div");
  can.className = isDirty ? "water-can dirty" : "water-can";
  can.setAttribute("role", "button");
  can.setAttribute("tabindex", "0");
  can.setAttribute("aria-label", isDirty ? "Dirty water" : "Clean water can");

  function collectCan() {
    if (!gameActive || !can.isConnected) return;

    if (isDirty) {
      currentCans = Math.max(0, currentCans - 2);
      document.getElementById("achievements").textContent =
        "Oops! Dirty water! -2 points";
    } else {
      currentCans++;
      document.getElementById("achievements").textContent =
        "Great! +1 water can!";
    }

    updateScore();
    can.remove();

    if (currentCans >= GOAL_CANS) {
      endGame();
    }
  }

  can.addEventListener("click", collectCan);
  can.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      collectCan();
    }
  });

  const wrapper = document.createElement("div");
  wrapper.className = "water-can-wrapper";
  wrapper.appendChild(can);
  randomCell.appendChild(wrapper);
}

function startGame() {
  if (gameActive) return;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  currentCans = 0;
  timeLeft = 30;
  gameActive = true;

  updateScore();
  document.getElementById("timer").textContent = timeLeft;
  document.getElementById("achievements").textContent = "";

  createGrid();
  spawnWaterCan();

  spawnInterval = setInterval(spawnWaterCan, 700);

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}
function endGame() {
  if (!gameActive) return;

  gameActive = false;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  document.querySelectorAll(".grid-cell").forEach(cell => {
    cell.innerHTML = "";
  });

  const messages = currentCans >= GOAL_CANS
    ? winningMessages
    : losingMessages;

  const randomMessage = messages[
    Math.floor(Math.random() * messages.length)
  ];

  document.getElementById("achievements").textContent = randomMessage;

  if (currentCans >= GOAL_CANS) {
    celebrateWin();
  }
}

function celebrateWin() {
  const celebration = document.createElement("div");
  celebration.className = "celebration";
  celebration.textContent = "🏆 AMAZING! YOU WON! 🎉";

  document.querySelector(".container").appendChild(celebration);

  const colors = ["#FFC907", "#2E9DF7", "#4FCB53", "#FF902A"];

  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 1.5 + "s";

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 4000);
  }

  setTimeout(() => {
    celebration.remove();
  }, 4000);
}

function resetGame() {
  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  gameActive = false;
  currentCans = 0;
  timeLeft = 30;

  updateScore();
  document.getElementById("timer").textContent = timeLeft;
  document.getElementById("achievements").textContent = "";

  document.querySelectorAll(".celebration").forEach(item => {
    item.remove();
  });

  createGrid();
}

document.getElementById("start-game").addEventListener("click", startGame);
document.getElementById("reset-game").addEventListener("click", resetGame);

createGrid();