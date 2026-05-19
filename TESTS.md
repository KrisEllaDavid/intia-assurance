# Guide des Tests — INTIA Assurance

Ce document décrit l'ensemble de la stratégie de test du projet, les prérequis et les commandes exactes pour exécuter chaque niveau de test.

---

## Sommaire

1. [Architecture des tests](#1-architecture-des-tests)
2. [Installation](#2-installation)
3. [Tests Unitaires](#3-tests-unitaires)
4. [Tests d'Intégration](#4-tests-dintégration)
5. [Tests E2E (Playwright)](#5-tests-e2e-playwright)
6. [Lancer tous les tests](#6-lancer-tous-les-tests)
7. [Tests en CI/CD](#7-tests-en-cicd)

---

## 1. Architecture des tests

```
tests/
├── setup/
│   ├── env.ts                   # Variables d'environnement pour les tests
│   ├── server.ts                # Factory Apollo Server de test
│   └── prisma-client-mock.ts    # Mock de @prisma/client
├── unit/
│   ├── auth.middleware.test.ts  # buildContext, requireAuth, requireEmployee, requireAdmin
│   └── auth.lib.test.ts         # Helpers localStorage frontend
├── integration/
│   ├── auth.test.ts             # loginEmploye, loginClient, meEmploye, meClient
│   ├── clients.test.ts          # CRUD clients + isolation par agence
│   ├── assurances.test.ts       # CRUD assurances + isolation client/agent
│   └── employes.test.ts         # CRUD employés (admin only)
└── e2e/
    ├── employe.spec.ts          # Parcours employé complet (CRUD)
    ├── client.spec.ts           # Portail client (lecture seule)
    └── admin.spec.ts            # Gestion employés + isolation agences
```

| Niveau | Outil | Base de données | Durée estimée |
|--------|-------|-----------------|---------------|
| Unitaire | Jest + ts-jest | Aucune (mocks) | ~15 s |
| Intégration | Jest + Apollo Server | Prisma mocké (jest.fn) | ~35 s |
| E2E | Playwright + Chromium | PostgreSQL réelle (Docker) | ~2–4 min |

---

## 2. Installation

```bash
cd tests
npm install --legacy-peer-deps

# Installer le navigateur Playwright (une seule fois)
npx playwright install chromium
```

---

## 3. Tests Unitaires

### Ce qu'ils testent

**`unit/auth.middleware.test.ts`** — Logique pure JWT (aucune dépendance externe)

| Test | Scénario |
|------|----------|
| `buildContext` | Token absent → user null |
| `buildContext` | Schéma non-Bearer → user null |
| `buildContext` | Token invalide ou expiré → user null |
| `buildContext` | Token valide (employe/client) → payload retourné |
| `requireAuth` | user null → lève "Non authentifié" |
| `requireAuth` | user présent → retourne user |
| `requireEmployee` | Token client → lève "Accès réservé aux employés" |
| `requireEmployee` | Token AGENT/ADMIN → retourne user |
| `requireAdmin` | AGENT → lève "Accès réservé aux administrateurs" |
| `requireAdmin` | ADMIN → retourne user |

**`unit/auth.lib.test.ts`** — Helpers localStorage frontend

| Test | Scénario |
|------|----------|
| `saveEmployeAuth` | Stocke token + type "employe" + profil |
| `saveClientAuth` | Stocke token + type "client" + profil |
| `clearAuth` | Supprime token, type et profil |
| `isAdmin` | ADMIN → true, AGENT → false, client → false, déconnecté → false |

### Commande

```bash
cd tests
npm run test:unit
```

### Sortie attendue

```
PASS unit/auth.lib.test.ts
PASS unit/auth.middleware.test.ts

Test Suites: 2 passed, 2 total
Tests:       29 passed, 29 total
```

---

## 4. Tests d'Intégration

### Ce qu'ils testent

Les resolvers GraphQL sont testés avec Apollo Server réel, mais **Prisma est mocké** (`jest.fn()`). Aucune base de données réelle n'est nécessaire.

**`integration/auth.test.ts`**

| Test | Scénario |
|------|----------|
| `loginEmploye` | Credentials valides → token JWT (type: employe, role: ADMIN) |
| `loginEmploye` | Mauvais mot de passe → "Identifiants invalides" |
| `loginEmploye` | Email inconnu → "Identifiants invalides" |
| `loginClient` | Credentials valides → token JWT (type: client) |
| `loginClient` | Client sans mot de passe → "Identifiants invalides" |
| `meEmploye` | Token valide → profil retourné |
| `meEmploye` | Sans token → erreur auth |
| `meClient` | Token client → profil retourné |
| `meClient` | Token employé → erreur accès refusé |

**`integration/clients.test.ts`**

| Test | Scénario |
|------|----------|
| `clients` (ADMIN) | Retourne tous les clients (where: undefined) |
| `clients` (AGENT) | Filtre sur agenceId de l'agent (vérifié via mock.calls) |
| `clients` | Sans token → "Non authentifié" |
| `client(id)` | Retourne le client ou null |
| `createClient` (ADMIN) | Crée dans n'importe quelle agence |
| `createClient` (AGENT) | Force agenceId = agence de l'agent |
| `createClient` | Sans token → erreur |
| `updateClient` | Met à jour les données |
| `deleteClient` | Supprime et retourne le profil |
| `deleteClient` (CLIENT) | Accès refusé |

**`integration/assurances.test.ts`**

| Test | Scénario |
|------|----------|
| `assurances` (ADMIN) | Retourne tout (where: {}) |
| `assurances` (AGENT) | Filtre client.agenceId = agence de l'agent |
| `assurances` (CLIENT) | Filtre clientId = id du client connecté |
| `assurances` | Sans token → erreur |
| `assurance(id)` | Retourne le détail |
| `createAssurance` | Dates converties en Date object (vérifié) |
| `createAssurance` (CLIENT) | Accès refusé — lecture seule |
| `updateAssurance` | Modifie le statut |
| `deleteAssurance` | Supprime le contrat |

**`integration/employes.test.ts`**

| Test | Scénario |
|------|----------|
| `employes` (ADMIN) | Liste tous les employés |
| `employes` (AGENT) | Accès refusé |
| `employes` | Sans token → erreur |
| `createEmploye` (ADMIN) | Crée l'employé, mot de passe haché en bcrypt |
| `createEmploye` (AGENT) | Accès refusé |
| `createEmploye` | Sans token → erreur |
| `deleteEmploye` (ADMIN) | Supprime l'employé |
| `deleteEmploye` (AGENT) | Accès refusé |

### Commande

```bash
cd tests
npm run test:integration
```

### Sortie attendue

```
PASS integration/auth.test.ts
PASS integration/clients.test.ts
PASS integration/assurances.test.ts
PASS integration/employes.test.ts

Test Suites: 4 passed, 4 total
Tests:       39 passed, 39 total
```

---

## 5. Tests E2E (Playwright)

### Prérequis

L'application doit être **entièrement démarrée** sur `http://localhost:3000` avec la base de données seedée.

```bash
# Depuis la racine du projet
cp .env.example .env          # configurer les variables
docker compose up -d --build  # démarrer l'application

# Attendre que tout soit prêt (~30s), vérifier :
curl -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' | grep __typename
```

### Comptes requis (créés par le seed)

| Compte | Email | Mot de passe | Usage |
|--------|-------|--------------|-------|
| Admin | `admin@intia.cm` | `Admin@1234` | Tests employe.spec + admin.spec |
| Agent Douala | `agent.douala@intia.cm` | `Agent@1234` | Tests isolation agence |
| Agent Yaoundé | `agent.yaounde@intia.cm` | `Agent@1234` | Tests isolation agence |
| Client E2E | `client.e2e@test.cm` | `Client@1234` | Tests client.spec |

> Ces comptes sont créés par `npm run db:seed` (automatique au démarrage Docker).

### Ce qu'ils testent

**`e2e/employe.spec.ts`** — Parcours employé complet

- Login valide → redirection `/clients`
- Login invalide → message d'erreur visible
- Création d'un client (formulaire complet)
- Modification d'un client
- Suppression avec confirmation
- Navigation entre Clients / Contrats
- Déconnexion → retour `/login`
- Routes protégées sans token → redirection `/login`

**`e2e/client.spec.ts`** — Portail client

- Login client → redirection `/client/mes-assurances`
- Aucun bouton Modifier/Supprimer visible (lecture seule)
- Aucun lien de navigation employé visible
- Badge de statut ACTIF/RÉSILIÉ affiché
- Déconnexion → retour `/client/login`
- Route protégée sans token → redirection

**`e2e/admin.spec.ts`** — Gestion employés + isolation agences

- Création d'un agent via formulaire + vérification liste
- Suppression de l'agent créé
- Agent Douala : navbar sans lien "Employés"
- Agent Douala : liste clients filtrée sur INTIA-Douala uniquement
- Agent Yaoundé : liste clients sans données de Douala

### Commande

```bash
cd tests

# Lancer tous les tests E2E
npm run test:e2e

# Lancer un seul fichier
npx playwright test e2e/employe.spec.ts

# Mode interactif (avec navigateur visible)
npx playwright test --headed

# Interface graphique Playwright
npx playwright test --ui
```

### Rapport

Après chaque run, un rapport HTML est généré :

```bash
npx playwright show-report
# Ouvre http://localhost:9323 dans le navigateur
```

---

## 6. Lancer tous les tests

```bash
cd tests

# Unit + Integration (sans Docker, rapide)
npm test

# E2E uniquement (nécessite l'app en marche)
npm run test:e2e

# Tout en séquence
npm test && npm run test:e2e
```

---

## 7. Tests en CI/CD

Les tests sont intégrés dans le pipeline GitHub Actions (`dev.yml`) :

```
push → dev
  ├── Job 1 : unit-tests        (Jest, ~15s)
  ├── Job 2 : integration-tests (Jest, ~35s, parallèle avec Job 1)
  └── Job 3 : e2e-tests         (Playwright, ~4min, après Jobs 1+2)
        ├── Build Docker stack complet en CI
        ├── Attente backend prêt (GraphQL health check)
        ├── Attente frontend prêt (HTTP 200)
        ├── Run Playwright (Chromium headless)
        ├── Upload rapport HTML (artefact GitHub Actions, 7 jours)
        └── Teardown Docker stack
  └── Job 4 : deploy-dev        (SSH, après Job 3)
```

### Consulter les rapports E2E en CI

1. GitHub → Actions → sélectionner le run
2. Section **Artifacts** → télécharger `playwright-report-<N>`
3. Extraire et ouvrir `index.html`

### Variables d'environnement CI

Les tests E2E en CI utilisent les secrets GitHub suivants pour construire le `.env` :

| Secret | Utilisé pour |
|--------|-------------|
| `DEV_POSTGRES_USER` | Base de données CI |
| `DEV_POSTGRES_PASSWORD` | Base de données CI |
| `DEV_POSTGRES_DB` | Base de données CI |
| `DEV_JWT_SECRET` | Génération des tokens JWT |

> `FRONTEND_PORT=3000` et `BACKEND_PORT=4000` sont forcés en CI (ports par défaut).
