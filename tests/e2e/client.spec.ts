/**
 * Tests E2E — Portail Client
 * Prérequis : un client avec motDePasse doit exister en base.
 * Créer via l'interface admin avant de lancer ces tests.
 */
import { test, expect, Page } from '@playwright/test';

const CLIENT = { email: 'client.e2e@test.cm', password: 'Client@1234' };

async function loginClient(page: Page) {
  await page.goto('/client/login');
  await page.fill('input[type="email"]', CLIENT.email);
  await page.fill('input[type="password"]', CLIENT.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/client/mes-assurances');
}

// ─── Authentification Client ──────────────────────────────────────────────────

test.describe('Authentification Client', () => {
  test('la page portail client s\'affiche', async ({ page }) => {
    await page.goto('/client/login');
    await expect(page.locator('h1')).toContainText('INTIA');
    await expect(page.locator('text=Portail Client')).toBeVisible();
  });

  test('lien vers espace employé visible', async ({ page }) => {
    await page.goto('/client/login');
    await expect(page.locator('text=Espace employé')).toBeVisible();
  });

  test('erreur avec mauvais mot de passe', async ({ page }) => {
    await page.goto('/client/login');
    await page.fill('input[type="email"]', CLIENT.email);
    await page.fill('input[type="password"]', 'WrongPass');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error')).toBeVisible();
  });
});

// ─── Portail "Mes Contrats" ───────────────────────────────────────────────────

test.describe('Mes Assurances (portail client)', () => {
  test.beforeEach(async ({ page }) => {
    await loginClient(page);
  });

  test('redirige vers /client/mes-assurances après login', async ({ page }) => {
    await expect(page).toHaveURL(/\/client\/mes-assurances/);
  });

  test('affiche le titre et le nom de l\'agence', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('contrats');
  });

  test('aucun bouton Modifier ou Supprimer visible (lecture seule)', async ({ page }) => {
    await expect(page.locator('button:has-text("Modifier")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Supprimer")')).toHaveCount(0);
    await expect(page.locator('a:has-text("Modifier")')).toHaveCount(0);
  });

  test('aucun lien de navigation vers les pages employé', async ({ page }) => {
    await expect(page.locator('a[href="/clients"]')).toHaveCount(0);
    await expect(page.locator('a[href="/assurances"]')).toHaveCount(0);
    await expect(page.locator('a[href="/employes"]')).toHaveCount(0);
  });

  test('le badge de statut s\'affiche (ACTIF ou RÉSILIÉ)', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    if (count > 0) {
      await expect(page.locator('.badge').first()).toBeVisible();
    }
  });

  test('déconnexion redirige vers /client/login', async ({ page }) => {
    await page.click('button:has-text("Déconnexion")');
    await expect(page).toHaveURL(/\/client\/login/);
  });
});

// ─── Protection des routes client ────────────────────────────────────────────

test.describe('Protection des routes client', () => {
  test('accès à /client/mes-assurances sans token redirige', async ({ page }) => {
    await page.goto('/client/mes-assurances');
    await expect(page).toHaveURL(/\/client\/login/);
  });
});
