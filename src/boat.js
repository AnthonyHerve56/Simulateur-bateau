// ─────────────────────────────────────────────
//  boat.js  –  Géométrie + physique du bateau
// ─────────────────────────────────────────────

import * as THREE from 'three';
import { waveHeight, waveSlope } from './water.js';

// ── Personnage (marin) ─────────────────────────
function createSailor() {
  const g = new THREE.Group();

  const matSkin   = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
  const matCloth  = new THREE.MeshPhongMaterial({ color: 0x1a2e6e }); // pantalon bleu marine
  const matJacket = new THREE.MeshPhongMaterial({ color: 0xdd3311 }); // ciré rouge/orange
  const matHat    = new THREE.MeshPhongMaterial({ color: 0xffd700 }); // casquette jaune

  // Tête
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), matSkin);
  head.position.y = 0.92;
  g.add(head);

  // Casquette
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 8), matHat);
  hatBrim.position.y = 0.99;
  g.add(hatBrim);
  const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.14, 8), matHat);
  hatTop.position.y = 1.09;
  g.add(hatTop);

  // Torse
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.09, 0.40, 7), matJacket);
  torso.position.y = 0.57;
  g.add(torso);

  // Jambes
  for (const xOff of [-0.068, 0.068]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.040, 0.36, 6), matCloth);
    leg.position.set(xOff, 0.18, 0);
    g.add(leg);
  }

  // Bras
  for (const xOff of [-0.18, 0.18]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.028, 0.34, 6), matJacket);
    arm.position.set(xOff, 0.60, 0);
    arm.rotation.z = xOff > 0 ? -0.35 : 0.35;
    g.add(arm);
  }

  return g;
}

// ── Helpers géométrie ──────────────────────────
function makeTriangle(ax, ay, az, bx, by, bz, cx, cy, cz) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    ax, ay, az,  bx, by, bz,  cx, cy, cz,   // face avant
    cx, cy, cz,  bx, by, bz,  ax, ay, az,   // face arrière
  ]), 3));
  geo.computeVertexNormals();
  return geo;
}

