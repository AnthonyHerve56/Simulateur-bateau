# ⚓ Boat Simulator

Simulateur de bateau à voile 3D en temps réel, développé avec [Three.js](https://threejs.org/) et [Vite](https://vitejs.dev/).  
La physique intègre les vagues, le vent, le roulis, le tangage et l'orientation automatique des voiles.

---

## Prérequis

- [Node.js](https://nodejs.org/) ≥ 18
- npm (inclus avec Node.js)

---

## Installation

```bash
# 1. Cloner ou télécharger le dépôt
git clone <url-du-repo>
cd boat-simulator

# 2. Installer les dépendances
npm install
```

---

## Lancer le projet

```bash
npm run dev
```

Ouvre ensuite **http://localhost:5173** dans ton navigateur.

### Autres commandes

| Commande           | Description                              |
|--------------------|------------------------------------------|
| `npm run dev`      | Serveur de développement avec hot-reload |
| `npm run build`    | Compilation pour la production (`dist/`) |
| `npm run preview`  | Prévisualisation du build de production  |

---

## Contrôles

### Pilotage du bateau

| Touche        | Action          |
|---------------|-----------------|
| `↑` ou `Z`    | Avancer         |
| `↓` ou `S`    | Reculer         |
| `←` ou `Q`    | Tourner à gauche |
| `→` ou `D`    | Tourner à droite |

> Les boutons directionnels sont également disponibles via le HUD à l'écran (compatible tactile).

### Position du marin

Le marin sur le pont peut occuper 3 positions, simulant son placement par rapport au vent :

| Touche | Position                          |
|--------|-----------------------------------|
| `1`    | **Avant** – vers la proue        |
| `2`    | **Milieu** – position par défaut |
| `3`    | **Arrière** – dans le cockpit    |

Le déplacement entre les positions est animé en douceur.

### Caméra

| Touche | Mode                                                                          |
|--------|-------------------------------------------------------------------------------|
| `V`    | Basculer entre la **caméra suiveur** (vue de derrière) et la **vue FPV** (depuis les yeux du marin) |

> En vue FPV, la position de la caméra change selon la position du marin (touches `1`/`2`/`3`).

---

## Structure du projet

```
boat-simulator/
├── index.html
├── package.json
└── src/
    ├── main.js     ← Point d'entrée, boucle d'animation, caméra, HUD
    ├── scene.js    ← Scène Three.js, caméra, renderer
    ├── lights.js   ← Éclairage (soleil, ambiance)
    ├── water.js    ← Plan d'eau animé (vagues sinusoïdales)
    ├── boat.js     ← Géométrie du bateau, marin, physique
    ├── input.js    ← Clavier et boutons HUD
    ├── wake.js     ← Sillage (pool de particules)
    └── wind.js     ← Simulation du vent
```

---

## Idées pour la suite

- [ ] Ajouter des îles avec `THREE.BoxGeometry` ou du bruit de Perlin
- [ ] Remplacer la physique maison par `cannon-es` (collisions réalistes)
- [ ] Shader d'eau en GLSL pour un rendu plus réaliste
- [ ] Importer un vrai modèle GLTF de bateau avec `GLTFLoader`
- [ ] Ajouter de la pluie, du brouillard dynamique
- [ ] Mode plein écran et contrôles tactiles améliorés
