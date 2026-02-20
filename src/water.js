// ─────────────────────────────────────────────
//  water.js  –  Plan d'eau avec shader réaliste
// ─────────────────────────────────────────────

import * as THREE from 'three';

// Nombre de subdivisions de la grille d'eau
const SEGMENTS = 120;
const SIZE     = 200;

/**
 * Calcule la hauteur d'une vague en un point (x, z) à un instant t.
 * (Utilisé côté JS pour la physique du bateau.)
 */
export function waveHeight(x, z, t) {
  return (
    Math.sin(x * 0.30 + t * 0.80) * 0.18 +
    Math.sin(z * 0.25 + t * 0.60) * 0.14 +
    Math.sin((x + z) * 0.15 + t * 1.10) * 0.08
  );
}

/**
 * Retourne la pente de la surface en (x, z) à l'instant t.
 * sx = dh/dx,  sz = dh/dz  (dérivées analytiques de waveHeight)
 */
export function waveSlope(x, z, t) {
  const sx =
    0.30 * 0.18 * Math.cos(x * 0.30 + t * 0.80) +
    0.15 * 0.08 * Math.cos((x + z) * 0.15 + t * 1.10);
  const sz =
    0.25 * 0.14 * Math.cos(z * 0.25 + t * 0.60) +
    0.15 * 0.08 * Math.cos((x + z) * 0.15 + t * 1.10);
  return { sx, sz };
}

// ── Vertex Shader ──────────────────────────────
const vertexShader = /* glsl */`
  uniform float uTime;

  varying vec2  vUv;
  varying float vHeight;
  varying vec3  vWorldNormal;
  varying vec3  vWorldPos;

  float waveH(float x, float z, float t) {
    return
      sin(x * 0.30 + t * 0.80) * 0.18 +
      sin(z * 0.25 + t * 0.60) * 0.14 +
      sin((x + z) * 0.15 + t * 1.10) * 0.08;
  }

  void main() {
    vUv = uv;

    vec3 pos = position;
    pos.y = waveH(pos.x, pos.z, uTime);

    // Normale par différences finies
    float eps = 0.25;
    float hpx = waveH(pos.x + eps, pos.z, uTime);
    float hpz = waveH(pos.x, pos.z + eps, uTime);
    vec3 tangX = normalize(vec3(eps, hpx - pos.y, 0.0));
    vec3 tangZ = normalize(vec3(0.0, hpz - pos.y, eps));
    vec3 n = cross(tangZ, tangX);

    vHeight      = pos.y;
    vWorldNormal = normalize(mat3(modelMatrix) * n);
    vWorldPos    = (modelMatrix * vec4(pos, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// ── Fragment Shader ─────────────────────────────
const fragmentShader = /* glsl */`
  uniform float uTime;
  uniform vec3  uCameraPos;

  varying vec2  vUv;
  varying float vHeight;
  varying vec3  vWorldNormal;
  varying vec3  vWorldPos;

  // ── Bruit procédural ──
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),               hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  // Bruit fractal (fbm) pour la texture de surface
  float fbm(vec2 p) {
    return noise(p)       * 0.500
         + noise(p * 2.1 + vec2(1.7, 0.9)) * 0.250
         + noise(p * 4.5 + vec2(3.2, 1.4)) * 0.125
         + noise(p * 9.1 + vec2(5.8, 2.3)) * 0.063;
  }

  void main() {
    // ── Texture de surface animée (deux couches décalées) ──
    vec2 uv1 = vUv * 9.0  + vec2( uTime * 0.024,  uTime * 0.011);
    vec2 uv2 = vUv * 14.0 + vec2(-uTime * 0.017, -uTime * 0.029);
    float n1 = fbm(uv1);
    float n2 = fbm(uv2);
    float surf = n1 * 0.55 + n2 * 0.45;

    // ── Normale perturbée par le bruit (vagues haute fréquence) ──
    vec3 norm = normalize(vWorldNormal + vec3(
      (n1 - 0.5) * 0.45,
      0.0,
      (n2 - 0.5) * 0.45
    ));

    // ── Fresnel ──
    vec3  viewDir = normalize(uCameraPos - vWorldPos);
    float cosV    = clamp(dot(norm, viewDir), 0.0, 1.0);
    float fresnel = 0.03 + 0.97 * pow(1.0 - cosV, 4.0);

    // ── Couleur de l'eau (profond → surface) ──
    vec3 deepColor    = vec3(0.008, 0.060, 0.180);
    vec3 surfaceColor = vec3(0.018, 0.260, 0.500);
    vec3 waterColor   = mix(deepColor, surfaceColor,
                            clamp(fresnel * 0.55 + surf * 0.12, 0.0, 1.0));

    // ── Spéculaire solaire (Blinn-Phong) ──
    vec3  lightDir = normalize(vec3(0.55, 1.6, 0.40));
    vec3  halfDir  = normalize(lightDir + viewDir);
    float NdotH    = max(dot(norm, halfDir), 0.0);
    float specSharp = pow(NdotH, 160.0);          // reflet net du soleil
    float specSoft  = pow(NdotH,  18.0) * 0.07;  // halo diffus
    waterColor += vec3(0.90, 0.97, 1.00) * specSharp;
    waterColor += vec3(0.40, 0.65, 0.85) * specSoft;

    // ── Scattering sous-surface (crêtes rétroéclairées) ──
    float sss = max(0.0, dot(norm, lightDir))
              * smoothstep(0.04, 0.22, vHeight);
    waterColor += vec3(0.00, 0.18, 0.28) * sss * 0.35;

    // ── Écume aux crêtes ──
    float foamMask  = smoothstep(0.12, 0.26, vHeight);
    float foamNoise = noise(vUv * 28.0 + uTime * 0.06);
    float foam      = foamMask * foamNoise;
    waterColor = mix(waterColor, vec3(0.93, 0.97, 1.00), foam * 0.80);

    gl_FragColor = vec4(waterColor, 0.92);
  }
`;

export function createWater(scene) {
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
  geo.rotateX(-Math.PI / 2);

  const uniforms = {
    uTime:      { value: 0.0 },
    uCameraPos: { value: new THREE.Vector3(0, 8, 16) },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  function update(t, camera) {
    uniforms.uTime.value = t;
    if (camera) uniforms.uCameraPos.value.copy(camera.position);
  }

  return { mesh, update };
}
