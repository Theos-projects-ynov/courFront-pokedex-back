# 🎮 DonjonDex - Jeu Pokémon Full-Stack

Application complète de capture et combat de Pokémon avec système de donjon.

- **Frontend** : React + TypeScript + Vite + Material-UI
- **Backend** : Node.js + TypeScript + Express + WebSocket

## 🚀 Technologies

### Frontend

- **React 19** + **TypeScript**
- **Vite** - Build tool moderne
- **Material-UI** - Composants UI
- **Redux Toolkit** - Gestion d'état
- **SCSS** - Styling personnalisé

### Backend

- **Node.js** + **TypeScript**
- **Express.js** - API REST
- **WebSocket** - Communication temps réel pour les combats
- **Prisma** - ORM pour la base de données
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **bcrypt** - Chiffrement des mots de passe

### Infrastructure

- **Docker** - Conteneurisation complète
- **Docker Compose** - Orchestration des services

## 📁 Structure du Projet

```
donjondex/
├── clicker-pokemon-front/    # 🎮 Application React Frontend
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/          # Pages de l'application
│   │   ├── store/          # Redux store
│   │   ├── services/       # Services API
│   │   └── types/          # Types TypeScript
│   ├── public/             # Assets statiques
│   └── Dockerfile          # Image Docker frontend
│
├── clicker-pokemon-back/     # ⚡ API Backend Node.js
│   ├── src/
│   │   ├── api/           # Intégrations APIs externes
│   │   ├── config/        # Configuration
│   │   ├── controller/    # Contrôleurs REST
│   │   ├── middlewares/   # Middlewares Express
│   │   ├── models/        # Interfaces TypeScript
│   │   ├── router/        # Routes Express
│   │   ├── services/      # Logique métier
│   │   ├── ws/            # Gestionnaires WebSocket
│   │   │   ├── battle/    # Combat 1v1
│   │   │   └── dungeon/   # Combat de donjon
│   │   └── server.ts      # Point d'entrée
│   ├── prisma/            # Base de données
│   └── Dockerfile         # Image Docker backend
│
└── docker-compose.yml        # 🐳 Orchestration complète
```

## 🐳 Installation avec Docker (Recommandé)

### Prérequis

- Docker & Docker Compose

### Démarrage Complet

```bash
# Depuis la racine du projet - démarre TOUT l'écosystème
docker compose up -d

# Vérifier les logs (backend et frontend)
docker compose logs -f
```

### 🎯 Services Disponibles

- **🎮 Frontend React** : http://localhost:3000 (Interface du jeu)
- **⚡ Backend API** : http://localhost:4000 (REST API)
- **🔌 WebSocket** : ws://localhost:4001 (Combat temps réel)
- **🗄️ PostgreSQL** : localhost:5432 (Base de données)
- **🛠️ pgAdmin** : http://localhost:5050 (Interface DB - admin@poke.com / admin123)

> ✅ **Une seule commande et tout fonctionne !** Le frontend, le backend, la base de données et les outils d'administration sont automatiquement configurés et connectés.

## 🔧 Installation Manuelle

### Prérequis

- Node.js 18+
- PostgreSQL
- npm ou yarn

### Configuration

```bash
# Installation des dépendances
npm install

# Configuration de la base de données
cp .env.example .env
# Éditer .env avec vos paramètres DB

# Migrations Prisma
npx prisma migrate deploy
npx prisma generate

# Démarrage en développement
npm run dev
```

## 🎮 Utilisation

### Accès à l'Application

1. **Démarrer l'environnement complet :**

   ```bash
   docker compose up -d
   ```

2. **Accéder au jeu :**

   - Ouvrir http://localhost:3000 dans votre navigateur
   - Créer un compte ou se connecter
   - Commencer à capturer des Pokémon !

3. **Outils de développement :**
   - **pgAdmin** : http://localhost:5050 (gestion base de données)
   - **API Backend** : http://localhost:4000 (endpoints REST)
   - **WebSocket** : ws://localhost:4001 (debugging temps réel)

### Commandes Utiles

