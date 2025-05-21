// filepath: c:\Users\etudiant\Desktop\MMI\BUT3\ThreeJS\ThreeJS-Danny\js\PlayerController.js
import * as THREE from 'three';
import { COLORS } from './constants.js';
import AssetLoader from './AssetLoader.js';
import EffectsManager from './EffectsManager.js';

class PlayerController {
  constructor(scene) {
    this.scene = scene;
    this.player = null;
    this.playerLight = null;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.boostActive = false;
    this.lastBoostTime = 0;
    this.boostTimeout = null;
    this.boostSound = null;
    this.speed = 0.2;
  }
  
  init() {
    // Create advanced player model
    const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const playerMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.PLAYER,
      emissive: COLORS.PLAYER,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    
    this.player = new THREE.Mesh(playerGeometry, playerMaterial);
    this.player.position.set(0, 1, 0);
    this.player.castShadow = true;
    this.player.receiveShadow = true;
    
    // Add details to player
    const detailGeometry = new THREE.ConeGeometry(0.3, 1, 16);
    const detailMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: COLORS.PLAYER,
      emissiveIntensity: 0.8
    });
    
    const frontCone = new THREE.Mesh(detailGeometry, detailMaterial);
    frontCone.position.set(0, 0, -0.7);
    frontCone.rotation.x = Math.PI / 2;
    this.player.add(frontCone);
    
    // Add player light
    this.playerLight = new THREE.PointLight(COLORS.PLAYER, 1, 10);
    this.playerLight.position.set(0, 1, 0);
    this.scene.add(this.playerLight);
    
    // Load sound
    this.boostSound = new Audio('./assets/sounds/boost.mp3');
    
    this.scene.add(this.player);
    
    // Set up event listeners
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
  }
  
  onKeyDown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'q') this.moveLeft = true;
    if (e.key === 'ArrowRight' || e.key === 'd') this.moveRight = true;
    if (e.key === 'ArrowUp' || e.key === 'z') {
      this.moveForward = true;
      const now = Date.now();
      if (now - this.lastBoostTime < 300 && !this.boostActive) this.activateBoost();
      this.lastBoostTime = now;
    }
    if (e.key === 'ArrowDown' || e.key === 's') this.moveBackward = true;
  }
  
  onKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'q') this.moveLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd') this.moveRight = false;
    if (e.key === 'ArrowUp' || e.key === 'z') this.moveForward = false;
    if (e.key === 'ArrowDown' || e.key === 's') this.moveBackward = false;
  }
  
  activateBoost() {
    this.boostActive = true;
    if (this.boostSound) this.boostSound.play();
    
    // Visual effects for boost
    EffectsManager.createBoostEffect(this.player.position);
    
    // Change player color during boost
    this.player.material.emissiveIntensity = 1.0;
    this.playerLight.intensity = 2;
    
    clearTimeout(this.boostTimeout);
    this.boostTimeout = setTimeout(() => {
      this.boostActive = false;
      this.player.material.emissiveIntensity = 0.5;
      this.playerLight.intensity = 1;
    }, 1000);
  }
  
  update() {
    if (!this.player) return;
    
    const baseSpeed = this.speed;
    const speed = this.boostActive ? baseSpeed * 2 : baseSpeed;
    
    if (this.moveForward) this.player.position.z -= speed;
    if (this.moveBackward) this.player.position.z += baseSpeed;
    if (this.moveLeft) this.player.position.x -= baseSpeed;
    if (this.moveRight) this.player.position.x += baseSpeed;
    
    // Limit player movement to the road bounds
    this.player.position.x = Math.max(-14, Math.min(14, this.player.position.x));
    
    // Update player light position
    this.playerLight.position.copy(this.player.position);
    
    // Add subtle floating animation
    this.player.position.y = 1 + Math.sin(Date.now() * 0.003) * 0.1;
    
    // Add rotation effect when moving
    if (this.moveLeft) {
      this.player.rotation.z = Math.min(this.player.rotation.z + 0.05, 0.3);
    } else if (this.moveRight) {
      this.player.rotation.z = Math.max(this.player.rotation.z - 0.05, -0.3);
    } else {
      this.player.rotation.z *= 0.9; // Return to normal
    }
    
    // Create trail effect
    if (Math.random() > 0.7) {
      EffectsManager.createPlayerTrail(this.player.position, this.boostActive);
    }
  }
  
  setSpeed(speed) {
    this.speed = speed;
  }
  
  getPosition() {
    return this.player.position;
  }
  
  getPlayerObject() {
    return this.player;
  }
}

export default PlayerController;