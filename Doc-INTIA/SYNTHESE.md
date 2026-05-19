# Synthèse de la Solution — INTIA Assurance

---

## Partie 1 — Conception (10 pts)

**Document :** `Doc-INTIA/RSD-INTIA.docx`

- Architecture MVC : React (View) · Apollo Resolvers (Controller) · Prisma (Model)
- 3 acteurs : Admin (global), Agent (par agence), Client (portail lecture seule)
- 16 fonctionnalités numérotées F01–F16 (auth, CRUD clients, CRUD assurances, gestion employés)
- Modèle de données : `Agence` → `Employe` / `Client` → `Assurance`
- API GraphQL documentée (queries + mutations)
- Schéma Docker Compose, règles d'accès JWT, exigences non-fonctionnelles

---

## Partie 2 — Développement (10 pts)

**Stack :** Node.js + Apollo Server 4 · Prisma ORM · PostgreSQL · React 18 + Vite · Docker

| Couche | Ce qui a été implémenté |
|--------|------------------------|
| Auth | JWT dual-flow : `loginEmploye` / `loginClient` · bcrypt · isolation par agence côté serveur |
| Backend | 4 controllers (auth, agences, clients, assurances) · middleware JWT · seed automatique |
| Frontend | Login employé + portail client · CRUD complet · navbar dynamique selon rôle |
| Docker | 3 services (db, backend, frontend/Nginx) · ports configurables via `.env` |
| CI/CD | 3 branches (dev/prod/main) · pipeline GitHub Actions complet · déploiement sur serveur VPS |

**Démo accessible :**
- DEV : `http://185.217.125.37:3096` (API : 3095)
- PROD : `http://185.217.125.37:3097` (API : 3098)

---

## Partie 3 — Test (5 pts)

**Documents :** `TESTS.md` (guide) · `Doc-INTIA/TEST-PLAN.md` (plan) · `tests/` (code)

| Niveau | Outil | Couverture | Résultat |
|--------|-------|------------|---------|
| Unitaire | Jest + ts-jest | `buildContext`, `requireAuth`, `requireEmployee`, `requireAdmin`, helpers localStorage | **29 tests ✅** |
| Intégration | Jest + Apollo Server (Prisma mocké) | auth, CRUD clients/assurances/employés, isolation agence vérifiée | **39 tests ✅** |
| E2E | Playwright (Chromium) | Parcours employé, portail client, isolation agences, protection routes | Intégré CI |

Les tests E2E s'exécutent automatiquement en CI avec un stack Docker complet spinné à chaque push.

---

## Partie 4 — Déploiement (3 pts)

**Document :** `README.md` (racine du repo)

- Prérequis : Docker 24+, Docker Compose v2, Git
- Démarrage en une commande : `docker compose up -d --build`
- Variables d'environnement documentées avec exemples
- Scripts d'initialisation des utilisateurs (`npm run setup:users`)
- Procédure complète de setup serveur (clone + `.env` + démarrage)
- Commandes utiles (logs, restart, Prisma Studio)

---

## Partie 5 — Monitoring (2 pts)

**Document :** `Doc-INTIA/MONITORING.md`

- **Health checks Docker natifs** : PostgreSQL (`pg_isready`), Backend (GraphQL `__typename`), `restart: always`
- **Surveillance externe** : UptimeRobot (HTTP check toutes les 5 min, alerte email)
- **Logs temps réel** : `docker compose logs -f [service]`
- **Diagnostic rapide** : `docker stats`, `docker compose ps`, curl GraphQL health

---

## Consignes

| Consigne | Statut |
|----------|--------|
| Code sur git | ✅ `https://github.com/KrisEllaDavid/intia-assurance.git` — 3 branches : `main`, `dev`, `prod` |
| Dossier `Doc-INTIA` à la racine | ✅ Contient : `RSD-INTIA.docx`, `TEST-PLAN.md`, `MONITORING.md`, `SYNTHESE.md` |
| Cohérence > style | ✅ Architecture MVC uniforme, JWT cohérent entre backend et frontend, même isolation partout |
| Prêt pour la démo | ✅ App déployée et accessible, seed automatique avec comptes de test, portail client et employé fonctionnels |
