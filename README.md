# 🎮 Pokédex Back - API Backend

Backend Node.js/TypeScript pour un jeu de capture et combat de Pokémon avec système de donjon.

## 🚀 Technologies

- **Node.js** + **TypeScript**
- **Express.js** - API REST
- **WebSocket** - Communication temps réel pour les combats
- **Prisma** - ORM pour la base de données
- **PostgreSQL** - Base de données
- **Docker** - Conteneurisation
- **JWT** - Authentification
- **bcrypt** - Chiffrement des mots de passe

## 📁 Structure du Projet

```
src/
├── api/           # Intégrations APIs externes (Tyradex, PokéAPI)
├── config/        # Configuration (DB, environnement, WebSocket)
├── controller/    # Contrôleurs REST
├── middlewares/   # Middlewares Express (auth, etc.)
├── models/        # Interfaces TypeScript
├── router/        # Routes Express
├── services/      # Logique métier
├── types/         # Types personnalisés
├── utils/         # Utilitaires
├── ws/            # Gestionnaires WebSocket
│   ├── battle/    # Combat 1v1
│   └── dungeon/   # Combat de donjon
└── server.ts      # Point d'entrée
```

## 🐳 Installation avec Docker (Recommandé)

### Prérequis

- Docker & Docker Compose

### Démarrage

```bash
# Depuis la racine du projet
docker compose up -d

# Vérifier les logs
docker compose logs backend -f
```

### Services démarrés

- **Backend** : http://localhost:4000 (REST) + ws://localhost:4001 (WebSocket)
- **PostgreSQL** : localhost:5432
- **pgAdmin** : http://localhost:5050 (admin@poke.com / admin123)

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

### 🔍 **PokéDex Interactif**

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

## 🛠️ **Technologies**

### **Frontend**

- **React 18** avec TypeScript
- **Vite** pour le build ultra-rapide
- **Material-UI 5** pour l'interface
- **SCSS** pour le styling personnalisé
- **React Router 6** pour la navigation

### **Gestion d'État**

- **Redux Toolkit** pour l'état global
- **RTK Query** pour les appels API avec cache
- **React Hooks** personnalisés

### **Optimisations**

- **Cache intelligent** (1 semaine pour Pokémon, 24h pour profil)
- **Promise.all** pour les requêtes parallèles

## 🚀 **Installation**

### **Prérequis**

- Node.js 18+
- npm ou pnpm
- API Backend PokéDex en cours d'exécution sur le port 4000

### ** 1. Installer les dépendances**

```bash
npm install
# ou
pnpm install
```

### **2. Configuration**

Vérifier que l'API backend est démarrée sur `http://localhost:4000`

### **3. Lancer en développement**

```bash
npm run dev
# ou
pnpm dev
```

L'application sera disponible sur `http://localhost:3000`

## 📁 **Structure du Projet**

```
src/
├── api/                    # Services API (RTK Query)
│   ├── AuthAPI.ts         # Authentification
│   └── PokemonAPI.ts      # Données Pokémon
├── components/            # Composants réutilisables
│   ├── card/             # Cartes (Pokémon, Profil, etc.)
│   ├── common/           # Composants communs (Loaders, Erreurs)
│   ├── header/           # Navigation
│   └── page/             # Pages principales
├── constants/            # Constantes applicatives
├── hooks/                # Hooks personnalisés
├── router/               # Configuration routing
├── service/              # Services métier
├── store/                # Configuration Redux
├── style/                # Styles SCSS
├── types/                # Types TypeScript
└── utils/                # Fonctions utilitaires
```

## 🎯 **Scripts Disponibles**

```bash
npm run dev         # Démarrage développement
npm run build       # Build production
npm run lint        # Linting ESLint
```

## 🌐 **Pages Principales**

| Route                 | Description      | Fonctionnalités                       |
| --------------------- | ---------------- | ------------------------------------- |
| `/`                   | Home - PokéDex   | Navigation génération, cartes Pokémon |
| `/pokemon/:id`        | Détail Pokémon   | Infos complètes, stats, types         |
| `/profil`             | Profil Dresseur  | Infos perso, équipe, progression      |
| `/catch`              | Capture Pokémon  | Recherche, capture, gestion           |
| `/dungeon`            | Sélection Donjon | Liste donjons, composition équipe     |
| `/dungeon-battle/:id` | Combat Donjon    | Bataille temps réel, WebSocket        |
| `/login`              | Connexion        | Authentification                      |
| `/register`           | Inscription      | Création compte dresseur              |

## ⚡ **Optimisations Performance**

### **Cache Intelligent**

- **Pokémon Data** : Cache 1 semaine (604800s)
- **Profil Dresseur** : Cache 24h avec invalidation auto
- **Noms Pokémon** : Cache mémoire persistant

## 🔧 **Configuration API**

L'application communique avec l'API backend via :

```typescript
// Base URL configurée dans authService.ts
const api = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
```

### **Endpoints utilisés**

- `POST /trainer/login` - Connexion
- `POST /trainer/register` - Inscription
- `GET /trainer/me` - Profil dresseur
- `GET /pokemon/generation/:id` - Pokémon par génération
- `GET /pokemon/:id` - Détail Pokémon
- WebSocket pour les batailles de donjon

## 🎨 **Design System**

### **Couleurs Principales**

- **Background** : `#242424` (sombre)
- **Cards** : `#3a3a3a` (gris foncé)
- **Primary** : `#007bff` (bleu)
- **Success** : `#27ae60` (vert)
- **Danger** : `#e74c3c` (rouge)

## 👥 Contributeurs

- **Theo Stoffelbach**

### 🙏 Remerciements spéciaux

- **API Tyradex** - Pour les données officielles des Pokémon
- **PokéAPIv2** - Pour les informations complémentaires comme les attaques des pokémons
