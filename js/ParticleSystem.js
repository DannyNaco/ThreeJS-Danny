import * as THREE from 'three';
import { COLORS } from './constants.js';

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    
    // Create particle materials
    this.materials = {
      player: new THREE.PointsMaterial({
        color: COLORS.PLAYER,
        size: 0.3,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      }),
      
      enemy: new THREE.PointsMaterial({
        color: COLORS.ENEMY,
        size: 0.3,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      }),
      
      boost: new THREE.PointsMaterial({
        color: COLORS.BOOST,
        size: 0.5,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
      })
    };
  }
  
  createParticles(position, count, color, lifespan, spread) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
      // Random positions within spread
      positions.push(
        position.x + (Math.random() - 0.5) * spread,
        position.y + (Math.random() - 0.5) * spread,
        position.z + (Math.random() - 0.5) * spread
      );
      
      // Random velocities
      velocities.push(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1 + 0.05,
        (Math.random() - 0.5) * 0.1
      );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    let material;
    switch(color) {
      case 'player': material = this.materials.player; break;
      case 'enemy': material = this.materials.enemy; break;
      case 'boost': material = this.materials.boost; break;
      default: material = this.materials.player;
    }
    
    const particleSystem = new THREE.Points(geometry, material);
    this.scene.add(particleSystem);
    
    this.particles.push({
      system: particleSystem,
      velocities: velocities,
      lifespan: lifespan,
      age: 0
    });
    
    return particleSystem;
  }
  
  update(deltaTime) {
    const particlesToRemove = [];
    
    this.particles.forEach((particle, index) => {
      const positions = particle.system.geometry.attributes.position.array;
      
      // Update positions based on velocities
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += particle.velocities[i/3 * 3] * deltaTime;
        positions[i+1] += particle.velocities[i/3 * 3 + 1] * deltaTime;
        positions[i+2] += particle.velocities[i/3 * 3 + 2] * deltaTime;
        
        // Add gravity
        particle.velocities[i/3 * 3 + 1] -= 0.0001 * deltaTime;
      }
      
      particle.system.geometry.attributes.position.needsUpdate = true;
      
      // Fade out based on age
      particle.age += deltaTime;
      if (particle.age < particle.lifespan) {
        const opacity = 1 - (particle.age / particle.lifespan);
        particle.system.material.opacity = opacity;
      } else {
        particlesToRemove.push(index);
      }
    });
    
    // Remove dead particles
    for (let i = particlesToRemove.length - 1; i >= 0; i--) {
      const index = particlesToRemove[i];
      this.scene.remove(this.particles[index].system);
      this.particles.splice(index, 1);
    }
  }
}

export default ParticleSystem;