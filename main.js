import * as THREE from 'three';
import api from './ApiClient.js';

// Vérifier si les imports des modules sont corrects
// Si les fichiers n'existent pas encore, il faut les créer ou revenir à une approche non-modulaire

// Si vous n'avez pas encore créé les modules, utilisons une approche directe
let scene, camera, renderer;
let player, enemies = [];
let isGameRunning = false;
let enemySpeed = 0.13;
let playerSpeed = 0.2;
let startEnemiesCount = 1;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let score = 0;
let scoreElement;
let waveNumber = 1;
let nextWaveReady = true;
let boostActive = false;
let lastZPress = 0;
let boostTimeout;
let boostSound;
let gameStartTime;

// Ces constantes remplacent l'import GAME_SETTINGS
const GAME_SETTINGS = {
  DEFAULTS: {
    ENEMY_SPEED: 0.13,
    PLAYER_SPEED: 0.2,
    ENEMIES_COUNT: 1
  },
  LIMITS: {
    ENEMY_SPEED: { MIN: 0.05, MAX: 0.5 },
    PLAYER_SPEED: { MIN: 0.1, MAX: 0.5 },
    ENEMIES_COUNT: { MIN: 1, MAX: 10 }
  }
};

async function init() {
  // Création de la scène et des éléments de base
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a2a);
  scene.fog = new THREE.FogExp2(0x0a0a2a, 0.02);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Score element
  scoreElement = document.createElement('div');
  scoreElement.style.position = 'absolute';
  scoreElement.style.top = '20px';
  scoreElement.style.left = '20px';
  scoreElement.style.color = 'white';
  scoreElement.style.fontSize = '24px';
  scoreElement.style.fontFamily = 'Orbitron, sans-serif';
  scoreElement.style.textShadow = '0 0 10px #00ffaa';
  scoreElement.style.zIndex = '100';
  scoreElement.textContent = 'Score: 0';
  document.body.appendChild(scoreElement);
  
  // Éclairage
  const ambientLight = new THREE.AmbientLight(0x333366, 0.5);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(0, 10, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  scene.add(dirLight);
  
  // Sol
  const floorGeometry = new THREE.PlaneGeometry(30, 1000);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x001122,
    emissive: 0x00ffaa,
    emissiveIntensity: 0.2,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  
  // Joueur
  const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const playerMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00ffaa,
    emissive: 0x00ffaa,
    emissiveIntensity: 0.5
  });
  player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 1, 0);
  player.castShadow = true;
  scene.add(player);

  camera.position.set(0, 5, 10);
  camera.lookAt(player.position);

  // Set default values for settings
  document.getElementById("enemySpeed").value = GAME_SETTINGS.DEFAULTS.ENEMY_SPEED;
  document.getElementById("playerSpeed").value = GAME_SETTINGS.DEFAULTS.PLAYER_SPEED;
  document.getElementById("startEnemies").value = GAME_SETTINGS.DEFAULTS.ENEMIES_COUNT;
  
  // Check authentication
  if (!api.isAuthenticated()) {
    document.getElementById("auth-container").style.display = "block";
  } else {
    document.getElementById("auth-container").style.display = "none";
  }
  
  document.getElementById("logout-btn").style.display = api.isAuthenticated() ? "block" : "none";

    // Mettre à jour l'interface en fonction de l'état d'authentification
  updateAuthUI();

  // Event listeners
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(e) {
  if (!isGameRunning) return;
  if (e.key === 'ArrowLeft' || e.key === 'q') moveLeft = true;
  if (e.key === 'ArrowRight' || e.key === 'd') moveRight = true;
  if (e.key === 'ArrowUp' || e.key === 'z') {
    moveForward = true;
    const now = Date.now();
    if (now - lastZPress < 300 && !boostActive) activateBoost();
    lastZPress = now;
  }
  if (e.key === 'ArrowDown' || e.key === 's') moveBackward = true;
}

function onKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'q') moveLeft = false;
  if (e.key === 'ArrowRight' || e.key === 'd') moveRight = false;
  if (e.key === 'ArrowUp' || e.key === 'z') moveForward = false;
  if (e.key === 'ArrowDown' || e.key === 's') moveBackward = false;
}

function activateBoost() {
  boostActive = true;
  
  // Effet visuel
  player.material.emissiveIntensity = 1.0;
  
  clearTimeout(boostTimeout);
  boostTimeout = setTimeout(() => {
    boostActive = false;
    player.material.emissiveIntensity = 0.5;
  }, 1000);
}

