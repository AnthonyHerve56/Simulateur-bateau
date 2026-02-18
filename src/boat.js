// ─────────────────────────────────────────────
//  boat.js  –  Géométrie + physique du bateau
// ─────────────────────────────────────────────

import * as THREE from 'three';
import { waveHeight } from './water.js';

export function createBoat(scene) {
  // ── Groupe parent (tout le bateau bouge ensemble) ──
  const group = new THREE.Group();
  scene.add(group);

  // Coque (hull)
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.7, 3.2),
    new THREE.MeshPhongMaterial({ color: 0xcc3300, specular: 0x331100, shininess: 40 }),
  );
  hull.castShadow = true;
  hull.position.y = 0.25;
  group.add(hull);

  // Cabine
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.6, 1.2),
    new THREE.MeshPhongMaterial({ color: 0xeeeecc, shininess: 60 }),
  );
  cabin.castShadow = true;
  cabin.position.set(0, 0.85, -0.2);
  group.add(cabin);

  // Mât
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6),
    new THREE.MeshPhongMaterial({ color: 0xddccaa }),
  );
  mast.position.set(0, 1.75, 0.3);
  group.add(mast);

  // ── État physique du bateau ──
  // C'est l'objet que les autres modules (main, wake…) lisent
  const state = {
    x:           0,
    z:           0,
    angle:       0,      // cap (radians)
    speed:       0,      // vitesse avant (unités/s)
    waterHeight: 0,      // hauteur de l'eau sous le bateau
    // Constantes physiques
    maxSpeed:    8,
    accel:       4,
    decel:       2.5,
    turnSpeed:   1.4,
  };

  // ── Mise à jour chaque frame ──
  function update(input, dt, t, water) {
    // Accélération / décélération
    if (input.fwd) {
      state.speed = Math.min(state.speed + state.accel * dt, state.maxSpeed);
    } else if (input.bwd) {
      state.speed = Math.max(state.speed - state.accel * dt, -state.maxSpeed * 0.4);
    } else {
      // Résistance de l'eau (drag)
      if (state.speed > 0) state.speed = Math.max(0, state.speed - state.decel * dt);
      else                 state.speed = Math.min(0, state.speed + state.decel * dt);
    }

    // Direction (plus on va vite, plus on tourne bien)
    const turnFactor = Math.abs(state.speed) / state.maxSpeed;
    if (input.lft) state.angle += state.turnSpeed * turnFactor * dt;
    if (input.rgt) state.angle -= state.turnSpeed * turnFactor * dt;

    // Déplacement
    state.x += -Math.sin(state.angle) * state.speed * dt;
    state.z += -Math.cos(state.angle) * state.speed * dt;

    // Hauteur de l'eau sous le bateau
    state.waterHeight = waveHeight(state.x, state.z, t);

    // Appliquer la position au groupe 3D
    group.position.set(state.x, state.waterHeight + 0.1, state.z);
    group.rotation.y = state.angle;

    // Roulis dans les virages
    const targetRoll  = (input.rgt ? 1 : input.lft ? -1 : 0) * 0.08 * turnFactor;
    group.rotation.z  = THREE.MathUtils.lerp(group.rotation.z, targetRoll, 0.1);

    // Tangage selon la vitesse
    const targetPitch = -(state.speed / state.maxSpeed) * 0.06;
    group.rotation.x  = THREE.MathUtils.lerp(group.rotation.x, targetPitch, 0.05);
  }

  return { group, state, update };
}