export function createBoat(scene) {
  // ── Groupe parent ──
  const group = new THREE.Group();
  scene.add(group);

  // ── Matériaux ──
  const matHull = new THREE.MeshPhongMaterial({ color: 0xf0ede0, specular: 0x444444, shininess: 120 });
  const matDeck = new THREE.MeshPhongMaterial({ color: 0xd6c98a, shininess: 30 });
  const matMast = new THREE.MeshPhongMaterial({ color: 0xbbbbbb, shininess: 90 });
  const matWood = new THREE.MeshPhongMaterial({ color: 0x996633 });
  const matKeel = new THREE.MeshPhongMaterial({ color: 0x1a1a1a, shininess: 60 });
  const matSail = new THREE.MeshPhongMaterial({ color: 0xfdfaf0, side: THREE.DoubleSide, transparent: true, opacity: 0.93, shininess: 15 });
  const matCock = new THREE.MeshPhongMaterial({ color: 0x2a3a4a });

  // ── Coque ──
  // Corps central
  const hullBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 4.4), matHull);
  hullBody.castShadow = true;
  hullBody.position.y = 0.12;
  group.add(hullBody);

  // Proue pointue (cône aplati orienté vers l'avant = -Z)
  const bowGeo = new THREE.ConeGeometry(0.76, 1.5, 4, 1);
  bowGeo.rotateX(Math.PI / 2);
  bowGeo.rotateY(Math.PI / 4);
  const bow = new THREE.Mesh(bowGeo, matHull);
  bow.castShadow = true;
  bow.scale.y = 0.7 / 0.76;
  bow.position.set(0, 0.12, -2.95);
  group.add(bow);

  // Pont (deck)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.07, 4.3), matDeck);
  deck.receiveShadow = true;
  deck.position.set(0, 0.5, 0);
  group.add(deck);

  // Cockpit
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 1.9), matCock);
  cockpit.position.set(0, 0.49, 1.1);
  group.add(cockpit);

  // Quille
  const keel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.9, 1.6), matKeel);
  keel.position.set(0, -0.6, 0.1);
  group.add(keel);

  // ── Mât ──
  const MAST_H = 7.0;
  const MAST_Z = -0.4;
  const DECK_Y = 0.53;

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.055, MAST_H, 8), matMast);
  mast.castShadow = true;
  mast.position.set(0, DECK_Y + MAST_H / 2, MAST_Z);
  group.add(mast);

  // Étai avant (forestay)
  const BOW_Z   = -4.3;  // étrave en local groupe
  const fsLen   = Math.sqrt(MAST_H * MAST_H + (BOW_Z - MAST_Z) ** 2);
  const fsAngle = Math.atan2(-(BOW_Z - MAST_Z), MAST_H);
  const forestay = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, fsLen, 4),
    new THREE.MeshPhongMaterial({ color: 0x999999 }),
  );
  forestay.rotation.x = fsAngle;
  forestay.position.set(0, DECK_Y + MAST_H / 2 + Math.cos(fsAngle) * fsLen / 2 - MAST_H / 2,
                            MAST_Z + Math.sin(-fsAngle) * fsLen / 2);
  group.add(forestay);

  // Haubans latéraux
  [-0.75, 0.75].forEach(side => {
    const shrLen = Math.sqrt((MAST_H * 0.85) ** 2 + 0.75 ** 2 + 0.5 ** 2);
    const shr = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, shrLen, 4),
      new THREE.MeshPhongMaterial({ color: 0x999999 }),
    );
    shr.position.set(side / 2, DECK_Y + MAST_H * 0.85 / 2, MAST_Z + 0.3);
    const dir = new THREE.Vector3(side, -(MAST_H * 0.85), 0.5).normalize();
    shr.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.negate());
    group.add(shr);
  });

  // ── Groupe voiles (pivote autour du mât selon le vent) ──
  const sailGroup = new THREE.Group();
  sailGroup.position.set(0, DECK_Y, MAST_Z);
  group.add(sailGroup);

  // Bôme
  const BOOM_L = 3.2;
  const BOOM_Y = 0.85;
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, BOOM_L, 6), matWood);
  boom.rotation.z = Math.PI / 2;
  boom.position.set(BOOM_L / 2, BOOM_Y, 0);
  sailGroup.add(boom);

  // Grand-voile (mainsail) : pied de mât → tête de mât → bout de bôme
  const mainsail = new THREE.Mesh(
    makeTriangle(
      0, 0.25, 0,
      0, MAST_H, 0,
      BOOM_L, BOOM_Y + 0.05, 0,
    ),
    matSail,
  );
  mainsail.castShadow = true;
  sailGroup.add(mainsail);

  // ── Groupe foc (pivote indépendamment, moins amplement) ──
  const jibGroup = new THREE.Group();
  jibGroup.position.set(0, DECK_Y, MAST_Z);
  group.add(jibGroup);

  const JIB_BOW_Z = BOW_Z - MAST_Z; // relatif au groupe foc
  const jib = new THREE.Mesh(
    makeTriangle(
      0, MAST_H * 0.88, 0,
      0, 0.2, 0,
      0, 0.25, JIB_BOW_Z,
    ),
    matSail,
  );
  jibGroup.add(jib);

  // ── Marin + positions ──
  // Position en Z local du groupe bateau (axe avant = −Z)
  const SAILOR_POSITIONS = [
    { x: 0, z: -1.5 },  // 1 : avant (proue)
    { x: 0, z: -0.1 },  // 2 : milieu (défaut)
    { x: 0, z:  1.2 },  // 3 : arrière (cockpit)
  ];

  const sailor = createSailor();
  sailor.position.set(
    SAILOR_POSITIONS[1].x,
    DECK_Y + 0.02,
    SAILOR_POSITIONS[1].z,
  );
  group.add(sailor);

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
  function update(input, dt, t, water, wind) {
    // Vitesse max modulée par le vent
    const wFactor   = wind ? wind.speedFactor(state.angle) : 1;
    const effectiveMax = state.maxSpeed * wFactor;

    // Accélération / décélération
    if (input.fwd && effectiveMax > 0) {
      // On ne peut accélérer que si le vent le permet
      state.speed = Math.min(state.speed + state.accel * dt, effectiveMax);
    } else if (input.bwd) {
      state.speed = Math.max(state.speed - state.accel * dt, -state.maxSpeed * 0.4);
    } else {
      // Résistance de l'eau (drag)
      if (state.speed > 0) state.speed = Math.max(0, state.speed - state.decel * dt);
      else                 state.speed = Math.min(0, state.speed + state.decel * dt);
    }

    // Freinage progressif si la vitesse dépasse le max autorisé par le vent
    // (ralentissement en 2–3 s selon l'angle : plus on est face au vent, plus c'est fort)
    if (state.speed > effectiveMax) {
      const headwindBrake = effectiveMax === 0
        ? state.decel * 2.5                    // vent de face : freine fort
        : state.decel * 1.2;                   // vent défavorable partiel : freine doucement
      state.speed = Math.max(effectiveMax, state.speed - headwindBrake * dt);
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

    // ── Pente des vagues sous le bateau ──
    const { sx, sz } = waveSlope(state.x, state.z, t);
    const sinA = Math.sin(state.angle);
    const cosA = Math.cos(state.angle);
    // Projection sur l'axe avant du bateau (forward = [-sinA, 0, -cosA])
    const slopeFwd  = sx * (-sinA) + sz * (-cosA);
    // Projection sur l'axe latéral (right = [cosA, 0, -sinA])
    const slopeRight = sx * cosA   + sz * (-sinA);

    // Légère résistance en montée de vague
    state.speed -= slopeFwd * state.speed * 1.8 * dt;

    // Appliquer la position au groupe 3D
    group.position.set(state.x, state.waterHeight + 0.1, state.z);
    group.rotation.y = state.angle;

    // Roulis : virages + inclinaison latérale de la vague
    const targetRoll  = (input.rgt ? 1 : input.lft ? -1 : 0) * 0.08 * turnFactor
                      - slopeRight * 1.4;
    group.rotation.z  = THREE.MathUtils.lerp(group.rotation.z, targetRoll, 0.12);

    // Tangage : vitesse + pente longitudinale de la vague
    const targetPitch = -(state.speed / state.maxSpeed) * 0.06 + slopeFwd * 1.2;
    group.rotation.x  = THREE.MathUtils.lerp(group.rotation.x, targetPitch, 0.10);

    // ── Position du marin ──
    if (input.sailorPos >= 1 && input.sailorPos <= 3) {
      const tgt = SAILOR_POSITIONS[input.sailorPos - 1];
      sailor.position.x = THREE.MathUtils.lerp(sailor.position.x, tgt.x, 0.07);
      sailor.position.z = THREE.MathUtils.lerp(sailor.position.z, tgt.z, 0.07);
    }

    // ── Orientation des voiles selon le vent ──
    if (wind) {
      const windDir = wind.state.angle + Math.PI;
      let rel = windDir + state.angle;
      rel = ((rel + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      // rel : 0 = vent dans le dos, ±π = vent de face
      // La voile s'ouvre côté sous le vent (opposé au vent)
      const side = rel >= 0 ? -1 : 1;
      const absRel = Math.abs(rel);

      let targetSailAngle;
      if (absRel < Math.PI / 5) {
        // Vent arrière : voile grande ouverte (presque perpendiculaire)
        targetSailAngle = side * Math.PI * 0.44;
      } else if (absRel < Math.PI * 0.65) {
        // Vent de travers : voile à ~45°
        const tRatio = (absRel - Math.PI / 5) / (Math.PI * 0.65 - Math.PI / 5);
        targetSailAngle = side * THREE.MathUtils.lerp(Math.PI * 0.44, Math.PI * 0.2, tRatio);
      } else {
        // Au près / vent de face : voile rentrée dans l'axe
        const tRatio = (absRel - Math.PI * 0.65) / (Math.PI - Math.PI * 0.65);
        targetSailAngle = side * THREE.MathUtils.lerp(Math.PI * 0.2, Math.PI * 0.05, tRatio);
      }

      sailGroup.rotation.y = THREE.MathUtils.lerp(sailGroup.rotation.y, targetSailAngle, 0.04);
      jibGroup.rotation.y  = THREE.MathUtils.lerp(jibGroup.rotation.y,  targetSailAngle * 0.65, 0.04);
    }
  }

  return { group, state, update, sailor };
}
