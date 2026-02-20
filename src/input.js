// ─────────────────────────────────────────────
//  input.js  –  Gestion des touches clavier + boutons HUD
// ─────────────────────────────────────────────

export function createInput() {
  // L'objet "input" est partagé avec tous les modules qui en ont besoin
  const input = {
    fwd: false,  // avancer
    bwd: false,  // reculer
    lft: false,  // tourner à gauche
    rgt: false,  // tourner à droite
    sailorPos: 2, // position du marin : 1=avant, 2=milieu (défaut), 3=arrière
  };

  // ── Clavier ──────────────────────────────────
  const keyMap = {
    ArrowUp:    'fwd', z: 'fwd', Z: 'fwd',
    ArrowDown:  'bwd', s: 'bwd', S: 'bwd',
    ArrowLeft:  'lft', q: 'lft', Q: 'lft',
    ArrowRight: 'rgt', d: 'rgt', D: 'rgt',
  };

  window.addEventListener('keydown', e => {
    if (keyMap[e.key]) input[keyMap[e.key]] = true;
    // Touches 1/2/3 : position du marin sur le bateau
    if (e.key === '1') input.sailorPos = 1;
    if (e.key === '2') input.sailorPos = 2;
    if (e.key === '3') input.sailorPos = 3;
  });
  window.addEventListener('keyup', e => {
    if (keyMap[e.key]) input[keyMap[e.key]] = false;
  });

  // ── Boutons HUD (tactile / souris) ───────────
  const hudMap = {
    'key-up':    'fwd',
    'key-down':  'bwd',
    'key-left':  'lft',
    'key-right': 'rgt',
  };

  Object.entries(hudMap).forEach(([id, action]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('pointerdown',  () => input[action] = true);
    el.addEventListener('pointerup',    () => input[action] = false);
    el.addEventListener('pointerleave', () => input[action] = false);
  });

  return input;
}
