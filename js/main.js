var score = 0;
var scoreDistance = 0;
const scoreElement = document.getElementById("score");
const distanceElement = document.getElementById("distance");
const container = document.getElementById("container");

scoreElement.innerText = "score: " + score;
distanceElement.innerText = "Distance: " + scoreDistance + "m";

const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;
const messages = fetch("../content/messages.json")
  .then((response) => response.json())
  .then((messages) => {
    console.log(messages);
  })
  .catch((error) => console.error("Erreur de chargement du JSON:", error));

class Ball {
  constructor(container, xp, yp) {
    this.container = container;
    this.ball = document.createElement("div");
    this.ball.className = "ball";
    this.container.appendChild(this.ball);

    this.x = containerWidth * xp;
    this.y = containerHeight * yp;
    this.ballRadius = this.ball.offsetWidth / 2;

    this.ball.style.left = this.x - this.ballRadius + "px";
    this.ball.style.top = this.y - this.ballRadius + "px";
  }
}

document.addEventListener("keydown", (event) => {
  const center = containerHeight / 2;
  const levels = [center - 50, center, center + 50];

  let currentLevelIndex = levels.indexOf(ball1.y);

  switch (event.key) {
    case "ArrowUp":
      if (currentLevelIndex > 0) {
        ball1.y = levels[currentLevelIndex - 1];
      }
      break;
    case "ArrowDown":
      if (currentLevelIndex < levels.length - 1) {
        ball1.y = levels[currentLevelIndex + 1];
      }
      break;
  }
  ball1.ball.style.top = ball1.y - ball1.ballRadius + "px";
});

class Negative {
  constructor(container, yp, type) {
    this.container = container;
    this.type = type;
    this.negative = document.createElement("div");
    this.negative.className = "negative " + this.type;
    this.container.appendChild(this.negative);

    this.x = containerWidth;
    this.y = yp;
    this.dx = -2;
    this.negativeRadius = 10;

    this.negative.style.left = this.x - this.negativeRadius + "px";
    this.negative.style.top = this.y - this.negativeRadius + "px";

    this.moveNegative = this.moveNegative.bind(this);
    this.interval = setInterval(this.moveNegative, 10);
  }

  moveNegative() {
    if (this.x + this.dx < 0) {
      clearInterval(this.interval);
      this.container.removeChild(this.negative);
      return;
    }
    if (this.checkCollision(ball1)) {
      container.classList.add("apply-shake");
      score -= 10;
      scoreElement.innerText = "score: " + score;
      showPopup(this.type);

      setTimeout(() => {
        container.classList.remove("apply-shake");
      }, 820);
      clearInterval(this.interval);
      this.container.removeChild(this.negative);
    }

    this.x += this.dx;
    this.negative.style.left = this.x - this.negativeRadius + "px";
  }

  checkCollision(ball) {
    const distX = this.x - ball.x;
    const distY = this.y - ball.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance < this.negativeRadius + ball.ballRadius;
  }
}

class Increment {
  constructor(container, yp) {
    this.container = container;
    this.increment = document.createElement("div");
    this.increment.className = "increment ";
    this.container.appendChild(this.increment);

    this.x = containerWidth;
    this.y = yp;
    this.dx = -2;
    this.incrementRadius = 10;

    this.increment.style.left = this.x - this.incrementRadius + "px";
    this.increment.style.top = this.y - this.incrementRadius + "px";

    this.moveIncrement = this.moveIncrement.bind(this);
    this.interval = setInterval(this.moveIncrement, 10);
  }

  moveIncrement() {
    if (this.x + this.dx < 0) {
      clearInterval(this.interval);
      this.container.removeChild(this.increment);
      return;
    }
    if (this.checkCollision(ball1)) {
      score += 10;
      scoreElement.innerText = "score: " + score;
      clearInterval(this.interval);
      this.container.removeChild(this.increment);
    }

    this.x += this.dx;
    this.increment.style.left = this.x - this.incrementRadius + "px";
  }

  checkCollision(ball) {
    const distX = this.x - ball.x;
    const distY = this.y - ball.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance < this.incrementRadius + ball.ballRadius;
  }
}

function spawnNegative() {
  const center = containerHeight / 2;
  const levels = [center - 50, center, center + 50];
  const randomLevel = levels[Math.floor(Math.random() * levels.length)];

  const types = ["sac", "filet", "requin"];

  const randomType = types[Math.floor(Math.random() * types.length)];

  new Negative(container, randomLevel, randomType);
}

function spawnIncrement() {
  const center = containerHeight / 2;
  const levels = [center - 50, center, center + 50];
  const randomLevel = levels[Math.floor(Math.random() * levels.length)];

  new Increment(container, randomLevel);
}

// popup
function showPopup(type) {
  const popup = document.getElementById("popup");
  const popupText = document.getElementById("popup-text");

  const messages = {
    sac: "Un sac plastique ! Cela peut être confondu avec une méduse et être ingéré par une tortue.",
    filet: "Un filet de pêche ! Les tortues peuvent s'y retrouver piégées.",
    requin: "Un requin ! Attention aux prédateurs naturels.",
  };

  popupText.innerText = messages[type] || "Danger inconnu !";
  popup.style.display = "block";

  // Fermer la popup au clic sur la croix
  document.getElementById("close-popup").onclick = function () {
    popup.style.display = "none";
  };
}

setInterval(spawnIncrement, 1000);
setInterval(spawnNegative, 2000);

setInterval(() => {
  scoreDistance += 1;
  distanceElement.innerText = "Distance: " + scoreDistance + "m";
}, 400);

const ball1 = new Ball(container, 0.02, 0.5);
