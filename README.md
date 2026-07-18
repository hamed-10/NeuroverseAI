# NeuroVerse AI — Frontend (Dashboard médecin)

## Installation

```bash
npm install
npm run dev
```

Ouvre l'adresse affichée dans le terminal (en général `http://localhost:5173`).

## Structure

```
src/
  design/tokens.js          → couleurs et typographies (source unique de vérité)
  components/
    Logo.jsx                → logo NeuroVerse en SVG
    Sidebar.jsx              → navigation principale
    StatusBadge.jsx          → badge brouillon/validé
    ChildCard.jsx             → carte d'un enfant dans la liste
    ChildList.jsx             → écran "Enfants suivis" (dashboard)
    ChildDetail.jsx            → fiche patient + synthèse à valider
    RoadmapCoordination.jsx    → maquette Agent Coordination
    RoadmapPublicHealth.jsx    → maquette Éducation + Santé publique
  mocks/
    children.mock.js          → fausses données pour la liste
    childDetail.mock.js        → fausses données pour une fiche patient
  App.jsx                    → assemble tout, gère la navigation
  main.jsx                   → point d'entrée React
  index.css                  → Tailwind
```

## Brancher le vrai backend (Dev 1)

Deux fonctions à remplacer une fois les endpoints prêts — voir `CONTRAT-API.md`
pour la forme exacte des données attendues.

1. Dans `src/components/ChildList.jsx`, fonction `getChildren()`
2. Dans `src/components/ChildDetail.jsx`, fonctions `getChildDetail(id)` et `validateSynthesis(id, content)`

Remplacer par exemple :

```js
async function getChildren() {
  const res = await fetch("https://api.neuroverse.app/api/children", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Erreur de chargement");
  return res.json();
}
```

Aucun autre fichier n'a besoin de changer : tous les composants attendent déjà
la forme de données définie dans le contrat.

## Images

Aucune image externe n'est nécessaire pour ce MVP : avatars en initiales,
icônes via `lucide-react` (SVG en code), logo en SVG (`Logo.jsx`). Si tu veux
ajouter une illustration pour un écran vide plus tard, des libraires libres de
droits comme unDraw ou Storyset conviennent bien au style de l'app.