function spawnEnemies(count) {
  let delay = 0;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const enemyGeometry = new THREE.DodecahedronGeometry(0.7, 1);
      const enemyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff3366,
        emissive: 0xff3366,
        emissiveIntensity: 0.5
      });
      
      const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
      enemy.position.set(
        (Math.random() - 0.5) * 28, 
        1, 
        player.position.z - 30 - Math.random() * 20
      );
      enemy.castShadow = true;
      
      scene.add(enemy);
      enemies.push(enemy);
    }, delay);
    delay += 300;
  }
}

function clearEnemies() {
  enemies.forEach(enemy => scene.remove(enemy));
  enemies = [];
}

function checkCollisions() {
  const playerBox = new THREE.Box3().setFromObject(player);
  
  for (let enemy of enemies) {
    const enemyBox = new THREE.Box3().setFromObject(enemy);
    if (playerBox.intersectsBox(enemyBox)) {
      return true;
    }
  }
  
  return false;
}

function animate() {
  requestAnimationFrame(animate);
  
  if (isGameRunning) {
    const baseSpeed = playerSpeed;
    const speed = boostActive ? baseSpeed * 2 : baseSpeed;

    if (moveForward) player.position.z -= speed;
    if (moveBackward) player.position.z += baseSpeed;
    if (moveLeft) player.position.x -= baseSpeed;
    if (moveRight) player.position.x += baseSpeed;

    player.position.x = Math.max(-14, Math.min(14, player.position.x));

    camera.position.set(player.position.x, 5, player.position.z + 10);
    camera.lookAt(player.position);

    const enemiesToRemove = [];
    enemies.forEach((enemy, index) => {
      const direction = new THREE.Vector3(
        player.position.x - enemy.position.x + (Math.random() - 0.5),
        0,
        player.position.z - enemy.position.z
      ).normalize();
      enemy.position.addScaledVector(direction, enemySpeed);

      if (enemy.position.z > camera.position.z + 5) {
        scene.remove(enemy);
        enemiesToRemove.push(index);
        score++;
        scoreElement.textContent = `Score: ${score}`;
      }
    });
    
    // Remove enemies from array (in reverse to avoid index issues)
    for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
      enemies.splice(enemiesToRemove[i], 1);
    }

    if (enemies.length === 0 && nextWaveReady) {
      nextWaveReady = false;
      setTimeout(() => {
        waveNumber++;
        spawnEnemies(2 * waveNumber - 1);
        nextWaveReady = true;
      }, 1000);
    }

    if (checkCollisions()) {
      endGame();
    }
  }

  renderer.render(scene, camera);
}

function startGame() {
  // Get settings from UI
  enemySpeed = parseFloat(document.getElementById("enemySpeed").value);
  playerSpeed = parseFloat(document.getElementById("playerSpeed").value);
  startEnemiesCount = parseInt(document.getElementById("startEnemies").value);
  
  // Validate settings
  enemySpeed = Math.min(Math.max(enemySpeed, GAME_SETTINGS.LIMITS.ENEMY_SPEED.MIN), GAME_SETTINGS.LIMITS.ENEMY_SPEED.MAX);
  playerSpeed = Math.min(Math.max(playerSpeed, GAME_SETTINGS.LIMITS.PLAYER_SPEED.MIN), GAME_SETTINGS.LIMITS.PLAYER_SPEED.MAX);
  startEnemiesCount = Math.min(Math.max(startEnemiesCount, GAME_SETTINGS.LIMITS.ENEMIES_COUNT.MIN), GAME_SETTINGS.LIMITS.ENEMIES_COUNT.MAX);
  
  // Hide UI elements
  document.getElementById('menu').style.display = 'none';
  document.getElementById("logout-btn").style.display = "none";
  
  // Reset game state
  isGameRunning = true;
  score = 0;
  waveNumber = 1;
  nextWaveReady = true;
  scoreElement.textContent = 'Score: 0';
  
  // Clear existing enemies
  clearEnemies();
  
  // Reset player position
  player.position.set(0, 1, 0);
  
  // Record start time
  gameStartTime = performance.now();
  
  // Start first wave
  spawnEnemies(startEnemiesCount);
}

