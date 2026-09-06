# Reservation API

API de gestion de réservations pour petites structures d'hébergement
(hôtels, gîtes) — CRUD complet, filtres/tri/pagination, exports CSV/PDF,
et statistiques via agrégation MongoDB.

Pensée pour être montrée en quelques minutes : une seule collection, un
pipeline d'agrégation qui répond à une vraie question métier (revenu,
occupation, chambre la plus demandée), et une interface qui reste utilisable
du mobile au grand écran.

## Installation

```bash
npm install
cp .env.example .env
# renseigner MONGODB_URI dans .env (un cluster Atlas gratuit suffit)
npm run seed   # peuple la base avec des données de démo
npm run dev    # démarre le serveur avec rechargement automatique
```

## Endpoints

| Méthode | Route                     | Description                                          |
|---------|---------------------------|--------------------------------------------------------|
| GET     | /api/reservations         | Liste paginée, filtrée et triée (voir params ci-dessous)|
| GET     | /api/reservations/export  | Export CSV ou PDF du même jeu filtré (sans pagination)  |
| GET     | /api/reservations/stats   | Revenu/mois, occupation par type, top room              |
| GET     | /api/reservations/:id     | Détail d'une réservation                                |
| POST    | /api/reservations         | Créer une réservation                                   |
| PATCH   | /api/reservations/:id     | Modifier (ex: changer le statut)                        |
| DELETE  | /api/reservations/:id     | Supprimer                                               |

### Paramètres de `GET /api/reservations` et `/export`

| Param         | Exemple                  | Effet                                              |
|---------------|---------------------------|-----------------------------------------------------|
| `status`      | `confirmee`               | Filtre par statut                                    |
| `roomType`    | `suite`                   | Filtre par type de chambre                           |
| `search`      | `rakoto`                  | Recherche partielle sur le nom du client (insensible à la casse) |
| `checkInFrom` | `2026-10-01`               | Réservations arrivant à partir de cette date         |
| `checkInTo`   | `2026-10-31`               | Réservations arrivant jusqu'à cette date (incluse)   |
| `sort`        | `-amount`, `checkIn`, `clientName` | Tri ascendant par défaut, `-` en préfixe = descendant |
| `page`, `limit` | `page=2&limit=20`        | Pagination (`/export` l'ignore, plafonné à 1000 lignes) |
| `format`      | `csv` \| `pdf`             | Uniquement sur `/export`, CSV par défaut             |

`GET /api/reservations` renvoie `{ data: [...], meta: { page, limit, total, totalPages } }`.

## Démo rapide (curl)

```bash
# Créer une réservation
curl -X POST http://localhost:4000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Rina Randria",
    "roomType": "double",
    "checkIn": "2026-09-01",
    "checkOut": "2026-09-03",
    "status": "confirmee",
    "amount": 130000
  }'

# Lister les réservations confirmées, triées par montant décroissant
curl "http://localhost:4000/api/reservations?status=confirmee&sort=-amount"

# Exporter en CSV les réservations de suite arrivant en octobre
curl "http://localhost:4000/api/reservations/export?roomType=suite&checkInFrom=2026-10-01&checkInTo=2026-10-31&format=csv" -o export.csv

# Statistiques (revenu par mois, occupation par type de chambre)
curl http://localhost:4000/api/reservations/stats
```

Le script `test-api.sh` couvre tous ces cas (filtres, tri, pagination,
export, erreurs attendues) — `./test-api.sh` une fois le serveur lancé.

## Interface (client/)

Un client React (Vite) minimal pour piloter l'API : statistiques en tête de
page, onglets de statut + recherche, un panneau de filtres avancés replié par
défaut (type de chambre, plage de dates d'arrivée), tri, pagination, export
CSV/PDF, et des notifications (toasts) pour chaque action. Pleine largeur et
responsive — le tableau devient une pile de cartes sous 720px. Pas de
bibliothèque UI — CSS sur-mesure avec des tokens de design définis dans
`client/src/styles/tokens.css`.

```bash
cd client
npm install
npm run dev   # http://localhost:5173, l'API doit tourner sur le port 4000
```

Variable d'environnement du client : `VITE_API_URL` (URL de l'API, sans
slash final). En local, `http://localhost:4000` est utilisé par défaut.

## Déploiement

- **Backend → Render** : Web Service pointant sur la racine du repo,
  `npm install` / `npm start`. Variables d'environnement : `MONGODB_URI`,
  et `CORS_ORIGIN` (URL du client Vercel, pour restreindre le CORS en
  production — laissé vide, CORS est ouvert à tout, pratique en local).
- **Frontend → Vercel** : projet avec Root Directory `client`, preset Vite.
  Variable d'environnement : `VITE_API_URL` = URL du backend Render.

## Ce que ce mini-projet démontre

- Schéma Mongoose avec validation au niveau du modèle (règle métier :
  `checkOut` après `checkIn`) en plus de la validation HTTP.
- Validation stricte des entrées avec Zod, erreurs renvoyées en JSON structuré.
- Gestion d'erreurs centralisée (`errorHandler.js`) plutôt que des
  try/catch dupliqués dans chaque route.
- Pipeline d'agrégation MongoDB (`$facet`, `$group`, `$match`, `$unwind`)
  qui répond en un seul aller-retour base de données à trois questions
  métier réelles.
- Filtrage, tri et pagination construits comme des fonctions pures
  (`src/utils/reservationQuery.js`), partagées entre la liste et l'export —
  donc testables sans base de données et garanties cohérentes entre les deux.
- Index composé (`status`, `checkIn`) pour les requêtes filtrées les plus
  fréquentes.
- Génération de CSV (échappement correct, BOM UTF-8 pour Excel) et de PDF
  (`pdfkit`) à partir du même jeu de données filtré que l'écran.

## Pour aller plus loin (hors scope de cette version rapide)

- Authentification (un gérant par structure)
- Suite de tests automatisés (Jest/Supertest) en plus du script curl manuel
- CI (lint + tests à chaque push)
- Notifications (email/SMS) de confirmation
