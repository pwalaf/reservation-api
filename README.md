# Reservation API

Une application web simple pour gérer les réservations d'un hôtel, d'un gîte ou d'une petite structure d'hébergement.

Elle permet de gérer les réservations, rechercher des clients, filtrer les données, suivre les statistiques et exporter les informations en CSV ou PDF.

## Fonctionnalités

* Création, modification et suppression de réservations
* Recherche de clients
* Filtres par statut, type de chambre et dates
* Tri et pagination
* Export des réservations en CSV ou PDF
* Statistiques sur les revenus et l'occupation
* Interface responsive, adaptée au mobile et au bureau
* Validation des données et gestion des erreurs

## Technologies

**Frontend**

* React
* Vite
* JavaScript
* CSS

**Backend**

* Node.js
* Express
* MongoDB
* Mongoose
* Zod

**Déploiement**

* Frontend : Vercel
* Backend : Render
* Base de données : MongoDB Atlas

## Comment ça fonctionne

L'application est composée de deux parties :

**Le frontend React** permet à l'utilisateur de gérer les réservations depuis une interface simple.

**L'API Node.js / Express** traite les demandes, vérifie les données et communique avec MongoDB.

Les deux parties communiquent à travers une API REST.

## Quelques choix techniques

Les réservations sont stockées dans MongoDB avec leur historique de statuts directement dans le document.

La partie statistiques utilise les outils d'agrégation de MongoDB pour calculer notamment :

* le revenu par mois ;
* l'occupation par type de chambre ;
* les chambres les plus demandées.

Les filtres, le tri et la pagination sont regroupés dans des fonctions réutilisables afin de garder un comportement cohérent entre l'interface et les exports.

Les données sont également contrôlées à plusieurs niveaux pour éviter les informations invalides ou incohérentes.

## Installation

### Backend

```bash
npm install
cp .env.example .env
```

Ajouter votre connexion MongoDB dans `.env` :

```env
PORT=4000
MONGODB_USERNAME=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
MONGODB_URI=your_mongodb_connection_string
```

Puis ajouter les données d'exemples et lancer le serveur :

```bash
npm run seed
npm run dev
```

L'API sera disponible sur :

```text
http://localhost:4000
```

### Frontend

```bash
cd client
npm install
npm run dev
```

L'application sera disponible sur :

```text
http://localhost:5173
```

Pour utiliser une autre URL d'API, définir :

```env
VITE_API_URL=http://localhost:4000
```

## API

| Méthode | Route                      | Description               |
| ------- | -------------------------- | ------------------------- |
| GET     | `/api/reservations`        | Liste des réservations    |
| GET     | `/api/reservations/stats`  | Statistiques              |
| GET     | `/api/reservations/export` | Export CSV ou PDF         |
| GET     | `/api/reservations/:id`    | Détail d'une réservation  |
| POST    | `/api/reservations`        | Créer une réservation     |
| PATCH   | `/api/reservations/:id`    | Modifier une réservation  |
| DELETE  | `/api/reservations/:id`    | Supprimer une réservation |

La liste des réservations accepte notamment les paramètres `status`, `roomType`, `search`, `checkInFrom`, `checkInTo`, `sort`, `page` et `limit`.

## Tests

Le fichier `test-api.sh` permet de vérifier les principales fonctionnalités de l'API, notamment :

* création et modification ;
* filtres et recherche ;
* tri et pagination ;
* exports ;
* gestion des erreurs.

Pour l'utiliser :

```bash
./test-api.sh
```

## Déploiement

Le projet peut être facilement déployé avec :

* **Vercel** pour le frontend ;
* **Render** pour le backend ;
* **MongoDB Atlas** pour la base de données.

Les variables d'environnement permettent de configurer la connexion à la base de données et l'URL du frontend.

## Améliorations possibles

Quelques fonctionnalités pourraient être ajoutées dans une prochaine version :

* authentification des utilisateurs ;
* tests automatisés avec Jest et Supertest ;
* intégration continue (CI) ;
* notifications par email ou SMS.

## Projet en ligne

**Application :**
https://reserver-une-chambre.vercel.app/

**Code source :**
GitHub — voir le dépôt associé.