function endGame() {
  isGameRunning = false;
  
  // Show UI elements
  document.getElementById('menu').style.display = 'flex';
  document.getElementById("logout-btn").style.display = "block";
  document.getElementById('message').textContent = `Game Over! Score: ${score}`;
  
  // Prepare game data for API
  const gameData = {
    score,
    duration: Math.floor((performance.now() - gameStartTime) / 1000),
    waveReached: waveNumber,
    isGameOver: true,
    playerSpeed: playerSpeed,
    enemySpeed: enemySpeed,
    startEnemiesCount: startEnemiesCount
  };
  
  // Send game data to API
  api.postGame(gameData)
    .then(r => console.log('Jeu sauvegardé :', r))
    .catch(e => console.error('Erreur sauvegarde jeu :', e));
}

// Fonction pour mettre à jour l'interface en fonction de l'état d'authentification
function updateAuthUI() {
  const isLoggedIn = api.isAuthenticated();
  
  // Gérer l'affichage des éléments réservés aux utilisateurs connectés
  const loggedInOnlyElements = document.querySelectorAll('.logged-in-only');
  loggedInOnlyElements.forEach(el => {
    el.style.display = isLoggedIn ? 'flex' : 'none';
  });
  
  // Gérer l'affichage des formulaires d'authentification
  document.getElementById("auth-container").style.display = isLoggedIn ? "none" : "block";
  
  // Gérer l'affichage du bouton de déconnexion
  document.getElementById("logout-btn").style.display = isLoggedIn ? "block" : "none";
}

