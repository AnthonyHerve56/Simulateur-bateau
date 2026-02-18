# ⚓ Boat Simulator

Simulateur de bateau 3D avec Three.js et Vite.

## Installation

```bash
npm install
npm run dev
```

Ouvre http://localhost:5173 dans ton navigateur.

## Contrôles

| Touche       | Action         |
|--------------|----------------|
| ↑ / Z        | Avancer        |
| ↓ / S        | Reculer        |
| ← / Q        | Tourner gauche |
| → / D        | Tourner droite |

## Structure du projet

```
src/
├── main.js     ← Point d'entrée, boucle d'animation
├── scene.js    ← Scène Three.js, caméra, renderer
├── lights.js   ← Éclairage
├── water.js    ← Plan d'eau animé (vagues par sinus)
├── boat.js     ← Géométrie du bateau + physique
├── input.js    ← Clavier et boutons HUD
└── wake.js     ← Sillage (pool de particules)
```

## Idées pour la suite

- [ ] Ajouter des îles avec `THREE.BoxGeometry` ou du bruit de Perlin
- [ ] Remplacer la physique maison par `cannon-es` (collisions réalistes)
- [ ] Shader d'eau en GLSL pour un rendu plus réaliste
- [ ] Importer un vrai modèle GLTF de bateau avec `GLTFLoader`
- [ ] Ajouter de la pluie, du brouillard dynamique
- [ ] Mode plein écran et contrôles tactiles améliorés
