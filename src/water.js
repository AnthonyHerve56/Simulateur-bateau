// ─────────────────────────────────────────────
//  water.js  –  Plan d'eau animé par des vagues
// ─────────────────────────────────────────────

import * as THREE from 'three';

// Nombre de subdivisions de la grille d'eau
const SEGMENTS = 80;
const SIZE     = 200;

/**
 * Calcule la hauteur d'une vague en un point (x, z) à un instant t.
 * On additionne plusieurs sinus avec des fréquences et vitesses différentes
 * pour obtenir un résultat naturel (c'est la technique de base avant les shaders).
 */
export function waveHeight(x, z, t) {
  return (
    Math.sin(x * 0.30 + t * 0.80) * 0.18 +
    Math.sin(z * 0.25 + t * 0.60) * 0.14 +
    Math.sin((x + z) * 0.15 + t * 1.10) * 0.08
  );
}

export function createWater(scene) {
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
  geo.rotateX(-Math.PI / 2);

  const mat = new THREE.MeshPhongMaterial({
    color:       0x0d3b6e,
    specular:    0x99ddff,
    shininess:   120,
    transparent: true,
    opacity:     0.88,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  scene.add(mesh);

  // On garde une référence à l'attribut position pour l'animer chaque frame
  const posAttr = geo.attributes.position;

  function update(t) {
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      posAttr.setY(i, waveHeight(x, z, t));
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals(); // recalcule les normales pour l'éclairage
  }

  return { mesh, update };
}
