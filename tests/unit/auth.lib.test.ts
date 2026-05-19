/**
 * Tests unitaires — frontend/src/lib/auth.ts
 * Testent les helpers localStorage (token, user type, isAdmin).
 */

// Mock localStorage (Node n'en a pas nativement)
const store: Record<string, string> = {};
const localStorageMock = {
  getItem:    (k: string) => store[k] ?? null,
  setItem:    (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear:      () => { Object.keys(store).forEach(k => delete store[k]); },
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

import {
  saveEmployeAuth,
  saveClientAuth,
  clearAuth,
  getToken,
  getUserType,
  getUser,
  isAdmin,
  type EmployeStored,
  type ClientStored,
} from '../../frontend/src/lib/auth';

const mockAdmin: EmployeStored = {
  id: 'e1', nom: 'Admin', prenom: 'INTIA', email: 'admin@intia.cm',
  role: 'ADMIN', agenceId: null, agence: null,
};
const mockAgent: EmployeStored = {
  id: 'e2', nom: 'Agent', prenom: 'Douala', email: 'agent@intia.cm',
  role: 'AGENT', agenceId: 'ag-douala', agence: { id: 'ag-douala', nom: 'INTIA-Douala' },
};
const mockClient: ClientStored = {
  id: 'c1', nom: 'Dupont', prenom: 'Jean', email: 'jean@test.cm',
  agenceId: 'ag-douala', agence: { id: 'ag-douala', nom: 'INTIA-Douala' },
};

beforeEach(() => localStorageMock.clear());

// ─── saveEmployeAuth ──────────────────────────────────────────────────────────

describe('saveEmployeAuth', () => {
  it('stocke le token', () => {
    saveEmployeAuth('tok-admin', mockAdmin);
    expect(getToken()).toBe('tok-admin');
  });

  it('marque le type comme "employe"', () => {
    saveEmployeAuth('tok', mockAdmin);
    expect(getUserType()).toBe('employe');
  });

  it('stocke le profil utilisateur', () => {
    saveEmployeAuth('tok', mockAdmin);
    const user = getUser() as EmployeStored;
    expect(user.email).toBe('admin@intia.cm');
    expect(user.role).toBe('ADMIN');
  });
});

// ─── saveClientAuth ───────────────────────────────────────────────────────────

describe('saveClientAuth', () => {
  it('stocke le token client', () => {
    saveClientAuth('tok-client', mockClient);
    expect(getToken()).toBe('tok-client');
  });

  it('marque le type comme "client"', () => {
    saveClientAuth('tok-client', mockClient);
    expect(getUserType()).toBe('client');
  });

  it('stocke le profil client', () => {
    saveClientAuth('tok', mockClient);
    const user = getUser() as ClientStored;
    expect(user.email).toBe('jean@test.cm');
    expect(user.agence.nom).toBe('INTIA-Douala');
  });
});

// ─── clearAuth ────────────────────────────────────────────────────────────────

describe('clearAuth', () => {
  it('supprime le token', () => {
    saveEmployeAuth('tok', mockAdmin);
    clearAuth();
    expect(getToken()).toBeNull();
  });

  it('supprime le type', () => {
    saveEmployeAuth('tok', mockAdmin);
    clearAuth();
    expect(getUserType()).toBeNull();
  });

  it('supprime le profil', () => {
    saveEmployeAuth('tok', mockAdmin);
    clearAuth();
    expect(getUser()).toBeNull();
  });
});

// ─── isAdmin ──────────────────────────────────────────────────────────────────

describe('isAdmin', () => {
  it('retourne true pour un ADMIN', () => {
    saveEmployeAuth('tok', mockAdmin);
    expect(isAdmin()).toBe(true);
  });

  it('retourne false pour un AGENT', () => {
    saveEmployeAuth('tok', mockAgent);
    expect(isAdmin()).toBe(false);
  });

  it('retourne false pour un client', () => {
    saveClientAuth('tok', mockClient);
    expect(isAdmin()).toBe(false);
  });

  it('retourne false quand non connecté', () => {
    expect(isAdmin()).toBe(false);
  });
});