// Fonction pour afficher les statistiques
function displayStats(stats) {
    const statsData = document.getElementById('stats-data');
    
    console.log("Données de stats reçues:", stats); // Pour déboguer
    
    // Vérifier si les données existent
    if (!stats) {
        statsData.innerHTML = `<p class="error">Aucune donnée de statistiques disponible.</p>`;
        statsData.style.display = 'block';
        return;
    }
    
    // Format de l'API: stats contient directement les propriétés bestScore et totalGamesPlayed
    statsData.innerHTML = `
        <div class="stats-summary">
            <h3>Résumé</h3>
            <table class="data-table">
                <tr>
                    <th>Parties jouées</th>
                    <td>${stats.totalGamesPlayed || stats.gamesPlayed || 0}</td>
                </tr>
                <tr>
                    <th>Meilleur score</th>
                    <td class="highlight">${stats.bestScore || 0}</td>
                </tr>
                ${stats.averageScore ? `
                <tr>
                    <th>Score moyen</th>
                    <td>${stats.averageScore}</td>
                </tr>` : ''}
                ${stats.totalPlayTime ? `
                <tr>
                    <th>Temps de jeu total</th>
                    <td>${formatTime(stats.totalPlayTime)}</td>
                </tr>` : ''}
                ${stats.maxWave ? `
                <tr>
                    <th>Vague maximum atteinte</th>
                    <td class="highlight">${stats.maxWave}</td>
                </tr>` : ''}
            </table>
        </div>
        
        ${stats.gameHistory && Array.isArray(stats.gameHistory) && stats.gameHistory.length > 0 ? `
            <h3>Historique des parties</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Score</th>
                        <th>Vague</th>
                        <th>Durée</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.gameHistory.map(game => `
                        <tr>
                            <td>${game.date ? new Date(game.date).toLocaleDateString() : 'N/A'}</td>
                            <td>${game.score || 0}</td>
                            <td>${game.waveReached || 0}</td>
                            <td>${formatTime(game.duration || 0)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : ''}
    `;
    
    statsData.style.display = 'block';
}

// Fonction pour afficher le leaderboard
function displayLeaderboard(leaderboard) {
    const leaderboardData = document.getElementById('leaderboard-data');
    const currentUserEmail = localStorage.getItem('email');
    
    console.log("Données du leaderboard reçues:", leaderboard); // Pour déboguer
    
    // Si leaderboard est undefined ou null, initialiser comme tableau vide
    if (!leaderboard) leaderboard = [];
    
    // Si leaderboard n'est pas un tableau mais a des propriétés numériques (comme un objet avec indices)
    // le convertir en tableau
    if (!Array.isArray(leaderboard) && typeof leaderboard === 'object') {
        const tempArray = [];
        for (let key in leaderboard) {
            if (!isNaN(parseInt(key)) && leaderboard[key] && typeof leaderboard[key] === 'object') {
                tempArray.push(leaderboard[key]);
            }
        }
        if (tempArray.length > 0) {
            leaderboard = tempArray;
        }
    }
    
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
        leaderboardData.innerHTML = `
            <p class="no-data">Aucune donnée disponible dans le classement.</p>
        `;
        leaderboardData.style.display = 'block';
        return;
    }
    
    leaderboardData.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Position</th>
                    <th>Joueur</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                ${leaderboard.map((entry, index) => `
                    <tr ${entry.email === currentUserEmail ? 'class="highlight"' : ''}>
                        <td>${index + 1}</td>
                        <td>${entry.firstName || ''} ${entry.lastName || ''}</td>
                        <td>${entry.bestScore || entry.score || 0}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    leaderboardData.style.display = 'block';
}

// Fonction utilitaire pour formater le temps en heures:minutes:secondes
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    
    return parts.join(' ');
}

// Initialize game
init().then(() => {
  animate();
}).catch(console.error);

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);

// Garder le reste du code inchangé pour l'authentification
document.getElementById("go-register").onclick = () => {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("register-form").style.display = "block";
};

document.getElementById("go-login").onclick = () => {
  document.getElementById("register-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
};

document.getElementById("login-btn").onclick = async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await api.login(email, password);
    document.getElementById("auth-container").style.display = "none";
    showSuccess("Connexion réussie !");
    updateAuthUI();
  } catch (e) {
    alert(e.message);
  }
};

document.getElementById("register-btn").onclick = async () => {
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const firstName = document.getElementById("register-firstname").value;
  const lastName = document.getElementById("register-lastname").value;

  try {
    await api.register({ email, password, firstName, lastName });
    showSuccess("Inscription réussie !");
    document.getElementById("go-login").click();
  } catch (e) {
    alert(e.message);
  }
};

function showSuccess(message) {
  const modal = document.getElementById("modal-success");
  const msg = document.getElementById("modal-message");
  msg.textContent = message;
  modal.style.display = "flex";
}

document.getElementById("logout-btn").addEventListener("click", () => {
  api.logout();
  updateAuthUI();
  document.getElementById("logout-btn").style.display = "none";
  document.getElementById("auth-container").style.display = "block";
});

// Gestionnaires d'événements pour les boutons
document.getElementById('statsBtn').addEventListener('click', async () => {
    if (!api.isAuthenticated()) {
        alert("Veuillez vous connecter pour voir vos statistiques.");
        return;
    }
    
    document.getElementById('stats-modal').style.display = 'flex';
    document.getElementById('stats-loading').style.display = 'block';
    document.getElementById('stats-data').style.display = 'none';
    
    try {
        const stats = await api.getStats();
        displayStats(stats);
    } catch (error) {
        document.getElementById('stats-data').innerHTML = `<p class="error">Erreur lors du chargement des statistiques: ${error.message}</p>`;
        document.getElementById('stats-data').style.display = 'block';
    }
    
    document.getElementById('stats-loading').style.display = 'none';
});

document.getElementById('leaderboardBtn').addEventListener('click', async () => {
    document.getElementById('leaderboard-modal').style.display = 'flex';
    document.getElementById('leaderboard-loading').style.display = 'block';
    document.getElementById('leaderboard-data').style.display = 'none';
    
    try {
        let leaderboard = await api.getLeaderboard();
        console.log("Réponse brute de l'API:", leaderboard); // Pour déboguer
        
        // Si leaderboard n'est pas un tableau, essayer de trouver les données à l'intérieur
        if (leaderboard && !Array.isArray(leaderboard)) {
            // Essayer de trouver un tableau dans les propriétés de l'objet
            for (const key in leaderboard) {
                if (Array.isArray(leaderboard[key])) {
                    leaderboard = leaderboard[key];
                    break;
                }
            }
            
            // Si toujours pas un tableau, créer un tableau vide
            if (!Array.isArray(leaderboard)) {
                console.error("Format de données inattendu:", leaderboard);
                leaderboard = [];
            }
        }
        
        displayLeaderboard(leaderboard);
    } catch (error) {
        console.error("Erreur complète:", error);
        document.getElementById('leaderboard-data').innerHTML = `
            <p class="error">Erreur lors du chargement du classement: ${error.message}</p>
            <p>Détails: ${error}</p>
        `;
        document.getElementById('leaderboard-data').style.display = 'block';
    }
    
    document.getElementById('leaderboard-loading').style.display = 'none';
});
