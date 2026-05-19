# Monitoring — INTIA Assurance

## 1. Health checks Docker (intégré)

Les trois services sont surveillés par Docker via des health checks natifs.

```yaml
# Backend : vérifie que l'API GraphQL répond
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://localhost:4000/ | grep -q 'errors\\|data' || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3

# Base de données : vérifie que PostgreSQL accepte des connexions
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $POSTGRES_USER -d $POSTGRES_DB"]
  interval: 10s
  retries: 5
```

```bash
# Vérifier l'état de santé de chaque service
docker compose ps

# Exemple de sortie attendue
NAME               STATUS
intia-db           Up (healthy)
intia-backend      Up (healthy)
intia-frontend     Up
```

Avec `restart: always`, Docker redémarre automatiquement tout service qui tombe.

---

## 2. Surveillance des logs

```bash
# Suivre les logs en direct
docker compose logs -f

# Logs backend uniquement (erreurs GraphQL, DB)
docker compose logs -f backend

# Filtrer les erreurs
docker compose logs backend | grep -i error
```

---

## 3. Monitoring externe (uptime)

Utiliser **UptimeRobot** (gratuit) pour surveiller les endpoints depuis l'extérieur :

| Monitor | URL | Type | Intervalle |
|---------|-----|------|------------|
| Frontend | http://<IP_SERVEUR>:3000 | HTTP | 5 min |
| Backend API | http://<IP_SERVEUR>:4000 | HTTP | 5 min |

**Configuration UptimeRobot :**
1. Créer un compte sur https://uptimerobot.com
2. "Add New Monitor" → HTTP(s)
3. Renseigner l'URL et l'intervalle
4. Configurer une alerte email en cas de panne

---

## 4. Alertes en cas de panne

Docker redémarre les services automatiquement (`restart: always`).  
UptimeRobot envoie un email si le service ne répond plus pendant 2 cycles consécutifs.

Pour aller plus loin (hors scope test) : Prometheus + Grafana pour métriques temps réel.

---

## 5. Commandes de diagnostic rapide

```bash
# Utilisation des ressources
docker stats

# Vérifier qu'un service répond
curl -s http://localhost:4000/ -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' | grep -q "data" && echo "OK" || echo "KO"

# Recharger sans coupure
docker compose up -d --build backend
```
