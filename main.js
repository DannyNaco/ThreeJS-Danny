import * as THREE from 'three';

let scene, camera, renderer;
let player, enemies = [];
let isGameRunning = false;
let enemySpeed = 0.15;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let score = 0;
let scoreElement;
let waveNumber = 1;
let nextWaveReady = true;
let boostActive = false;
let lastZPress = 0;
let boostTimeout;
let boostSound;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
    );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scoreElement = document.createElement('div');
    scoreElement.style.position = 'absolute';
    scoreElement.style.top = '10px';
    scoreElement.style.left = '10px';
    scoreElement.style.color = 'white';
    scoreElement.style.fontSize = '24px';
    scoreElement.textContent = 'Score: 0';
    document.body.appendChild(scoreElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1);
    scene.add(light);

    const floorGeometry = new THREE.PlaneGeometry(30, 1000);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x008800 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
    const playerMaterial = new THREE.MeshNormalMaterial();
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 1, 0);
    scene.add(player);

    camera.position.set(0, 5, 10);
    camera.lookAt(player.position);

    // Boost sound
    boostSound = new Audio('boost.mp3');

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

function spawnEnemies(n) {
    let delay = 0;
    for (let i = 0; i < n; i++) {
        setTimeout(() => {
            const enemyGeometry = new THREE.BoxGeometry(1, 2, 1);
            const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
            enemy.position.set(
                (Math.random() - 0.5) * 28,
                1,
                player.position.z - 30 - Math.random() * 20
            );
            scene.add(enemy);
            enemies.push(enemy);
        }, delay);
        delay += 300;
    }
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
        let now = Date.now();
        if (now - lastZPress < 300 && !boostActive) {
            activateBoost();
        }
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
    boostSound.play();
    clearTimeout(boostTimeout);
    boostTimeout = setTimeout(() => {
        boostActive = false;
    }, 1000);
}

function checkCollisions() {
    const playerBox = new THREE.Box3().setFromObject(player);
    for (let enemy of enemies) {
        const enemyBox = new THREE.Box3().setFromObject(enemy);
        if (playerBox.intersectsBox(enemyBox)) {
            endGame();
        }
    }
}

function endGame() {
    isGameRunning = false;
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('message').textContent = 'Game Over! Score: ' + score;
}

function animate() {
    requestAnimationFrame(animate);

    if (isGameRunning) {
        const baseSpeed = 0.2;
        const speed = boostActive ? baseSpeed * 2 : baseSpeed;

        if (moveForward) player.position.z -= speed;
        if (moveBackward) player.position.z += baseSpeed;
        if (moveLeft) player.position.x -= baseSpeed;
        if (moveRight) player.position.x += baseSpeed;

        if (player.position.x < -14) player.position.x = -14;
        if (player.position.x > 14) player.position.x = 14;

        camera.position.set(player.position.x, 5, player.position.z + 10);
        camera.lookAt(player.position);

        enemies.forEach((enemy, index) => {
            const direction = new THREE.Vector3(
                player.position.x - enemy.position.x + (Math.random() - 0.5),
                0,
                player.position.z - enemy.position.z
            ).normalize();
            enemy.position.addScaledVector(direction, enemySpeed);

            if (enemy.position.z > camera.position.z + 5) {
                scene.remove(enemy);
                enemies.splice(index, 1);
                score++;
                scoreElement.textContent = 'Score: ' + score;
            }
        });

        if (enemies.length === 0 && nextWaveReady) {
            nextWaveReady = false;
            setTimeout(() => {
                waveNumber++;
                spawnEnemies(2 * waveNumber - 1);
                nextWaveReady = true;
            }, 1000);
        }

        checkCollisions();
    }

    renderer.render(scene, camera);
}

function startGame() {
    document.getElementById('menu').style.display = 'none';
    isGameRunning = true;
    score = 0;
    waveNumber = 1;
    nextWaveReady = true;
    scoreElement.textContent = 'Score: 0';
    spawnEnemies(2 * waveNumber - 1);
}

init();
animate();

document.getElementById('startBtn').addEventListener('click', () => {
    enemies.forEach(e => scene.remove(e));
    enemies = [];
    player.position.set(0, 1, 0);
    startGame();
});
