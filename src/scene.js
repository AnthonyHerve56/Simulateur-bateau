// ─────────────────────────────────────────────
//  scene.js  –  Scène, caméra, renderer, resize
// ─────────────────────────────────────────────

import * as THREE from 'three';

export function createScene() {
  // Scène
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1628);
  scene.fog = new THREE.FogExp2(0x0a1628, 0.018);

  // Sphère de ciel (étoiles côté BackSide)
  const skyGeo = new THREE.SphereGeometry(200, 32, 16);
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x112244, side: THREE.BackSide });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  // Étoiles
  const starGeo = new THREE.BufferGeometry();
  const verts = [];
  for (let i = 0; i < 800; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(Math.random() * 0.6 + 0.3);
    const r     = 180;
    verts.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    );
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })));

  // Caméra
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 300);
  camera.position.set(0, 8, 16);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  document.body.prepend(renderer.domElement);

  // Responsive
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  return { scene, camera, renderer };
}
