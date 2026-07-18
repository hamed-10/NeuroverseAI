# Contrat d'API — NeuroVerse AI

## ⚠️ Écarts constatés entre le contrat et le backend livré (à corriger)

Après lecture du code réel (`neuroverse-ai-backend`), 3 points à corriger côté
Dev 1 avant qu'on puisse brancher complètement :

1. **`synthesis.id` manquant dans `GET /api/children/:id`.**
   `POST /api/synthesis/:id/validate` attend l'ID de la synthèse, mais
   l'objet `synthesis` renvoyé par `children.findById` ne contient pas
   cet `id`. Sans lui, impossible d'appeler la validation depuis le
   frontend. → Ajouter `id: syntheses[0].id` dans l'objet retourné
   (`src/repositories/children.js`, fonction `findById`).

2. **`entries[].type` toujours codé en dur sur `"crise"`.**
   Dans `children.js`, `findById` : `type: 'crise'` est fixe pour
   toutes les entrées, qu'il s'agisse de sommeil ou de traitement.
   Le frontend affiche donc la mauvaise icône pour ces entrées. →
   Déduire le type réel depuis les champs `seizures` / `treatment_taken`
   / `sleep` de la table `follow_up`.

3. **`docs/manual-tests.md` ne correspond pas aux routes réelles.**
   Le doc montre `PATCH /api/syntheses/1/validate` (pluriel + PATCH),
   alors que `src/routes/index.js` définit `POST /api/synthesis/:id/validate`
   (singulier + POST). Le frontend suit le code (`routes/index.js`), qui
   fait foi. → Mettre à jour la doc pour éviter la confusion en semaine 3.

Point mineur, non bloquant : `lastName` est toujours vide (pas de champ
en base) — le frontend gère déjà ce cas proprement.

---

Document vivant, complété écran par écran. Chaque endpoint ici doit être validé
par Dev 1 (backend) et Dev 3 (frontend) avant que Dev 3 ne code contre le vrai
backend. En attendant, Dev 3 travaille avec un mock qui respecte exactement
cette forme.

---

## Écran 0 — Authentification médecin

### `POST /api/auth/login`

**Corps envoyé par le frontend**
```json
{ "email": "docteur@neuroverse.app", "password": "..." }
```

**Réponse attendue (200)**
```json
{
  "token": "un-token-a-renvoyer-dans-les-requetes-suivantes",
  "doctorName": "Dr Essoin de Souza"
}
```

**Réponse en cas d'échec (401)**
```json
{ "error": "Email ou mot de passe incorrect." }
```

Le frontend renvoie ensuite ce `token` dans le header `Authorization: Bearer <token>`
sur tous les appels suivants (`GET /api/children`, etc.). Pas de gestion de rôles
multiples pour le MVP — un seul type d'utilisateur : médecin.

### Ce qui reste à définir ensemble
- Durée de vie du token / faut-il gérer un refresh ? → **recommandation : non pour le MVP**, un token simple valable pour la session suffit, vu qu'il n'y a qu'une démo à faire tenir 3 semaines.

---

## Écran 1 — Dashboard médecin (liste des enfants suivis)

### `GET /api/children`

Retourne la liste des enfants suivis, avec le statut de leur dernière synthèse.

**Réponse attendue (200)**

```json
[
  {
    "id": "child_001",
    "firstName": "Fatou",
    "lastName": "K.",
    "age": 6,
    "lastEntryNote": "1 crise signalée cette semaine",
    "lastEntryDate": "2026-07-10T19:42:00Z",
    "synthesisStatus": "brouillon"
  },
  {
    "id": "child_002",
    "firstName": "Yao",
    "lastName": "M.",
    "age": 9,
    "lastEntryNote": "Observance traitement 100%",
    "lastEntryDate": "2026-07-09T08:00:00Z",
    "synthesisStatus": "valide"
  }
]
```

### Règles à respecter côté backend

| Champ | Type | Contrainte |
|---|---|---|
| `id` | string | identifiant unique de l'enfant, pas l'index du tableau |
| `firstName` / `lastName` | string | `lastName` déjà tronqué/anonymisé si besoin (ex: "K.") — le frontend n'anonymise rien lui-même |
| `age` | number | en années |
| `lastEntryNote` | string | résumé court d'une ligne, généré côté backend ou déduit de la dernière fiche de suivi |
| `lastEntryDate` | string | format **ISO 8601** (`new Date()` le lit nativement en JS) |
| `synthesisStatus` | string | uniquement `"brouillon"` ou `"valide"` — pas d'autre valeur, le frontend fait un `switch` dessus |

### Ce qui reste à définir ensemble (à ne pas deviner de mon côté)
- Pagination ou liste complète ? (probablement liste complète vu le volume MVP)
- Authentification : le token du médecin passe en header `Authorization`, à confirmer avec Dev 1
- Recherche/filtre côté backend (`?status=brouillon`) ou côté frontend sur la liste complète ? → **recommandation : côté frontend pour le MVP**, plus simple pour Dev 1, la liste reste petite

---

## Écran 3 — Fiche patient (historique + synthèse)

### `GET /api/children/:id`

**Réponse attendue (200)**

```json
{
  "id": "child_001",
  "firstName": "Fatou",
  "lastName": "K.",
  "age": 6,
  "entries": [
    { "id": "e1", "type": "crise", "label": "Crise · 1–3 min", "date": "2026-07-10T19:42:00Z" },
    { "id": "e2", "type": "sommeil", "label": "Sommeil agité", "date": "2026-07-10T19:42:00Z" },
    { "id": "e3", "type": "traitement", "label": "Traitement pris", "date": "2026-07-10T19:42:00Z" }
  ],
  "synthesis": {
    "status": "brouillon",
    "content": "Texte généré par l'Agent Clinique...",
    "alert": "Point d'attention : qualité du sommeil"
  }
}
```

| Champ | Contrainte |
|---|---|
| `entries[].type` | uniquement `"crise"`, `"sommeil"` ou `"traitement"` — le frontend choisit l'icône selon cette valeur, pas d'autre type sans prévenir Dev 3 |
| `synthesis.status` | `"brouillon"` ou `"valide"` |
| `synthesis.alert` | optionnel, `null` ou absent si rien à signaler |

### `POST /api/synthesis/:id/validate`

Envoyé quand le médecin clique "Valider la synthèse" (éventuellement après modification).

**Corps envoyé par le frontend**
```json
{ "content": "Texte final validé par le médecin, potentiellement modifié" }
```

**Réponse attendue (200)**
```json
{ "status": "valide" }
```

### Ce qui reste à définir ensemble
- Doit-on garder une trace de "qui a modifié quoi" (contenu original IA vs contenu édité par le médecin) ? Recommandé pour la traçabilité mentionnée dans le cahier des charges (exigence Dev 2 : "toute sortie de l'Agent Clinique doit être traçable").
- Gestion d'erreur si la validation échoue côté serveur (ex: réseau) → prévoir un message d'erreur affiché côté frontend, pas juste un échec silencieux.