```bash
# Voir les logs en temps réel
docker compose logs -f

# Redémarrer un service spécifique
docker compose restart frontend
docker compose restart backend

# Arrêter tous les services
docker compose down

# Reconstruire si modifications
docker compose up --build -d
```

## 🌐 API REST Endpoints

### 👤 Authentification

#### Inscription

```http
POST /api/trainer/register
Content-Type: application/json

{
  "email": "trainer@pokemon.com",
  "password": "motdepasse123",
  "name": "Sacha"
}
```

#### Connexion

```http
POST /api/trainer/login
Content-Type: application/json

{
  "email": "trainer@pokemon.com",
  "password": "motdepasse123"
}
```

### 🔍 Pokémon

#### Lister mes Pokémon

```http
GET /api/pokemon/owned
Authorization: Bearer <jwt_token>
```

#### Détails d'un Pokémon

```http
GET /api/pokemon/:id
Authorization: Bearer <jwt_token>
```

#### Modifier un Pokémon

```http
PATCH /api/pokemon/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Nouveau nom",
  "level": 25
}
```

### 🎯 Capture

#### Capturer un Pokémon sauvage

```http
POST /api/capture/wild
Authorization: Bearer <jwt_token>
```

#### Capturer un Pokémon spécifique

```http
POST /api/capture/specific
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "pokedexId": 25
}
```

## 🔌 WebSocket

### Battle WebSocket - `ws://localhost:4001/battle`

Combat 1v1 temps réel entre dresseurs.

#### Messages supportés :

- `ATTACK` - Lancer une attaque
- `SWITCH_POKEMON` - Changer de Pokémon
- `USE_ITEM` - Utiliser un objet

### Dungeon WebSocket - `ws://localhost:4001/dungeon`

Système de donjon avec combats successifs.

#### Messages supportés :

- `START_DUNGEON` - Commencer un donjon
- `SELECT_TEAM` - Sélectionner l'équipe (4 Pokémon)
- `START_FIGHT` - Démarrer le combat
- `ATTACK` - Attaquer l'ennemi
- `CHANGE_POKEMON` - Changer de Pokémon (si KO)

#### Messages reçus :

- `DUNGEON_COMPLETED_WIN` - Victoire avec récompenses
- `DUNGEON_COMPLETED_LOOSE` - Défaite totale
- `ENEMY_DEFEATED` - Ennemi vaincu, passage au suivant
- `POKEMON_KO` - Pokémon KO
- `FORCE_POKEMON_SWITCH` - Changement obligatoire

## 🏗️ Architecture

### Services Principaux

- **TrainerService** - Gestion des dresseurs
- **PokemonService** - CRUD des Pokémon possédés
- **CaptureService** - Logique de capture
- **DungeonService** - Gestion des sessions de donjon
- **BattleService** - Calculs de combat

### APIs Externes

- **Tyradex** - Données officielles Pokémon (stats, types, sprites)
- **PokéAPI** - Données complémentaires

### Base de Données

- **Trainer** - Dresseurs
- **OwnedPokemon** - Pokémon possédés
- **Dungeon** - Configuration des donjons
- **DungeonSession** - Sessions de jeu en cours
- **autres tables mineure** - sert a des opérations dans le jeux

## 🎯 Fonctionnalités

### ✅ Implémenté

- ✅ Système d'authentification JWT
- ✅ Capture de Pokémon sauvages/spécifiques
- ✅ Gestion d'équipe de Pokémon
- ✅ Combats de donjon avec enchaînement automatique
- ✅ Changement de Pokémon lors de KO
- ✅ Système de récompenses
- ✅ WebSocket temps réel
- ✅ Intégration APIs Pokémon externes

### 🚧 En Développement

- 🚧 Combat PvP temps réel
- 🚧 Système d'objets/inventaire
- 🚧 Évolutions de Pokémon
- 🚧 Classements/statistiques

## 🛠️ Développement

### Scripts NPM

```bash
npm run dev      # Développement avec auto-reload
npm run build    # Compilation TypeScript
npm start        # Production
```

### Base de Données

```bash
# Nouvelle migration
npx prisma migrate dev --name nom_migration

# Reset complet
npx prisma migrate reset

# Interface admin
npx prisma studio
```

### Docker

