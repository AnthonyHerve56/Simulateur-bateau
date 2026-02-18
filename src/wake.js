// ─────────────────────────────────────────────
//  wake.js  –  Sillage / particules de mousse
// ─────────────────────────────────────────────

import * as THREE from 'three';
import { waveHeight } from './water.js';

const POOL_SIZE    = 60;   // nombre de particules en pool
const SPAWN_RATE   = 20;   // particules par seconde
const PARTICLE_TTL = 1.4;  // durée de vie en secondes

export function createWake(scene) {
  // ── Pool de particules (on réutilise les meshes) ──
  const geo = new THREE.SphereGeometry(0.12, 4, 4);

  const pool = Array.from({ length: POOL_SIZE }, () => {
    const mat  = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false;
    mesh.userData = { life: 0 };
    scene.add(mesh);
    return mesh;
  });

  let poolIdx  = 0;
  let spawnAcc = 0; // accumulateur pour le spawn régulier

  function spawn(x, z, t) {
    const p = pool[poolIdx % POOL_SIZE];
    poolIdx++;
    p.position.set(
      x + (Math.random() - 0.5) * 0.8,
      waveHeight(x, z, t) + 0.05,
      z + (Math.random() - 0.5) * 0.8,
    );
    p.userData.life = PARTICLE_TTL;
    p.visible = true;
    p.material.opacity = 0.5;
    p.scale.setScalar(1);
  }

  // ── Mise à jour chaque frame ──
  function update(boatState, dt, t) {
    // Spawn si le bateau avance
    if (Math.abs(boatState.speed) > 0.5) {
      spawnAcc += dt;
      const toSpawn = Math.floor(spawnAcc * SPAWN_RATE);
      if (toSpawn > 0) {
        spawnAcc -= toSpawn / SPAWN_RATE;
        for (let i = 0; i < toSpawn; i++) spawn(boatState.x, boatState.z, t);
      }
    } else {
      spawnAcc = 0;
    }

    // Vieillissement des particules
    for (const p of pool) {
      if (!p.visible) continue;
      p.userData.life -= dt;
      if (p.userData.life <= 0) {
        p.visible = false;
        continue;
      }
      const ratio = p.userData.life / PARTICLE_TTL; // 1 → 0
      p.material.opacity = ratio * 0.5;
      p.scale.setScalar(1 + (1 - ratio) * 2);       // grandit en disparaissant
      // Suit légèrement les vagues
      p.position.y = waveHeight(p.position.x, p.position.z, t) + 0.05;
    }
  }

  return { update };
}
