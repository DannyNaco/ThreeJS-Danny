import * as THREE from 'three';
import { COLORS } from './constants.js';
import AssetLoader from './AssetLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.ambientLight = null;
    this.directionalLight = null;
    this.pointLights = [];
    this.fog = null;
  }

  init() {
    // Scene setup with fog for depth
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(COLORS.ENVIRONMENT.SKY, 0.02);
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Renderer setup with antialias and tone mapping
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    document.body.appendChild(this.renderer.domElement);
    
    // Post-processing setup
    this.setupPostProcessing();
    
    // Lighting setup
    this.setupLights();
    
    // Environment setup
    this.setupEnvironment();
    
    // Event listeners
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Add bloom effect for glow
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8,  // strength
      0.3,  // radius
      0.9   // threshold
    );
    this.composer.addPass(bloomPass);
  }
  
  setupLights() {
    // Ambient light for general illumination
    this.ambientLight = new THREE.AmbientLight(0x333366, 0.5);
    this.scene.add(this.ambientLight);
    
    // Directional light for shadows
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(0, 10, 10);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -20;
    this.directionalLight.shadow.camera.right = 20;
    this.directionalLight.shadow.camera.top = 20;
    this.directionalLight.shadow.camera.bottom = -20;
    this.scene.add(this.directionalLight);
    
    // Add point lights for dynamic lighting
    const colors = [0x00ffaa, 0x6600ff, 0xff3366];
    for (let i = 0; i < 3; i++) {
      const light = new THREE.PointLight(colors[i], 1, 20);
      light.position.set(
        (Math.random() - 0.5) * 20,
        2 + Math.random() * 3,
        -20 - Math.random() * 20
      );
      light.castShadow = true;
      this.scene.add(light);
      this.pointLights.push(light);
    }
  }
  
  setupEnvironment() {
    // Cyberpunk grid floor
    const gridTexture = AssetLoader.getTexture('grid');
    const floorGeometry = new THREE.PlaneGeometry(100, 1000);
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: gridTexture,
      color: 0x001122,
      emissive: COLORS.ENVIRONMENT.GRID,
      emissiveIntensity: 0.2,
      metalness: 0.7,
      roughness: 0.3
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    // Add side walls
    const wallGeometry = new THREE.PlaneGeometry(1000, 20);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.ENVIRONMENT.SKY,
      emissive: COLORS.PLAYER,
      emissiveIntensity: 0.1,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-50, 10, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.scene.add(leftWall);
    
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(50, 10, 0);
    rightWall.rotation.y = -Math.PI / 2;
    this.scene.add(rightWall);
    
    // Add distant obstacles for visual interest
    for (let i = 0; i < 30; i++) {
      const geometry = new THREE.BoxGeometry(
        Math.random() * 5 + 1,
        Math.random() * 10 + 5,
        Math.random() * 5 + 1
      );
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(Math.random() * 0.1, Math.random() * 0.1, 0.2 + Math.random() * 0.2),
        emissive: new THREE.Color(Math.random(), Math.random(), Math.random()),
        emissiveIntensity: 0.3,
        metalness: 0.8,
        roughness: 0.2
      });
      const obstacle = new THREE.Mesh(geometry, material);
      obstacle.position.set(
        (Math.random() - 0.5) * 80,
        Math.random() * 5,
        -50 - Math.random() * 900
      );
      obstacle.castShadow = true;
      obstacle.receiveShadow = true;
      this.scene.add(obstacle);
    }
  }
  
  animateLights(time) {
    // Animate point lights for dynamic effect
    this.pointLights.forEach((light, index) => {
      const t = time * 0.001;
      light.position.x = Math.sin(t * (0.5 + index * 0.2)) * 15;
      light.intensity = 1 + Math.sin(t * 2) * 0.5;
    });
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
  
  render(time) {
    this.animateLights(time);
    this.composer.render();
  }
}

export default new SceneManager();