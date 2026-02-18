// ─────────────────────────────────────────────
//  main.js  –  Point d'entrée du simulateur
// ─────────────────────────────────────────────

import { createScene } from './scene.js';
import { createLights } from './lights.js';
import { createWater } from './water.js';
import { createBoat } from './boat.js';
import { createInput } from './input.js';
import { createWake } from './wake.js';

// ── Initialisation ────────────────────────────
const { scene, camera, renderer } = createScene();

createLights(scene);

const water = createWater(scene);
const boat  = createBoat(scene);
const input = createInput();
const wake  = createWake(scene);

// ── Boucle principale ─────────────────────────
let prevTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt  = Math.min((now - prevTime) / 1000, 0.05); // delta time en secondes
  const t   = now / 1000;                               // temps absolu
  prevTime  = now;

  // Mise à jour de chaque module
  water.update(t);
  boat.update(input, dt, t, water);
  wake.update(boat.state, dt, t, water);

  // Caméra suit le bateau
  updateCamera(camera, boat.state, t);

  // HUD
  updateHUD(boat.state, input);

  renderer.render(scene, camera);
}

// ── Caméra ────────────────────────────────────
import * as THREE from 'three';

const _camTarget = new THREE.Vector3();

function updateCamera(camera, boat, t) {
  const sinA = Math.sin(boat.angle);
  const cosA = Math.cos(boat.angle);

  // Position cible derrière le bateau
  const targetX = boat.x + sinA * 16;
  const targetZ = boat.z + cosA * 16;
  const targetY = 8 + boat.waterHeight;

  // Interpolation douce (lerp)
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);

  _camTarget.set(boat.x, boat.waterHeight + 0.5, boat.z);
  camera.lookAt(_camTarget);
}

// ── HUD ───────────────────────────────────────
const spdEl   = document.getElementById('spd');
const keyEls  = {
  ArrowUp:    document.getElementById('key-up'),
  ArrowDown:  document.getElementById('key-down'),
  ArrowLeft:  document.getElementById('key-left'),
  ArrowRight: document.getElementById('key-right'),
};

function updateHUD(boat, input) {
  spdEl.textContent = (Math.abs(boat.speed) * 0.6).toFixed(1);
  keyEls.ArrowUp.classList.toggle('active',    input.fwd);
  keyEls.ArrowDown.classList.toggle('active',  input.bwd);
  keyEls.ArrowLeft.classList.toggle('active',  input.lft);
  keyEls.ArrowRight.classList.toggle('active', input.rgt);
}

// ── Go ────────────────────────────────────────
animate();
