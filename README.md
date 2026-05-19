# INTIA Assurance — Plateforme de Gestion

Application web de gestion des clients et contrats d'assurance pour INTIA (Direction Générale, Douala, Yaoundé).

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite (port 3000) |
| Backend | Node.js + Apollo Server GraphQL (port 4000) |
| Base de données | PostgreSQL 16 (port 5432) |
| Conteneurisation | Docker + Docker Compose |

---

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) >= 24
- [Docker Compose](https://docs.docker.com/compose/) >= 2
- Git

---

## Installation & Déploiement

### 1. Cloner le dépôt

```bash
git clone <URL_DU_DEPOT>
cd intia-insurance
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditer `.env` avec vos valeurs :

```env
POSTGRES_USER=intia
POSTGRES_PASSWORD=<mot_de_passe_fort>
POSTGRES_DB=intia_db
JWT_SECRET=<secret_jwt_fort>
```

### 3. Lancer l'application

```bash
docker compose up -d --build
```

Au premier démarrage, le backend :
1. Synchronise le schéma avec la base de données
2. Insère les données initiales (3 agences + 1 admin + 2 agents)

### 4. Accéder à l'application

| Interface | URL |
|-----------|-----|
| Application web | http://localhost:3000 |
| API GraphQL | http://localhost:4000 |

### 5. Comptes par défaut

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@intia.cm | Admin@1234 |
| Agent Douala | agent.douala@intia.cm | Agent@1234 |
| Agent Yaoundé | agent.yaounde@intia.cm | Agent@1234 |

> **Important** : Changer les mots de passe après le premier démarrage en production.

---

## Commandes utiles

```bash
# Voir les logs en temps réel
docker compose logs -f

# Voir les logs d'un service
docker compose logs -f backend
docker compose logs -f frontend

# Arrêter l'application
docker compose down

# Arrêter et supprimer les données
docker compose down -v

# Redémarrer un service
docker compose restart backend
```

---

## Développement local (sans Docker)

### Backend

```bash
cd backend
cp .env.example .env
# Renseigner DATABASE_URL et JWT_SECRET dans .env

npm install
npx prisma db push
npx prisma db seed
npm run dev        # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

---

## Structure du projet

```
intia-insurance/
├── backend/
│   ├── src/
│   │   ├── models/        # Prisma client (M)
│   │   ├── controllers/   # Resolvers GraphQL (C)
│   │   └── schema/        # TypeDefs GraphQL
│   └── prisma/            # Schéma + migrations + seed
├── frontend/
│   └── src/
│       ├── pages/employe/ # Interface employés
│       └── pages/client/  # Portail clients
├── Doc-INTIA/             # Documents du projet
└── docker-compose.yml
```
