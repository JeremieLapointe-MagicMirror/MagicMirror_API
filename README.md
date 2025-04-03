# Magic Mirror API

Une API RESTful pour gérer les miroirs intelligents, permettant le contrôle des miroirs, des widgets et des utilisateurs.

## Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [Routes API](#routes-api)
- [Modèles de données](#modèles-de-données)
- [Tests](#tests)

## Installation

1. Clonez le dépôt

   ```bash
   git clone https://github.com/username/MagicMirror_API.git
   cd MagicMirror_API
   ```

2. Installez les dépendances
   ```bash
   npm install
   ```

## Configuration

1. Créez un fichier `.env` à la racine du projet avec le contenu suivant:

   ```
   # Port du serveur
   PORT=3001

   # Clé secrète pour les JWT
   ACCESS_TOKEN_SECRET=votre_clé_secrète_très_sécurisée
   BEARER_TOKEN_EXPIRE=24h

   # Configuration de la base de données
   DB_NAME=magicmirror
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe
   DB_HOST=localhost
   DB_DIALECT=mysql
   ```

2. Créez la base de données en utilisant votre système de gestion de base de données préféré

## Démarrage

```bash
# En mode développement
node app.js

# En production
# Utiliser pm2 ou un service systemd
```

## Structure du projet

```
MagicMirror_API/
├── app.js                  # Point d'entrée principal
├── config/                 # Configuration
│   └── database.js         # Configuration de la base de données
├── controllers/            # Contrôleurs
│   ├── mirrorController.js # Gestion des miroirs
│   ├── systemController.js # Fonctions système
│   ├── userController.js   # Authentification et gestion utilisateurs
│   └── widgetController.js # Gestion des widgets
├── middleware/             # Middleware
│   └── auth.js             # Middleware d'authentification
├── models/                 # Modèles de données
│   ├── index.js            # Configuration des associations
│   ├── Mirror.js           # Modèle de miroir
│   ├── User.js             # Modèle d'utilisateur
│   └── UserMirror.js       # Association entre utilisateurs et miroirs
├── routes/                 # Routes API
│   ├── mirrorRoutes.js     # Routes pour les miroirs
│   ├── permissionRoutes.js # Routes pour les permissions
│   ├── systemRoutes.js     # Routes système
│   ├── userRoutes.js       # Routes utilisateur
│   └── widgetRoutes.js     # Routes pour les widgets
└── util/                   # Utilitaires
    └── jwtUtil.js          # Utilitaires JWT
```

## Routes API

### Authentification

- **POST** `/api/users/register` - Inscription d'un nouvel utilisateur
- **POST** `/api/users/login` - Connexion d'un utilisateur
- **GET** `/api/users/me` - Récupérer le profil de l'utilisateur connecté
- **POST** `/api/users/logout` - Déconnexion d'un utilisateur

### Miroirs

- **GET** `/api/mirrors` - Récupérer tous les miroirs de l'utilisateur
- **GET** `/api/mirrors/:id` - Récupérer un miroir spécifique
- **POST** `/api/mirrors` - Créer un nouveau miroir
- **PUT** `/api/mirrors/:id` - Mettre à jour un miroir
- **DELETE** `/api/mirrors/:id` - Supprimer un miroir

### Widgets

- **GET** `/api/mirrors/:id/widgets` - Récupérer les widgets d'un miroir
- **PATCH** `/api/mirrors/:id/widgets/:name/toggle` - Activer/désactiver un widget

### Système

- **GET** `/api/mirrors/:id/system/info` - Récupérer les informations système d'un miroir

### Permissions

- **GET** `/api/mirrors/:id/users` - Récupérer les utilisateurs d'un miroir
- **POST** `/api/mirrors/:id/users` - Ajouter un utilisateur à un miroir
- **DELETE** `/api/mirrors/:id/users/:userId` - Retirer l'accès d'un utilisateur
- **PATCH** `/api/mirrors/:id/users/:userId/role` - Modifier le rôle d'un utilisateur

## Modèles de données

### User

- `idUser` : Identifiant unique (PK)
- `email` : Email unique de l'utilisateur
- `password` : Mot de passe hashé
- `firstName` : Prénom
- `lastName` : Nom
- `isAdmin` : Rôle administrateur
- `createdAt` : Date de création
- `lastLogin` : Dernière connexion

### Mirror

- `idMirror` : Identifiant unique (PK)
- `name` : Nom du miroir
- `config` : Configuration JSON des widgets et modules
- `ipAddress` : Adresse IP du miroir
- `lastUpdate` : Dernière mise à jour

### UserMirror

- `idUserMirror` : Identifiant unique (PK)
- `userId` : Référence à l'utilisateur (FK)
- `mirrorId` : Référence au miroir (FK)

## Tests

Vous pouvez tester l'API en utilisant Postman ou ThunderClient.
Consultez la documentation complète pour un plan de test détaillé couvrant toutes les routes.

## Licence

Ce projet est sous licence MIT.
