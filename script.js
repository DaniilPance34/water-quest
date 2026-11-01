
let GOAL_CANS = 20;
let currentCans = 0;
let timeLeft = 30;
let gameActive = false;
let spawnInterval;
let timerInterval;
let spawnSpeed = 700;

// Difficulty settings
const difficulties = {
  easy: {
    goal: 10,
    time: 40,
    speed: 1000
  },
  normal: {
    goal: 20,
    time: 30,
    speed: 700
  },
  hard: {
    goal: 30,
    time: 25,
    speed: 500
  }
};

// Winning and losing messages
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

// Milestone messages for extra credit
const milestones = [
  "Great start! You passed the first milestone!",
  "Halfway there! Keep going!",
  "Almost there! You are close to winning!"
];

let reachedMilestones = [];

// Sound effects for extra credit
const clickSound = new Audio("sounds/click.mp3");
const collectSound = new Audio("sounds/collect.mp3");
const dirtySound = new Audio("sounds/miss.mp3");
const winSound = new Audio("sounds/win.mp3");

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(function() {
    // Continue playing if audio is unavailable
  });
}

// Creating the game grid
function createGrid() {
  const grid = document.querySelector(".game-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    grid.appendChild(cell);
  }
}

// Updating the score
function updateScore() {
  document.getElementById("current-cans").textContent = currentCans;
}

// Updating difficulty
function updateDifficulty() {
  const selected = document.getElementById("difficulty").value;
  const settings = difficulties[selected];

  GOAL_CANS = settings.goal;
  timeLeft = settings.time;
  spawnSpeed = settings.speed;

  document.getElementById("goal").textContent = GOAL_CANS;
  document.getElementById("timer").textContent = timeLeft;

  document.getElementById("game-goal").textContent =
    "Collect " + GOAL_CANS + " cans in " + timeLeft + " seconds!";
}

// Checking milestones
function checkMilestones() {
  const percentages = [0.25, 0.5, 0.75];

  for (let i = 0; i < percentages.length; i++) {
    const target = Math.ceil(GOAL_CANS * percentages[i]);

    if (currentCans >= target &&
        !reachedMilestones.includes(i)) {

      reachedMilestones.push(i);

      document.getElementById("achievements").textContent =
        milestones[i];
    }
  }
}

// Creating water cans
function spawnWaterCan() {
  if (!gameActive) return;

  const cells = document.querySelectorAll(".grid-cell");

  cells.forEach(function(cell) {
    const oldCan = cell.querySelector(".water-can");

    if (oldCan && !oldCan.classList.contains("dirty")) {
      playSound(dirtySound);
    }

    cell.innerHTML = "";
  });

  const randomCell =
    cells[Math.floor(Math.random() * cells.length)];

  // 20% chance of dirty water
  const isDirty = Math.random() < 0.2;

  const can = document.createElement("div");
  can.className = isDirty ? "water-can dirty" : "water-can";

  can.setAttribute("role", "button");
  can.setAttribute("tabindex", "0");
  can.setAttribute("aria-label",
    isDirty ? "Dirty water" : "Clean water can");

  function collectCan() {
    if (!gameActive || !can.isConnected) return;

    if (isDirty) {
      currentCans = Math.max(0, currentCans - 2);

      document.getElementById("achievements").textContent =
        "Oops! Dirty water! -2 points";

      playSound(dirtySound);
    } else {
      currentCans++;

      document.getElementById("achievements").textContent =
        "Great! +1 water can!";

      playSound(collectSound);
    }

    updateScore();

    // Remove the collected can from the DOM
    can.remove();

    if (currentCans >= GOAL_CANS) {
      endGame();
    } else if (!isDirty) {
      checkMilestones();
    }
  }

  can.addEventListener("click", collectCan);

  can.addEventListener("keydown", function(event) {
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

// Starting the game
function startGame() {
  if (gameActive) return;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  updateDifficulty();

  currentCans = 0;
  gameActive = true;
  reachedMilestones = [];

  updateScore();

  document.getElementById("achievements").textContent = "";
  document.getElementById("difficulty").disabled = true;
  document.getElementById("start-game").disabled = true;

  document.querySelectorAll(".celebration, .confetti")
    .forEach(function(item) {
      item.remove();
    });

  createGrid();
  spawnWaterCan();

  spawnInterval = setInterval(spawnWaterCan, spawnSpeed);

  timerInterval = setInterval(function() {
    timeLeft--;

    document.getElementById("timer").textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// Ending the game
function endGame() {
  if (!gameActive) return;

  gameActive = false;

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  document.getElementById("difficulty").disabled = false;
  document.getElementById("start-game").disabled = false;
  document.getElementById("start-game").textContent = "Play Again";

  document.querySelectorAll(".grid-cell").forEach(function(cell) {
    cell.innerHTML = "";
  });

  const won = currentCans >= GOAL_CANS;

  const messages = won ? winningMessages : losingMessages;

  const randomMessage =
    messages[Math.floor(Math.random() * messages.length)];

  document.getElementById("achievements").textContent = randomMessage;

  if (won) {
    playSound(winSound);
    celebrateWin();
  }
}

// Winning celebration
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

    setTimeout(function() {
      confetti.remove();
    }, 4000);
  }

  setTimeout(function() {
    celebration.remove();
  }, 4000);
}

// Resetting the game
function resetGame() {
  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  gameActive = false;
  currentCans = 0;
  reachedMilestones = [];

  updateDifficulty();
  updateScore();

  document.getElementById("achievements").textContent = "";
  document.getElementById("difficulty").disabled = false;
  document.getElementById("start-game").disabled = false;
  document.getElementById("start-game").textContent = "Start Game";

  document.querySelectorAll(".celebration, .confetti")
    .forEach(function(item) {
      item.remove();
    });

  createGrid();
}

// Buttons and difficulty selection
document.getElementById("start-game")
  .addEventListener("click", function() {
    playSound(clickSound);
    startGame();
  });

document.getElementById("reset-game")
  .addEventListener("click", function() {
    playSound(clickSound);
    resetGame();
  });

document.getElementById("difficulty")
  .addEventListener("change", function() {
    if (!gameActive) {
      updateDifficulty();
      currentCans = 0;
      reachedMilestones = [];
      updateScore();
      document.getElementById("achievements").textContent = "";
      document.getElementById("start-game").textContent = "Start Game";
      createGrid();
    }
  });

updateDifficulty();
createGrid();
