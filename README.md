# Reservation API

API de gestion de réservations pour petites structures d'hébergement
(hôtels, gîtes) — CRUD complet + statistiques via agrégation MongoDB.

Pensée pour être montrée en 2 minutes : une seule collection, un pipeline
d'agrégation qui répond à une vraie question métier (revenu, occupation,
chambre la plus demandée).

## Installation

```bash
npm install
cp .env.example .env
# renseigner MONGODB_URI dans .env (un cluster Atlas gratuit suffit)
npm run seed   # peuple la base avec des données de démo
npm run dev    # démarre le serveur avec rechargement automatique
```

## Endpoints

| Méthode | Route                     | Description                              |
|---------|---------------------------|-------------------------------------------|
| GET     | /api/reservations         | Liste (filtres `?status=` et `?roomType=`)|
| GET     | /api/reservations/stats   | Revenu/mois, occupation par type, top room|
| GET     | /api/reservations/:id     | Détail d'une réservation                  |
| POST    | /api/reservations         | Créer une réservation                     |
| PATCH   | /api/reservations/:id     | Modifier (ex: changer le statut)          |
| DELETE  | /api/reservations/:id     | Supprimer                                 |

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

# Lister les réservations confirmées
curl "http://localhost:4000/api/reservations?status=confirmee"

# Statistiques (revenu par mois, occupation par type de chambre)
curl http://localhost:4000/api/reservations/stats
```

## Interface (client/)

Un client React minimal pour piloter l'API : statistiques en tête de page,
filtres par statut, création de réservation, changement de statut et
suppression en ligne. Pas de bibliothèque UI — CSS sur-mesure avec des
tokens de design (couleurs, typographie, espacements) définis dans
`client/src/styles/tokens.css`.

```bash
cd client
npm install
npm run dev   # http://localhost:5173, l'API doit tourner sur le port 4000
```

## Ce que ce mini-projet démontre

- Schéma Mongoose avec validation au niveau du modèle (règle métier :
  `checkOut` après `checkIn`) en plus de la validation HTTP.
- Validation stricte des entrées avec Zod, erreurs renvoyées en JSON structuré.
- Gestion d'erreurs centralisée (`errorHandler.js`) plutôt que des
  try/catch dupliqués dans chaque route.
- Pipeline d'agrégation MongoDB (`$facet`, `$group`, `$match`) qui répond
  en un seul aller-retour base de données à trois questions métier réelles.
- Index composé (`status`, `checkIn`) pour les requêtes filtrées les plus
  fréquentes.

## Pour aller plus loin (hors scope de cette version rapide)

- Authentification (un gérant par structure)
- Pagination sur `GET /api/reservations`
- Notifications (email/SMS) de confirmation
