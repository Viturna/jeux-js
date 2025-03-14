// Variables de jeu
let isPaused = true; // Indique si le jeu est en pause (ex. lors d'une popup)
let openedPopups = new Set(); // Stocke les popups déjà affichées pour éviter les doublons
let gameMode = "ocean"; // Mode actuel du jeu (ocean ou safari)

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

// Classe Ball : Représente le joueur
class Ball {
  constructor(container, xp, yp) {
    this.container = container;
    this.ball = document.createElement("div");
    this.ball.className = "ball";
    this.container.appendChild(this.ball);

    // Position initiale en fonction du pourcentage donné
    this.x = containerWidth * xp;
    this.y = containerHeight * yp;
    this.ballRadius = this.ball.offsetWidth / 2;

    // Placement de la balle
    this.ball.style.left = this.x - this.ballRadius + "px";
    this.ball.style.top = this.y - this.ballRadius + "px";
  }
}

// Contrôles du joueur
document.addEventListener("keydown", (event) => {
  const center = containerHeight / 2;
  const levels = [center - 50, center, center + 50];
  let currentLevelIndex = levels.indexOf(ball1.y);

  if (gameMode === "ocean") {
    // Mode océan : le joueur peut monter et descendre
    switch (event.key) {
      case "ArrowUp":
        if (currentLevelIndex > 0) ball1.y = levels[currentLevelIndex - 1];
        break;
      case "ArrowDown":
        if (currentLevelIndex < levels.length - 1) ball1.y = levels[currentLevelIndex + 1];
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
    this.dx = -2;
    this.negativeRadius = 10;

    this.negative.style.left = this.x - this.negativeRadius + "px";
    this.negative.style.top = this.y - this.negativeRadius + "px";

    this.moveNegative = this.moveNegative.bind(this);
    this.interval = setInterval(this.moveNegative, 10);
  }

  // Déplacement des obstacles
  moveNegative() {
    if (isPaused || gameMode === "safari") return;

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

      setTimeout(() => container.classList.remove("apply-shake"), 820);

      clearInterval(this.interval);
      this.container.removeChild(this.negative);
    }

    this.x += this.dx;
    this.negative.style.left = this.x - this.negativeRadius + "px";
  }


  // Vérifie la collision avec le joueur
  checkCollision(ball) {
    const distX = this.x - ball.x;
    const distY = this.y - ball.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance < this.negativeRadius + ball.ballRadius;
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

  const levels = [containerHeight / 2 - 50, containerHeight / 2, containerHeight / 2 + 50];

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
  const levels = [containerHeight / 2 - 50, containerHeight / 2, containerHeight / 2 + 50];
  new Increment(container, levels[Math.floor(Math.random() * levels.length)]);
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
  // 1. Arrêter le jeu "ocean"
  isPaused = true;
  clearInterval(negativeInterval);
  document.querySelectorAll(".negative, .increment").forEach(el => el.remove());

  // 2. Modifier l'apparence pour le "safari"
  gameMode = "safari";
  container.style.backgroundColor = "#FFB700";
  container.innerHTML = "";

  // 3. Réajouter la balle dans le nouvel environnement
  container.appendChild(ball1.ball);
  ball1.y = containerHeight / 2;
  ball1.ball.style.top = ball1.y - ball1.ballRadius + "px";

  // 4. Générer des déchets aléatoires cliquables
  spawnTrashLoop();
}

// Apparition des déchets
function spawnTrashLoop() {
  let secondsPassed = 0;
  const spawnInterval = setInterval(() => {
    const numTrash = Math.min(10 + secondsPassed, 50);  // Augmente progressivement le nombre de déchets jusqu'à un max de 50
    spawnTrash(numTrash);
    secondsPassed++;
  }, 1000); // Tous les 1s, spawn des déchets

  // Après 20 secondes, on arrête la boucle de spawn
  setTimeout(() => {
    clearInterval(spawnInterval);
    showPopup("fin_jeu");
    clearTrash();
  }, 20000);
}

function spawnTrash() {
  const numTrash = 1;

  for (let i = 0; i < numTrash; i++) {
    const trash = document.createElement("div");
    trash.className = "trash";
    trash.style.left = Math.random() * (containerWidth - 40) + "px";
    trash.style.top = Math.random() * (containerHeight - 40) + "px";

    // Ajoute un effet de suppression au clic
    trash.addEventListener("click", () => {
      trash.remove();
      score += 5;
      scoreElement.innerText = "Score: " + score;
    });

    container.appendChild(trash);
  }
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

    if (scoreDistance >= 10 && gameMode === "ocean") {
      transitionToSafari();
    }
  }
}, 400);


// Initialisation du joueur
const ball1 = new Ball(container, 0.02, 0.5);
