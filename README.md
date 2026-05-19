# INTIA Assurance — Plateforme de Gestion

Application web de gestion des clients et contrats d'assurance.  
Architecture MVC · GraphQL · React · Docker

---

## Sommaire

1. [Architecture](#1-architecture)
2. [Prérequis](#2-prérequis)
3. [Déploiement rapide (Docker)](#3-déploiement-rapide-docker)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Initialisation des utilisateurs](#5-initialisation-des-utilisateurs)
6. [Développement local (sans Docker)](#6-développement-local-sans-docker)
7. [Stratégie de branches & CI/CD](#7-stratégie-de-branches--cicd)
8. [Structure du projet](#8-structure-du-projet)
9. [Commandes utiles](#9-commandes-utiles)

---

## 1. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Docker Compose                        │
│                                                              │
│  ┌─────────────────┐  GraphQL   ┌──────────────────────────┐ │
│  │  Frontend       │ ─────────► │  Backend                 │ │
│  │  React + Vite   │            │  Apollo Server + Prisma  │ │
│  │  Nginx          │            │  Node.js                 │ │
│  │  :FRONTEND_PORT │            │  :BACKEND_PORT           │ │
│  └─────────────────┘            └────────────┬─────────────┘ │
│                                              │                │
│                                   ┌──────────▼────────────┐  │
│                                   │  PostgreSQL 16        │  │
│                                   │  (réseau interne)     │  │
│                                   └───────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

| Couche | Technologie | Rôle |
|--------|-------------|------|
| View | React 18 + Vite | SPA — interface employé & portail client |
| Controller | Apollo Server 4 + Resolvers GraphQL | Logique métier, contrôle d'accès JWT |
| Model | Prisma ORM | Accès base de données, migrations |
| Base de données | PostgreSQL 16 | Persistance |
| Reverse proxy | Nginx (dans le container frontend) | Sert le build + proxy `/graphql` → backend |
| Conteneurisation | Docker + Docker Compose | Déploiement unifié |

---

## 2. Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Docker | 24+ |
| Docker Compose | v2 (plugin) |
| Git | 2.30+ |

> Pour le développement local uniquement : Node.js 20+ et npm 9+.

---

## 3. Déploiement rapide (Docker)

### 3.1 Cloner le dépôt

```bash
# Production (branche main)
git clone -b main https://github.com/VOTRE_USER/VOTRE_REPO.git app
cd app

# Ou développement
git clone -b dev https://github.com/VOTRE_USER/VOTRE_REPO.git app
cd app
```

### 3.2 Configurer les variables d'environnement

```bash
cp .env.example .env
nano .env   # remplir les valeurs (voir section 4)
```

### 3.3 Démarrer

```bash
docker compose up -d --build
```

Au premier démarrage le backend :
1. Synchronise le schéma PostgreSQL (`prisma db push`)
2. Insère les agences par défaut
3. Lance Apollo Server

### 3.4 Initialiser les utilisateurs

```bash
# Génère les comptes par défaut + affiche les credentials une seule fois
docker compose exec backend npm run setup:users
```

### 3.5 Accéder à l'application

| Interface | URL |
|-----------|-----|
| Frontend (employés) | `http://VOTRE_IP:FRONTEND_PORT` |
| Portail client | `http://VOTRE_IP:FRONTEND_PORT/client/login` |
| API GraphQL | `http://VOTRE_IP:BACKEND_PORT` |

---

## 4. Variables d'environnement

Copiez `.env.example` en `.env` et remplissez :

```env
# ── Base de données ──────────────────────────────────────────
POSTGRES_USER=intia
POSTGRES_PASSWORD=motdepasse_fort_ici
POSTGRES_DB=intia_db

# ── Sécurité ─────────────────────────────────────────────────
# Minimum 32 caractères, aléatoire
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire

# ── Ports exposés sur l'hôte ─────────────────────────────────
FRONTEND_PORT=3000   # port d'accès au frontend
BACKEND_PORT=4000    # port d'accès à l'API GraphQL
```

> **Conseil sécurité :** générez un JWT_SECRET robuste avec :
> ```bash
> openssl rand -base64 48
> ```

---

## 5. Initialisation des utilisateurs

### 5.1 Créer tous les comptes par défaut

```bash
# Via Docker (recommandé en prod)
docker compose exec backend npm run setup:users

# En développement local
cd backend && npm run setup:users
```

Affiche une table avec les credentials **une seule fois** :

```
╔════════════════════════════════════════════════════════════════════════╗
║  CREDENTIALS INITIAUX — AFFICHÉ UNE SEULE FOIS                        ║
╠════════════════════════════════════════════════════════════════════════╣
║  RÔLE     EMAIL                              MOT DE PASSE     STATUT  ║
╠────────────────────────────────────────────────────────────────────────╣
║  ADMIN    admin@votredomaine.cm              X4$mK9#pL2qR    créé     ║
║  AGENT    agent.douala@votredomaine.cm       Tz!8vN2@mKpQ    créé     ║
║  AGENT    agent.yaounde@votredomaine.cm      Rw#5jL9$xNbY    créé     ║
╠════════════════════════════════════════════════════════════════════════╣
║  ⚠  Sauvegardez ces mots de passe maintenant.                         ║
╚════════════════════════════════════════════════════════════════════════╝
```

### 5.2 Créer un utilisateur individuel

```bash
# Créer un admin
npm run create:user -- --role ADMIN --email admin@company.com

# Créer un agent rattaché à une agence
npm run create:user -- \
  --role AGENT \
  --email agent@company.com \
  --agenceId ag-douala \
  --nom Dupont \
  --prenom Jean

# Avec un mot de passe personnalisé
npm run create:user -- --role ADMIN --email admin@company.com --password MonMotDePasse!1
```

| Option | Requis | Description |
|--------|--------|-------------|
| `--role` | ✓ | `ADMIN` ou `AGENT` |
| `--email` | ✓ | Adresse email unique |
| `--agenceId` | Si AGENT | ID de l'agence (`ag-dg`, `ag-douala`, `ag-yde`) |
| `--nom` | — | Nom de famille (défaut : "Utilisateur") |
| `--prenom` | — | Prénom (défaut : "Nouveau") |
| `--password` | — | Mot de passe custom (généré si absent) |

---

## 6. Développement local (sans Docker)

### Backend

```bash
cd backend
cp .env.example .env
# Renseigner DATABASE_URL et JWT_SECRET dans .env

npm install
npx prisma db push        # synchronise le schéma
npm run setup:users       # crée les comptes par défaut
npm run dev               # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:3000
```

> Le proxy Vite redirige `/graphql` → `http://localhost:4000` automatiquement.

---

## 7. Stratégie de branches & CI/CD

### Branches

| Branche | Rôle |
|---------|------|
| `dev` | Développement actif — déclenche le pipeline CI/CD dev |
| `prod` | Trigger de promotion — merge dev→prod→main |
| `main` | Code en production — source of truth |

### Workflow Dev (automatique)

Déclenché à chaque `git push origin dev` :

```
push dev
  └── Unit Tests (Jest)
  └── Integration Tests (Jest + Prisma mocké)
  └── E2E Tests (Playwright + Docker stack complet)
        └── Deploy → serveur dev (ports configurés)
              └── Health check
```

### Workflow Prod (manuel)

GitHub → Actions → **"Prod — Promote & Deploy"** → Run workflow → taper `deploy-prod`

```
confirmation "deploy-prod"
  └── Merge dev → prod → main (git)
  └── Deploy → serveur prod (ports configurés)
        └── Health check
```

### CI/CD — Secrets GitHub requis

| Secret | Description |
|--------|-------------|
| `SSH_HOST` | IP du serveur |
| `SSH_USER` | Utilisateur SSH |
| `SSH_PRIVATE_KEY` | Clé SSH privée (contenu du fichier) |
| `SSH_PORT` | Port SSH (défaut : 22) |
| `DEPLOY_PATH_DEV` | Chemin absolu du projet dev sur le serveur |
| `DEPLOY_PATH_PROD` | Chemin absolu du projet prod sur le serveur |
| `DEV_POSTGRES_USER` | PostgreSQL user (env dev) |
| `DEV_POSTGRES_PASSWORD` | PostgreSQL password (env dev) |
| `DEV_POSTGRES_DB` | Nom de la base (env dev) |
| `DEV_JWT_SECRET` | Secret JWT (env dev) |
| `PROD_POSTGRES_USER` | PostgreSQL user (env prod) |
| `PROD_POSTGRES_PASSWORD` | PostgreSQL password (env prod) |
| `PROD_POSTGRES_DB` | Nom de la base (env prod) |
| `PROD_JWT_SECRET` | Secret JWT (env prod) |

### Setup serveur (une seule fois)

```bash
# Prérequis sur le serveur
apt update && apt install -y git docker.io docker-compose-plugin

# Environnement dev
mkdir -p /opt/votre-app-dev
git clone -b dev https://github.com/VOTRE_USER/VOTRE_REPO.git /opt/votre-app-dev
# Créer /opt/votre-app-dev/.env avec les valeurs dev + FRONTEND_PORT + BACKEND_PORT

# Environnement prod
mkdir -p /opt/votre-app-prod
git clone -b main https://github.com/VOTRE_USER/VOTRE_REPO.git /opt/votre-app-prod
# Créer /opt/votre-app-prod/.env avec les valeurs prod + FRONTEND_PORT + BACKEND_PORT
```

---

## 8. Structure du projet

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modèles de données
│   │   └── seed.ts             # Données initiales (E2E)
│   ├── scripts/
│   │   ├── init-users.ts       # Génère tous les comptes par défaut
│   │   └── create-user.ts      # Crée un utilisateur individuel
│   └── src/
│       ├── models/             # Prisma client (M)
│       ├── controllers/        # Resolvers GraphQL (C)
│       ├── schema/             # TypeDefs GraphQL
│       └── middleware/         # Auth JWT
├── frontend/
│   └── src/
│       ├── pages/employe/      # Interface employés (CRUD)
│       └── pages/client/       # Portail client (lecture seule)
├── tests/
│   ├── unit/                   # Tests unitaires (Jest)
│   ├── integration/            # Tests d'intégration (Jest + Prisma mocké)
│   └── e2e/                    # Tests E2E (Playwright)
├── Doc-INTIA/
│   ├── RSD-INTIA.docx          # Spécifications techniques
│   ├── TEST-PLAN.md            # Plan de test
│   └── MONITORING.md           # Stratégie de monitoring
├── .github/workflows/
│   ├── dev.yml                 # Pipeline CI/CD dev
│   └── prod.yml                # Pipeline promotion prod
├── docker-compose.yml
├── README.md                   # Ce fichier
└── TESTS.md                    # Guide complet des tests
```

---

## 9. Commandes utiles

```bash
# Démarrer / arrêter
docker compose up -d --build
docker compose down
docker compose down -v          # supprime aussi les volumes (données DB)

# Logs
docker compose logs -f
docker compose logs -f backend

# Gestion des utilisateurs
docker compose exec backend npm run setup:users
docker compose exec backend npm run create:user -- --role ADMIN --email admin@example.com

# Base de données
docker compose exec backend npx prisma db push
docker compose exec backend npx prisma studio   # interface visuelle DB

# Santé des services
docker compose ps
curl -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' | grep -q __typename && echo OK

# Rebuild d'un seul service
docker compose up -d --build backend
```
