import * as THREE from 'three';

class AssetLoader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.audioLoader = new THREE.AudioLoader();
    this.textures = {};
    this.sounds = {};
  }

  async loadTexture(name, path) {
    return new Promise((resolve) => {
      this.textureLoader.load(path, (texture) => {
        this.textures[name] = texture;
        resolve(texture);
      });
    });
  }

  async loadAllTextures() {
    const gridTexture = await this.loadTexture('grid', './assets/textures/grid.png');
    gridTexture.wrapS = THREE.RepeatWrapping;
    gridTexture.wrapT = THREE.RepeatWrapping;
    gridTexture.repeat.set(100, 100);
    
    const playerTexture = await this.loadTexture('player', './assets/textures/player.png');
    const enemyTexture = await this.loadTexture('enemy', './assets/textures/enemy.png');
    const particleTexture = await this.loadTexture('particle', './assets/textures/particle.png');
    
    return this.textures;
  }

  getTexture(name) {
    return this.textures[name];
  }
}

export default new AssetLoader();