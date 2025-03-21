// Variables de jeu
let isPaused = true; // Indique si le jeu est en pause (ex. lors d'une popup)

let openedPopups = new Set(); // Stocke les popups déjà affichées pour éviter les doublons
let gameMode = "ocean"; // Mode actuel du jeu (ocean ou safari)

// Son
const oceanSound = document.getElementById("oceanSound");
oceanSound.volume = 0.1;
document.getElementById("toggleSound").addEventListener("click", () => {
  if (oceanSound.paused) {
    oceanSound.play();
  } else {
    oceanSound.pause();
  }
});


// Vitesse apparition des objets
let negativeSpawnRate = 2000; // Temps initial entre chaque Negative (2s)

let negativeInterval = setInterval(spawnNegative, negativeSpawnRate);


// Score et distance
var score = 0;
var scoreDistance = 0;
const scoreElement = document.getElementById("score");
const distanceElement = document.getElementById("distance");
const container = document.getElementById("container");

// Mise à jour de l'affichage du score et de la distance
scoreElement.innerText = "score: " + score;
distanceElement.innerText = "Distance: " + scoreDistance + "m";

// Taille du terrain de jeu
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

// Démarrer le jeu
document.getElementById("playButton").addEventListener("click", startGame);

function startGame() {
  // Audio
  oceanSound.play();
  oceanSound.volume = 0.5;
  // Cacher le bouton Play
  document.getElementById("playButton").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  // Démarrer les différents éléments du jeu
  isPaused = false;
  negativeInterval = setInterval(spawnNegative, negativeSpawnRate);
  spawnIncrement();

  // Afficher la balle
  ball1.ball.style.display = "block";

  // Réinitialiser score et distance
  score = 0;
  scoreDistance = 0;
  scoreElement.innerText = "score: " + score;
  distanceElement.innerText = "Distance: " + scoreDistance + "m";
}

// Classe Ball : Représente le joueur
class Ball {
  constructor(container, xp, yp) {
    this.container = container;
    this.ball = document.createElement("div");
    this.ball.className = "turtle";
    this.container.appendChild(this.ball);

    // Position initiale
    this.x = containerWidth * xp;
    this.y = containerHeight * yp;
    this.ballRadius = 20;

    this.updatePosition();
    this.startAnimation();
  }

  updatePosition() {
    this.ball.style.left = this.x - this.ballRadius + "px";
    this.ball.style.top = this.y - this.ballRadius + "px";
  }

  startAnimation() {
    setInterval(() => {
      this.ball.dataset.frame = (parseInt(this.ball.dataset.frame || 0) + 1) % 2;
      this.ball.style.backgroundPosition = `-${this.ball.dataset.frame * 40}px 0`;
    }, 200); // Change de frame toutes les 150ms
  }
}

// Contrôles du joueur
document.addEventListener("keydown", (event) => {
  const levels = [
    containerHeight - 190,
    containerHeight - 120,
    containerHeight - 50
  ];

  let currentLevelIndex = levels.indexOf(ball1.y);

  if (gameMode === "ocean") {
    // Mode océan : le joueur peut monter et descendre
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
  } else if (gameMode === "safari") {
    // Mode safari : le joueur peut seulement sauter
    if (event.key === " " && !ball1.isJumping) {
      ball1.isJumping = true;
      let jumpHeight = 80;
      let startY = ball1.y;

      // Animation du saut
      let upInterval = setInterval(() => {
        if (ball1.y > startY - jumpHeight) {
          ball1.y -= 5;
          ball1.ball.style.top = ball1.y - ball1.ballRadius + "px";
        } else {
          clearInterval(upInterval);

          // Redescente après le saut
          let downInterval = setInterval(() => {
            if (ball1.y < startY) {
              ball1.y += 5;
              ball1.ball.style.top = ball1.y - ball1.ballRadius + "px";
            } else {
              clearInterval(downInterval);
              ball1.isJumping = false;
            }
          }, 15);
        }
      }, 15);
    }
  }

  ball1.ball.style.top = ball1.y - ball1.ballRadius + "px";
});

let negativePositions = new Set();

// Classe Negative : Obstacle qui réduit le score
class Negative {
  constructor(container, yp, type) {
    this.container = container;
    this.type = type;
    this.negative = document.createElement("div");
    this.negative.className = "negative " + this.type;
    this.container.appendChild(this.negative);

    // Position initiale et mouvement
    this.x = containerWidth;
    this.y = yp;
    this.negativeRadius = 10;

    this.negative.style.left = this.x - this.negativeRadius + "px";
    this.negative.style.top = this.y - this.negativeRadius + "px";

    // Stocker la position de l'obstacle
    negativePositions.add(this.y);

    this.moveNegative = this.moveNegative.bind(this);
    this.interval = setInterval(this.moveNegative, 10);

    // Vitesse 
    const speedByType = { sac: -2.5, filet: -2, maree: -1, frigo: -1.5 };
    this.dx = speedByType[type] || -2;

  }

