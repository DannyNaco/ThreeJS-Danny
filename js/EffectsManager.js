import * as THREE from 'three';
import ParticleSystem from './ParticleSystem.js';
import { COLORS } from './constants.js';

class EffectsManager {
  constructor() {
    this.scene = null;
    this.particleSystem = null;
  }
  
  init(scene) {
    this.scene = scene;
    this.particleSystem = new ParticleSystem(scene);
  }
  
  createPlayerTrail(position, isBoosting) {
    // Create subtle trail behind player
    const trailPosition = new THREE.Vector3(position.x, position.y, position.z + 0.5);
    this.particleSystem.createParticles(
      trailPosition, 
      isBoosting ? 10 : 3, 
      isBoosting ? 'boost' : 'player', 
      1000, 
      0.3
    );
  }
  
  createEnemyTrail(position) {
    this.particleSystem.createParticles(position, 5, 'enemy', 800, 0.3);
  }
  
  createBoostEffect(position) {
    // Create big burst of particles for boost activation
    this.particleSystem.createParticles(position, 50, 'boost', 1500, 1.0);
    
    // Create shockwave effect
    const shockwaveGeometry = new THREE.RingGeometry(0.1, 2, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.BOOST,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.position.copy(position);
    shockwave.rotation.x = Math.PI / 2;
    this.scene.add(shockwave);
    
    // Animate shockwave
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const scale = elapsed / 300;
      
      shockwave.scale.set(scale, scale, scale);
      shockwave.material.opacity = 0.7 * (1 - (elapsed / 750));
      
      if (elapsed < 750) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(shockwave);
      }
    };
    
    animate();
  }
  
  createEnemySpawnEffect(position) {
    // Particle burst on spawn
    this.particleSystem.createParticles(position, 20, 'enemy', 1200, 0.8);
    
    // Create light flash
    const light = new THREE.PointLight(COLORS.ENEMY, 2, 10);
    light.position.copy(position);
    this.scene.add(light);
    
    // Fade out light
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const intensity = 2 * (1 - (elapsed / 500));
      
      light.intensity = intensity;
      
      if (elapsed < 500) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(light);
      }
    };
    
    animate();
  }
  
  createEnemyDestructionEffect(position) {
    // Large burst of particles
    this.particleSystem.createParticles(position, 30, 'enemy', 1500, 1.2);
    
    // Create light flash
    const light = new THREE.PointLight(COLORS.ENEMY, 3, 15);
    light.position.copy(position);
    this.scene.add(light);
    
    // Fade out light
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const intensity = 3 * (1 - (elapsed / 600));
      
      light.intensity = intensity;
      
      if (elapsed < 600) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(light);
      }
    };
    
    animate();
  }
  
  createGameOverEffect(position) {
    // Massive explosion effect
    this.particleSystem.createParticles(position, 200, 'player', 3000, 5);
    this.particleSystem.createParticles(position, 100, 'enemy', 2500, 3);
    
    // Create expanding shockwave
    const shockwaveGeometry = new THREE.RingGeometry(0.1, 3, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.position.copy(position);
    shockwave.rotation.x = Math.PI / 2;
    this.scene.add(shockwave);
    
    // Animate shockwave
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const scale = elapsed / 200;
      
      shockwave.scale.set(scale, scale, scale);
      shockwave.material.opacity = 0.9 * (1 - (elapsed / 1500));
      
      if (elapsed < 1500) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(shockwave);
      }
    };
    
    animate();
  }
  
  update(deltaTime) {
    this.particleSystem.update(deltaTime);
  }
}

export default new EffectsManager();