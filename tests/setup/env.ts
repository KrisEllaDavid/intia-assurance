// Variables d'environnement injectées avant chaque fichier de test
process.env.JWT_SECRET   = 'test-jwt-secret-for-tests-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