```bash
# Rebuild complet
docker compose build --no-cache

# Logs en temps réel
docker compose logs -f backend

# Shell dans le conteneur
docker compose exec backend sh
```

## 🔐 Variables d'Environnement

```env
# Base de données par défaut
DATABASE_URL="postgresql://pokemaster:pokepass@localhost:5432/clickerpokemon"

# JWT
JWT_SECRET="le Secret JWT"

# Ports (merci de ne pas les changés)
PORT=4000
WS_PORT=4001
```

## 📝 Notes de Développement

- **Performance API Capture** : La première capture d'un Pokémon peut prendre jusqu'à 20 secondes si celui-ci possède beaucoup d'attaques et n'a jamais été enregistré en base. Les captures suivantes du même Pokémon sont instantanées (~0.1s). Une optimisation future serait de créer un script de pré-chargement qui récupère toutes les attaques de tous les Pokémons en base.

# 🌟 **Fonctionnalités Front-End**

### 🔍 **DonjonDex Interactif**

- **Navigation par génération** (1-9) avec cache intelligent
- **Fiches détaillées** de chaque Pokémon
- **Interface responsive** adaptée mobile/tablette/desktop

### 👤 **Système de Dresseur**

- **Authentification complète** (inscription/connexion)
- **Profil personnalisable** avec informations détaillées
- **Progression et niveau** du dresseur

### 🎯 **Capture de Pokémon**

- **Système de capture** avec chances de réussite
- **Pokémon sauvages** aléatoires
- **Gestion des captures** (garder/relâcher)
- **Synchronisation automatique** du profil

### 🏰 **Système de Donjons**

- **Interface de sélection** de donjons
- **Composition d'équipe** stratégique
- **Batailles en temps réel** via WebSocket
- **Ennemis progressifs** + boss final
- **Récompenses** de fin de donjon

### ⚔️ **Batailles Avancées** (durant les donjons)

- **Combat temps réel** avec messages live
- **Changement de Pokémon** en cours de combat
- **Gestion des HP** et statuts KO
- **Système de retry** intelligent

## 🚀 **Installation**

### Installation Frontend Manuelle (Optionnel)

Si vous préférez développer le frontend séparément :

```bash
cd clicker-pokemon-front
npm install
npm run dev  # Port 3000
```

## 🎯 Scripts de Développement

```bash
# Frontend
npm run dev         # Développement Vite
npm run build       # Build production
npm run lint        # Linting ESLint

# Backend
npm run dev         # Développement avec auto-reload
npm run build       # Compilation TypeScript
npm start           # Production
```

## 🌐 **Pages Principales**

| Route                 | Description      | Fonctionnalités                       |
| --------------------- | ---------------- | ------------------------------------- |
| `/`                   | Home - DonjonDex | Navigation génération, cartes Pokémon |
| `/pokemon/:id`        | Détail Pokémon   | Infos complètes, stats, types         |
| `/profil`             | Profil Dresseur  | Infos perso, équipe, progression      |
| `/catch`              | Capture Pokémon  | Recherche, capture, gestion           |
| `/dungeon`            | Sélection Donjon | Liste donjons, composition équipe     |
| `/dungeon-battle/:id` | Combat Donjon    | Bataille temps réel, WebSocket        |
| `/login`              | Connexion        | Authentification                      |
| `/register`           | Inscription      | Création compte dresseur              |

## ⚡ Optimisations & Performance

- **Cache intelligent** : Pokémon (1 semaine) - Profil (24h)
- **Requêtes parallèles** avec Promise.all
- **API fallback** entre Tyradex et PokéAPI

---

## 🚀 Démarrage Rapide

```bash
# Une seule commande pour tout démarrer !
docker compose up -d

# Ouvrir http://localhost:3000 dans votre navigateur
# Créer un compte et commencer à jouer ! 🎮
```

## 👥 Contributeurs

- **Theo Stoffelbach**

### 🙏 Remerciements spéciaux

- **API Tyradex** - Pour les données officielles des Pokémon
- **PokéAPIv2** - Pour les informations complémentaires comme les attaques des pokémons

---

> **DonjonDex** - Votre aventure Pokémon commence ici ! ⚡🎮
