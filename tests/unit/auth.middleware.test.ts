/**
 * Tests unitaires — src/middleware/auth.ts
 * Testent la logique pure JWT sans base de données.
 */
import jwt from 'jsonwebtoken';
import {
  buildContext,
  requireAuth,
  requireEmployee,
  requireAdmin,
  type JwtPayload,
} from '../../backend/src/middleware/auth';

const SECRET = process.env.JWT_SECRET!;

const makeToken = (overrides: Partial<JwtPayload> = {}) =>
  jwt.sign(
    { id: 'u1', email: 't@t.cm', role: 'ADMIN', agenceId: null, type: 'employe', ...overrides },
    SECRET,
    { expiresIn: '1h' }
  );

// ─── buildContext ──────────────────────────────────────────────────────────────

describe('buildContext', () => {
  it('retourne user=null sans header Authorization', () => {
    expect(buildContext({ headers: {} }).user).toBeNull();
  });

  it('retourne user=null quand le schéma n\'est pas Bearer', () => {
    expect(buildContext({ headers: { authorization: 'Basic abc' } }).user).toBeNull();
  });

  it('retourne user=null avec un token invalide', () => {
    expect(buildContext({ headers: { authorization: 'Bearer token.invalide' } }).user).toBeNull();
  });

  it('retourne user=null avec un token expiré', () => {
    const expired = jwt.sign({ id: 'u1', type: 'employe' }, SECRET, { expiresIn: -1 });
    expect(buildContext({ headers: { authorization: `Bearer ${expired}` } }).user).toBeNull();
  });

  it('retourne le payload pour un token valide (employe ADMIN)', () => {
    const token = makeToken({ role: 'ADMIN', type: 'employe' });
    const { user } = buildContext({ headers: { authorization: `Bearer ${token}` } });
    expect(user).not.toBeNull();
    expect(user!.role).toBe('ADMIN');
    expect(user!.type).toBe('employe');
  });

  it('retourne le payload pour un token client', () => {
    const token = makeToken({ role: 'CLIENT', type: 'client', agenceId: 'ag-1' });
    const { user } = buildContext({ headers: { authorization: `Bearer ${token}` } });
    expect(user!.type).toBe('client');
    expect(user!.role).toBe('CLIENT');
  });
});

// ─── requireAuth ──────────────────────────────────────────────────────────────

describe('requireAuth', () => {
  it('lève une erreur quand user est null', () => {
    expect(() => requireAuth(null)).toThrow('Non authentifié');
  });

  it('retourne l\'utilisateur s\'il est présent', () => {
    const u: JwtPayload = { id: 'u1', email: 't@t.cm', role: 'ADMIN', agenceId: null, type: 'employe' };
    expect(requireAuth(u)).toBe(u);
  });
});

// ─── requireEmployee ──────────────────────────────────────────────────────────

describe('requireEmployee', () => {
  it('lève une erreur quand user est null', () => {
    expect(() => requireEmployee(null)).toThrow('Non authentifié');
  });

  it('lève une erreur pour un token de type client', () => {
    const u: JwtPayload = { id: 'c1', email: 'c@t.cm', role: 'CLIENT', agenceId: 'ag1', type: 'client' };
    expect(() => requireEmployee(u)).toThrow('Accès réservé aux employés');
  });

  it('accepte un employé AGENT', () => {
    const u: JwtPayload = { id: 'e1', email: 'e@t.cm', role: 'AGENT', agenceId: 'ag1', type: 'employe' };
    expect(requireEmployee(u)).toBe(u);
  });

  it('accepte un employé ADMIN', () => {
    const u: JwtPayload = { id: 'e2', email: 'a@t.cm', role: 'ADMIN', agenceId: null, type: 'employe' };
    expect(requireEmployee(u)).toBe(u);
  });
});

// ─── requireAdmin ─────────────────────────────────────────────────────────────

describe('requireAdmin', () => {
  it('lève une erreur quand user est null', () => {
    expect(() => requireAdmin(null)).toThrow('Non authentifié');
  });

  it('lève une erreur pour un client', () => {
    const u: JwtPayload = { id: 'c1', email: 'c@t.cm', role: 'CLIENT', agenceId: 'ag1', type: 'client' };
    expect(() => requireAdmin(u)).toThrow();
  });

  it('lève une erreur pour un AGENT', () => {
    const u: JwtPayload = { id: 'e1', email: 'e@t.cm', role: 'AGENT', agenceId: 'ag1', type: 'employe' };
    expect(() => requireAdmin(u)).toThrow('Accès réservé aux administrateurs');
  });

  it('accepte un ADMIN', () => {
    const u: JwtPayload = { id: 'e2', email: 'a@t.cm', role: 'ADMIN', agenceId: null, type: 'employe' };
    expect(requireAdmin(u)).toBe(u);
  });
});
