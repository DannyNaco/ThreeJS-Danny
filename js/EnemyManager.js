import * as THREE from 'three';
import { COLORS } from './constants.js';
import AssetLoader from './AssetLoader.js';
import EffectsManager from './EffectsManager.js';

class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.enemySpeed = 0.13;
    this.startEnemiesCount = 1;
  }
  
  spawnEnemies(count, playerPosition) {
    let delay = 0;
    const enemies = [];
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        // Create advanced enemy model
        const enemyGeometry = new THREE.DodecahedronGeometry(0.7, 1);
        const enemyMaterial = new THREE.MeshStandardMaterial({
          color: COLORS.ENEMY,
          emissive: COLORS.ENEMY,
          emissiveIntensity: 0.5,
          metalness: 0.7,
          roughness: 0.3,
          wireframe: Math.random() > 0.5 // Some enemies are wireframe
        });
        
        const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
        enemy.position.set(
          (Math.random() - 0.5) * 28, 
          1 + Math.random() * 0.5, 
          playerPosition.z - 30 - Math.random() * 20
        );
        enemy.castShadow = true;
        enemy.receiveShadow = true;
        
        // Add enemy light
        const enemyLight = new THREE.PointLight(COLORS.ENEMY, 1, 3);
        enemyLight.position.set(0, 0, 0);
        enemy.userData.light = enemyLight;
        enemy.add(enemyLight);
        
        // Add pulsing animation
        enemy.userData.initialScale = 0.8 + Math.random() * 0.4;
        enemy.userData.pulseSpeed = 0.5 + Math.random() * 2;
        enemy.userData.pulsePhase = Math.random() * Math.PI * 2;
        enemy.scale.setScalar(enemy.userData.initialScale);
        
        this.scene.add(enemy);
        this.enemies.push(enemy);
        
        // Create spawn effect
        EffectsManager.createEnemySpawnEffect(enemy.position);
        
      }, delay);
      
      delay += 300;
    }
    
    return enemies;
  }
  
  update(playerPosition, time) {
    const enemiesToRemove = [];
    
    this.enemies.forEach((enemy, index) => {
      // Calculate direction to player with some randomness
      const direction = new THREE.Vector3(
        playerPosition.x - enemy.position.x + (Math.random() - 0.5) * 1.2,
        0,
        playerPosition.z - enemy.position.z
      ).normalize();
      
      // Move enemy
      enemy.position.addScaledVector(direction, this.enemySpeed);
      
      // Rotate enemy for more dynamic look
      enemy.rotation.x += 0.02;
      enemy.rotation.y += 0.03;
      
      // Pulsing animation
      const t = time * 0.001;
      const pulse = Math.sin(t * enemy.userData.pulseSpeed + enemy.userData.pulsePhase) * 0.1 + 1;
      enemy.scale.setScalar(enemy.userData.initialScale * pulse);
      
      // Create occasional effects
      if (Math.random() > 0.95) {
        EffectsManager.createEnemyTrail(enemy.position);
      }
      
      // Check if enemy is past the camera
      if (enemy.position.z > playerPosition.z + 15) {
        enemiesToRemove.push(index);
      }
    });
    
    // Remove enemies that are past camera
    for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
      const index = enemiesToRemove[i];
      const enemy = this.enemies[index];
      
      // Create destruction effect
      EffectsManager.createEnemyDestructionEffect(enemy.position);
      
      this.scene.remove(enemy);
      this.enemies.splice(index, 1);
    }
    
    return enemiesToRemove.length; // Return count of removed enemies
  }
  
  checkCollisions(playerObject) {
    const playerBox = new THREE.Box3().setFromObject(playerObject);
    
    for (let enemy of this.enemies) {
      const enemyBox = new THREE.Box3().setFromObject(enemy);
      if (playerBox.intersectsBox(enemyBox)) {
        return true;
      }
    }
    
    return false;
  }
  
  clearEnemies() {
    this.enemies.forEach(enemy => this.scene.remove(enemy));
    this.enemies = [];
  }
  
  setSpeed(speed) {
    this.enemySpeed = speed;
  }
  
  setStartCount(count) {
    this.startEnemiesCount = count;
  }
  
  getEnemyCount() {
    return this.enemies.length;
  }
}

export default EnemyManager;