  checkCollision(ball) {
    const distX = this.x - ball.x;
    const distY = this.y - ball.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance < this.negativeRadius + ball.ballRadius;
  }

  moveNegative() {
    if (isPaused || gameMode === "safari") return;

    if (this.x + this.dx < 0) {
      clearInterval(this.interval);
      this.container.removeChild(this.negative);
      negativePositions.delete(this.y);
      return;
    }

    if (this.checkCollision(ball1)) {
      container.classList.add("apply-shake");
      score -= 10;
      scoreElement.innerText = "score: " + score;
      showPopup(this.type);

      setTimeout(() => container.classList.remove("apply-shake"), 820);

      clearInterval(this.interval);
      this.container.removeChild(this.negative);
      negativeObjects = negativeObjects.filter(obj => obj !== this);
    }

    this.x += this.dx;
    this.negative.style.left = this.x - this.negativeRadius + "px";
  }


}


// Classe Increment : Bonus qui augmente le score
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
    if (isPaused || gameMode === "safari") return;

    if (this.x + this.dx < 0) {
      clearInterval(this.interval);
      this.container.removeChild(this.increment);
      return;
    }

    if (this.checkCollision(ball1)) {
      score += 10;
      scoreElement.innerText = "score: " + score;

      negativeSpawnRate = Math.max(800, negativeSpawnRate - 200);

      // Réinitialise seulement le spawn des Negative
      clearInterval(negativeInterval);
      negativeInterval = setInterval(spawnNegative, negativeSpawnRate);

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

// Génère un obstacle aléatoire
function spawnNegative() {
  if (isPaused || gameMode === "safari") return;

  const types = ["sac", "filet", "maree", "frigo"];
  const type = types[Math.floor(Math.random() * types.length)];

  const levels = [
    containerHeight - 190,
    containerHeight - 120,
    containerHeight - 50
  ];

  // Placement des obstacles
  let yPosition;
  if (type === "frigo") {
    yPosition = levels[levels.length - 1]; // Bas
  } else if (type === "maree") {
    yPosition = levels[0]; // Haut
  } else {
    yPosition = levels[Math.floor(Math.random() * levels.length)]; // Aléatoire pour sac et filet
  }

  new Negative(container, yPosition, type);
}

// Génère un bonus aléatoire
function spawnIncrement() {
  if (isPaused || gameMode === "safari") return;

  const possibleLevels = levels.filter(level => !negativePositions.has(level));

  if (possibleLevels.length === 0) return;
  let yPosition = possibleLevels[Math.floor(Math.random() * possibleLevels.length)];

  new Increment(container, yPosition);
}


// Affiche une popup d'alerte
async function showPopup(type) {
  if (openedPopups.has(type)) return;

  try {
    const response = await fetch("../content/messages.json");
    const messages = await response.json();

    const popup = document.getElementById("popup");
    document.getElementById("popup-text").innerText = messages[type]?.message || "Danger inconnu !";
    document.getElementById("popup--link").href = messages[type]?.link || "#";
    popup.style.display = "block";

    isPaused = true;
    openedPopups.add(type);

    document.getElementById("close-popup").onclick = () => {
      popup.style.display = "none";
      isPaused = false;
    };
  } catch (error) {
    console.error("Erreur de chargement du JSON:", error);
  }
}

// Change l'environnement du jeu
function changeEnvironment() {
  isPaused = true;
  clearInterval(negativeInterval);
  document.querySelectorAll(".negative, .increment").forEach(el => el.remove());

  oceanSound.pause();
  oceanSound.currentTime = 0;

  const sable = document.getElementById("sable");
  let sableHeight = 0;
  let ballStartY = ball1.y;
  let ballTargetY = containerHeight / 2;
  let stepSize = 10;

  // Forcer un recalcul du rendu pour éviter le délai
  sable.style.transition = "none";
  sable.style.height = "0px";
  sable.offsetHeight; // Force un recalcul du rendu
  sable.style.transition = "height 3s ease-in-out"; // Réactiver la transition

  // Démarrer immédiatement la montée du sable
  let transitionInterval = setInterval(() => {
    if (sableHeight < containerHeight) { // Aller jusqu'à 100% de hauteur
      sableHeight += stepSize;
      sable.style.height = sableHeight + "px";

      // Faire monter la balle en même temps
      let ballProgress = sableHeight / containerHeight;
      ball1.y = ballStartY - (ballStartY - ballTargetY) * ballProgress;
      ball1.ball.style.top = ball1.y - ball1.ballRadius + "px";
    } else {
      clearInterval(transitionInterval);

      setTimeout(() => {
        gameMode = "safari";
        container.style.backgroundColor = "#FFB700";

        // Ne pas effacer le sable pour qu'il reste en fond
        container.innerHTML = "";
        container.appendChild(ball1.ball);

        ball1.y = containerHeight / 2;
        ball1.ball.style.top = ball1.y - ball1.ballRadius + "px";

        spawnTrashLoop();
      }, 500);
    }
  }, 30);
}

let trashSpawnRate = 1000; // Temps initial entre chaque déchet (1.5s)
let minTrashSpawnRate = 200; // Temps minimum entre chaque spawn de déchet
let spawnAcceleration = 50; // Réduction du temps de spawn toutes les X millisecondes


// Apparition des déchets
function spawnTrashLoop() {
  let secondsPassed = 0;

  function spawnFaster() {
    if (trashSpawnRate > minTrashSpawnRate) {
      trashSpawnRate -= spawnAcceleration; // Accélération progressive du spawn
    }

    clearInterval(trashInterval);
    trashInterval = setInterval(() => {
      spawnTrash();
      secondsPassed++;
    }, trashSpawnRate);
  }

  let trashInterval = setInterval(() => {
    spawnTrash();
    spawnFaster();
    secondsPassed++;
  }, trashSpawnRate);

  // Après 20 secondes, on arrête le spawn et nettoie les déchets
  setTimeout(() => {
    clearInterval(trashInterval);
    showPopup("fin_jeu");
    clearTrash();
  }, 40000);
}


function spawnTrash() {
  const trashTypes = [
    { type: "bouteille", points: 10, clicks: 1, img: "/assets/bouteille.png" },
    { type: "sac_plastique", points: 15, clicks: 1, img: "/assets/sac.png" },
    { type: "frigo", points: 20, clicks: 3, img: "/assets/frigo.png" }, // Besoin de 3 clics
    { type: "filet_peche", points: 20, clicks: 2, img: "/assets/filet.png" }, // Besoin de 2 clics
    { type: "coquillage", points: -10, clicks: 1, img: "/assets/coquillage.png" } // Malus !
  ];

  // Sélectionner un type de déchet aléatoire
  let selectedTrash = trashTypes[Math.floor(Math.random() * trashTypes.length)];

  const trash = document.createElement("img"); // Utilisation d'une image
  trash.className = "trash";
  trash.src = selectedTrash.img; // Définition de l'image
  trash.style.width = "50px";
  trash.style.height = "50px";

  // Positionnement aléatoire dans le conteneur
  trash.style.position = "absolute";
  trash.style.left = Math.random() * (containerWidth - 50) + "px";
  trash.style.top = Math.random() * (containerHeight - 50) + "px";

  trash.dataset.points = selectedTrash.points;
  trash.dataset.clicksNeeded = selectedTrash.clicks;
  trash.dataset.clicksRemaining = selectedTrash.clicks;

  // Effet de suppression au clic
  trash.addEventListener("click", () => {
    let clicksRemaining = parseInt(trash.dataset.clicksRemaining);

    if (trash.dataset.type === "pierre") {
      const sable = document.getElementById("sable");
      sable.classList.add("apply-shake");
      setTimeout(() => sable.classList.remove("apply-shake"), 820);
    }

    if (clicksRemaining > 1) {
      trash.dataset.clicksRemaining = clicksRemaining - 1;
      trash.style.opacity = clicksRemaining / selectedTrash.clicks;
    } else {
      let points = parseInt(trash.dataset.points);
      score += points;
      scoreElement.innerText = "Score: " + score;
      trash.remove();
    }
  });


  container.appendChild(trash);

  // Supprimer le déchet après un certain temps s'il n'est pas cliqué
  setTimeout(() => {
    if (document.body.contains(trash)) {
      trash.remove();
    }
  }, 5000); // Disparaît après 5 secondes
}

// Fonction pour supprimer tous les déchets
function clearTrash() {
  const trashElements = document.querySelectorAll(".trash");
  trashElements.forEach(trash => {
    trash.remove();
  });
}
// Gère l'évolution du jeu
setInterval(spawnIncrement, 1000);
setInterval(spawnNegative, 2000);

setInterval(() => {
  if (!isPaused) {
    scoreDistance++;
    distanceElement.innerText = "Distance: " + scoreDistance + "m";

    if (scoreDistance >= 400 && gameMode === "ocean") {
      changeEnvironment();
    }
  }
}, 400);

const levels = [
  containerHeight - 190,
  containerHeight - 120,
  containerHeight - 50
];

// Initialisation du joueur
const ball1 = new Ball(container, 0.02, levels[1] / containerHeight);

