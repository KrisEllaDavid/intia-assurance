# Plan de Test — INTIA Assurance

## 1. Stratégie de test

Trois niveaux de test couvrent l'ensemble de la plateforme :

| Niveau | Outil | Objectif |
|--------|-------|----------|
| Tests d'intégration API | Apollo Client (manuel / script) | Valider les resolvers GraphQL |
| Tests fonctionnels UI | Navigateur | Valider les parcours utilisateur |
| Tests de non-régression | Re-exécution du plan après modification | S'assurer qu'aucune feature n'est cassée |

---

## 2. Environnement de test

```bash
# Lancer l'environnement
docker compose up -d --build

# Vérifier que les services sont actifs
docker compose ps
```

Accès Playground GraphQL (pour tests API) : http://localhost:4000

---

## 3. Tests d'authentification

### T01 — Login employé valide
- **Action** : `mutation loginEmploye(email: "admin@intia.cm", motDePasse: "Admin@1234")`
- **Résultat attendu** : token JWT + profil renvoyés, rôle ADMIN

### T02 — Login employé invalide
- **Action** : mot de passe incorrect
- **Résultat attendu** : erreur "Identifiants invalides"

### T03 — Login client valide
- **Prérequis** : créer un client avec motDePasse via l'interface employé
- **Action** : `mutation loginClient(email: "...", motDePasse: "...")`
- **Résultat attendu** : token JWT renvoyé, type = client

### T04 — Accès sans token
- **Action** : appeler `query clients` sans Authorization header
- **Résultat attendu** : erreur "Non authentifié"

---

## 4. Tests CRUD Clients

### T05 — Créer un client (Admin)
- **Action** : `mutation createClient(input: { nom, prenom, email, agenceId })`
- **Résultat attendu** : client créé avec agence correcte

### T06 — Isolation AGENT
- **Prérequis** : 2 clients dans 2 agences différentes
- **Action** : `query clients` avec token agent Douala
- **Résultat attendu** : seuls les clients de Douala sont retournés

### T07 — Modifier un client
- **Action** : `mutation updateClient(id, input)`
- **Résultat attendu** : champ mis à jour, autres champs inchangés

### T08 — Supprimer un client
- **Action** : `mutation deleteClient(id)`
- **Résultat attendu** : client supprimé, ses contrats aussi (cascade)

### T09 — Email en double
- **Action** : créer deux clients avec le même email
- **Résultat attendu** : erreur de contrainte unique

---

## 5. Tests CRUD Assurances

### T10 — Créer un contrat
- **Action** : `mutation createAssurance(input: { type, prime, dateDebut, dateFin, clientId })`
- **Résultat attendu** : contrat créé, statut ACTIF par défaut

### T11 — Client voit uniquement ses contrats
- **Action** : `query assurances` avec token client
- **Résultat attendu** : seuls les contrats du client connecté

### T12 — Modifier le statut d'un contrat
- **Action** : `mutation updateAssurance(id, input: { statut: RESILIE, ... })`
- **Résultat attendu** : statut = RÉSILIÉ, badge rouge dans l'UI

---

## 6. Tests Interface (parcours utilisateur)

### T13 — Parcours Employé complet
1. Ouvrir http://localhost:3000
2. Se connecter avec `admin@intia.cm / Admin@1234`
3. Créer un client avec mot de passe portail
4. Créer un contrat pour ce client
5. Vérifier que le client et le contrat apparaissent dans les listes
6. Modifier puis supprimer le contrat
7. Se déconnecter

### T14 — Parcours Client
1. Ouvrir http://localhost:3000/client/login
2. Se connecter avec les identifiants du client créé en T13
3. Vérifier que seuls ses contrats sont visibles
4. Vérifier qu'il n'y a aucun bouton de modification
5. Se déconnecter

### T15 — Parcours Agent (isolation agence)
1. Se connecter avec `agent.douala@intia.cm / Agent@1234`
2. Vérifier que seuls les clients de INTIA-Douala sont listés
3. Créer un client → vérifier qu'il est rattaché à Douala automatiquement
4. Vérifier l'absence du menu "Employés" dans la navbar

---

## 7. Résultats attendus globaux

| Test | Statut |
|------|--------|
| T01 – T04 (Auth) | ✅ Attendu |
| T05 – T09 (Clients) | ✅ Attendu |
| T10 – T12 (Assurances) | ✅ Attendu |
| T13 – T15 (UI) | ✅ Attendu |
