// ─────────────────────────────────────────────
//  lights.js  –  Éclairage de la scène
// ─────────────────────────────────────────────

import * as THREE from 'three';

export function createLights(scene) {
  // Lumière ambiante (ambiance nuit/crépuscule)
  const ambient = new THREE.AmbientLight(0x112244, 1.5);
  scene.add(ambient);

  // Soleil principal
  const sun = new THREE.DirectionalLight(0xffeedd, 2.5);
  sun.position.set(40, 60, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near   = 0.5;
  sun.shadow.camera.far    = 200;
  sun.shadow.camera.left   = sun.shadow.camera.bottom = -60;
  sun.shadow.camera.right  = sun.shadow.camera.top    =  60;
  scene.add(sun);

  // Lumière de remplissage (fill light, côté opposé)
  const fill = new THREE.DirectionalLight(0x4488cc, 0.8);
  fill.position.set(-20, 10, -20);
  scene.add(fill);

  return { ambient, sun, fill };
}
