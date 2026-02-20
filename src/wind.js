// ─────────────────────────────────────────────
//  wind.js  –  Simulation du vent
// ─────────────────────────────────────────────

export function createWind() {
  const state = {
    angle:     Math.random() * Math.PI * 2,  // direction d'où vient le vent (radians)
    speed:     4 + Math.random() * 4,        // force du vent (unités/s)
    // Paramètres de variation lente
    _targetAngle: 0,
    _targetSpeed: 0,
    _changeTimer: 0,
    _changePeriod: 10, // secondes entre chaque changement de cible
  };

  state._targetAngle  = state.angle;
  state._targetSpeed  = state.speed;

  /**
   * Met à jour le vent (variation douce et aléatoire).
   * @param {number} dt - delta time en secondes
   */
  function update(dt) {
    state._changeTimer += dt;
    if (state._changeTimer >= state._changePeriod) {
      state._changeTimer  = 0;
      state._changePeriod = 8 + Math.random() * 12;
      // Légère rotation aléatoire (max ±60°)
      state._targetAngle += (Math.random() - 0.5) * Math.PI * 0.67;
      // Vitesse cible (entre 2 et 10)
      state._targetSpeed = 2 + Math.random() * 8;
    }

    // Interpolation douce vers la cible
    state.angle = lerpAngle(state.angle, state._targetAngle, dt * 0.3);
    state.speed = lerp(state.speed, state._targetSpeed, dt * 0.2);
  }

  /**
   * Retourne un facteur multiplicateur de vitesse max pour le bateau.
   * Modèle polaire :
   *   - Vent de face   (150°–180°) → 0   : bloque complètement le bateau
   *   - Vent de travers (60°–120°) → 1.6 : gros bonus (voile gonflée)
   *   - Vent de derrière (0°–45°)  → 1.2 : petit bonus
   *   - Zones intermédiaires       → interpolation lisse
   *
   * @param {number} boatAngle - cap du bateau (radians)
   * @returns {number} facteur entre 0 et ~1.6
   */
  function speedFactor(boatAngle) {
    // Angle relatif : 0 = vent dans le dos, π = vent de face
    // En Three.js, boat.angle est anti-horaire → on additionne les angles
    const windDir = state.angle + Math.PI; // direction vers laquelle souffle le vent
    let rel = windDir + boatAngle;
    rel = ((rel + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    const absRel = Math.abs(rel); // 0 = dos, π = face

    // Intensité proportionnelle à la force du vent (0..1)
    const intensity = Math.min(state.speed / 10, 1);

    const D45  = Math.PI / 4;         // 45°
    const D60  = Math.PI / 3;         // 60°
    const D120 = 2 * Math.PI / 3;     // 120°
    const D150 = 5 * Math.PI / 6;     // 150°

    let base;

    if (absRel <= D45) {
      // Vent dans le dos (0°–45°) → petit bonus
      base = 1.2;
    } else if (absRel <= D60) {
      // Transition dos → travers (45°–60°)
      const t = (absRel - D45) / (D60 - D45);
      base = lerp(1.2, 1.6, t);
    } else if (absRel <= D120) {
      // Vent de travers (60°–120°) → gros bonus, pic à 90°
      const t = (absRel - D60) / (D120 - D60);           // 0→1
      const bell = Math.sin(t * Math.PI);                 // 0→1→0
      base = 1.6 + bell * 0.1;                            // léger pic à 90°
    } else if (absRel <= D150) {
      // Transition travers → face (120°–150°) → retour à 1 puis vers 0
      const t = (absRel - D120) / (D150 - D120);
      base = lerp(1.6, 0, t);
    } else {
      // Vent de face (150°–180°) → bloque complètement
      base = 0;
    }

    // Sans vent (intensity ≈ 0) la valeur tombe à 1 (neutre)
    return lerp(1, base, intensity);
  }

  return { state, update, speedFactor };
}

// ── Helpers ───────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * Math.min(t, 1); }

function lerpAngle(a, b, t) {
  let diff = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  return a + diff * Math.min(t, 1);
}
