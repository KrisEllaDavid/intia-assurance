/**
 * Tests E2E — Parcours employé (Admin)
 * Prérequis : application démarrée sur http://localhost:3000
 */
import { test, expect, Page } from '@playwright/test';

const ADMIN = { email: 'admin@intia.cm', password: 'Admin@1234' };

async function loginEmploye(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/clients');
}

// ─── Authentification ─────────────────────────────────────────────────────────

test.describe('Authentification Employé', () => {
  test('login avec identifiants corrects redirige vers /clients', async ({ page }) => {
    await loginEmploye(page, ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL(/\/clients/);
    await expect(page.locator('h1')).toContainText('Clients');
  });

  test('login avec mauvais mot de passe affiche une erreur', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN.email);
    await page.fill('input[type="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error')).toBeVisible();
    await expect(page.locator('.error')).toContainText('invalides');
  });

  test('lien vers portail client visible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Portail client')).toBeVisible();
  });

  test('déconnexion redirige vers /login', async ({ page }) => {
    await loginEmploye(page, ADMIN.email, ADMIN.password);
    await page.click('button:has-text("Déconnexion")');
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── CRUD Clients ─────────────────────────────────────────────────────────────

test.describe('CRUD Clients', () => {
  test.beforeEach(async ({ page }) => {
    await loginEmploye(page, ADMIN.email, ADMIN.password);
  });

  test('liste des clients s\'affiche', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Clients');
    await expect(page.locator('table')).toBeVisible();
  });

  test('créer un nouveau client', async ({ page }) => {
    await page.click('a:has-text("Nouveau client")');
    await expect(page).toHaveURL(/\/clients\/new/);

    // Sélecteurs ciblés par label — robustes quel que soit l'ordre des inputs
    await page.locator('label:has-text("Nom") + div input, label:has-text("Nom") ~ input').first().fill('TestNom');
    await page.locator('label:has-text("Prénom") + div input, label:has-text("Prénom") ~ input').first().fill('TestPrenom');
    await page.locator('input[type="email"]').fill(`test_e2e_${Date.now()}@test.cm`);

    // Agence (admin voit le dropdown)
    await page.locator('select').last().selectOption({ index: 1 });

    await page.click('button:has-text("Enregistrer")');
    await expect(page).toHaveURL(/\/clients/);
    await expect(page.locator('td:has-text("TestNom")')).toBeVisible();
  });

  test('modifier un client existant', async ({ page }) => {
    await page.locator('a:has-text("Modifier")').first().click();
    await expect(page).toHaveURL(/\/clients\/.+\/edit/);
    await expect(page.locator('h1')).toContainText('Modifier');
  });

  test('supprimer un client — confirmation demandée', async ({ page }) => {
    page.on('dialog', dialog => dialog.dismiss());
    await page.locator('button:has-text("Supprimer")').first().click();
    await expect(page.locator('table')).toBeVisible();
  });
});

// ─── CRUD Contrats ────────────────────────────────────────────────────────────

test.describe('CRUD Contrats', () => {
  test.beforeEach(async ({ page }) => {
    await loginEmploye(page, ADMIN.email, ADMIN.password);
    await page.click('a:has-text("Contrats")');
    await expect(page).toHaveURL(/\/assurances/);
  });

  test('liste des contrats s\'affiche', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Contrats');
  });

  test('accéder au formulaire de création', async ({ page }) => {
    await page.click('a:has-text("Nouveau contrat")');
    await expect(page).toHaveURL(/\/assurances\/new/);
    await expect(page.locator('h1')).toContainText('Nouveau contrat');
  });
});

// ─── Accès Admin ──────────────────────────────────────────────────────────────

test.describe('Menu Employés (Admin)', () => {
  test('lien "Employés" visible pour l\'admin', async ({ page }) => {
    await loginEmploye(page, ADMIN.email, ADMIN.password);
    await expect(page.locator('.nav-links a:has-text("Employés")')).toBeVisible();
  });

  test('page employés liste le personnel', async ({ page }) => {
    await loginEmploye(page, ADMIN.email, ADMIN.password);
    await page.click('a:has-text("Employés")');
    await expect(page).toHaveURL(/\/employes/);
    await expect(page.locator('h1')).toContainText('Employés');
    await expect(page.locator('table')).toBeVisible();
  });
});

// ─── Protection des routes ────────────────────────────────────────────────────

test.describe('Protection des routes employé', () => {
  test('accès à /clients sans token redirige vers /login', async ({ page }) => {
    await page.goto('/clients');
    await expect(page).toHaveURL(/\/login/);
  });

  test('accès à /employes sans token redirige vers /login', async ({ page }) => {
    await page.goto('/employes');
    await expect(page).toHaveURL(/\/login/);
  });
});
