/**
 * Tests d'intÃ©gration â€” Authentification
 * Apollo Server rÃ©el + Prisma mockÃ©.
 */
import { ApolloServer } from '@apollo/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer, exec, ADMIN_USER, CLIENT_USER } from '../setup/server';

// â”€â”€ Mock Prisma â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
jest.mock('../../backend/src/models', () => ({
  prisma: {
    employe:   { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
    client:    { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    assurance: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    agence:    { findMany: jest.fn() },
  },
}));

const { prisma } = require('../../backend/src/models');

const HASH = bcrypt.hashSync('Admin@1234', 10);
const CLIENT_HASH = bcrypt.hashSync('Client@1234', 10);

const mockEmploye = {
  id: 'emp-1', email: 'admin@intia.cm', motDePasse: HASH,
  nom: 'Admin', prenom: 'INTIA', role: 'ADMIN', agenceId: null, agence: null,
};
const mockClient = {
  id: 'cli-1', email: 'jean@test.cm', motDePasse: CLIENT_HASH,
  nom: 'Dupont', prenom: 'Jean', agenceId: 'ag-douala',
  agence: { id: 'ag-douala', nom: 'INTIA-Douala' }, assurances: [],
  createdAt: new Date(), updatedAt: new Date(),
};

let server: ApolloServer<any>;
beforeAll(async () => { server = createServer(); await server.start(); });
afterAll(async () => { await server.stop(); });

// â”€â”€â”€ loginEmploye â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Mutation loginEmploye', () => {
  it('retourne un token JWT valide pour identifiants corrects', async () => {
    prisma.employe.findUnique.mockResolvedValue(mockEmploye);
    const { data, errors } = await exec(server, `
      mutation { loginEmploye(email: "admin@intia.cm", motDePasse: "Admin@1234") {
        token employe { id email role }
      }}
    `);
    expect(errors).toBeUndefined();
    expect(data.loginEmploye.token).toBeTruthy();
    expect(data.loginEmploye.employe.role).toBe('ADMIN');
    const payload: any = jwt.verify(data.loginEmploye.token, process.env.JWT_SECRET!);
    expect(payload.type).toBe('employe');
    expect(payload.role).toBe('ADMIN');
  });

  it('Ã©choue avec un mauvais mot de passe', async () => {
    prisma.employe.findUnique.mockResolvedValue(mockEmploye);
    const { errors } = await exec(server, `
      mutation { loginEmploye(email: "admin@intia.cm", motDePasse: "WrongPass") { token } }
    `);
    expect(errors).toBeDefined();
    expect(errors![0].message).toBe('Identifiants invalides');
  });

  it('Ã©choue si l\'email est inconnu', async () => {
    prisma.employe.findUnique.mockResolvedValue(null);
    const { errors } = await exec(server, `
      mutation { loginEmploye(email: "inconnu@intia.cm", motDePasse: "Admin@1234") { token } }
    `);
    expect(errors).toBeDefined();
    expect(errors![0].message).toBe('Identifiants invalides');
  });
});

// â”€â”€â”€ loginClient â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Mutation loginClient', () => {
  it('retourne un token de type client pour identifiants corrects', async () => {
    prisma.client.findUnique.mockResolvedValue(mockClient);
    const { data, errors } = await exec(server, `
      mutation { loginClient(email: "jean@test.cm", motDePasse: "Client@1234") {
        token client { id email }
      }}
    `);
    expect(errors).toBeUndefined();
    expect(data.loginClient.token).toBeTruthy();
    const payload: any = jwt.verify(data.loginClient.token, process.env.JWT_SECRET!);
    expect(payload.type).toBe('client');
    expect(payload.role).toBe('CLIENT');
  });

  it('Ã©choue si le client n\'a pas de mot de passe (portail non activÃ©)', async () => {
    prisma.client.findUnique.mockResolvedValue({ ...mockClient, motDePasse: null });
    const { errors } = await exec(server, `
      mutation { loginClient(email: "jean@test.cm", motDePasse: "Client@1234") { token } }
    `);
    expect(errors).toBeDefined();
    expect(errors![0].message).toBe('Identifiants invalides');
  });
});

// â”€â”€â”€ meEmploye / meClient â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Query meEmploye', () => {
  it('retourne le profil de l\'employÃ© connectÃ©', async () => {
    prisma.employe.findUnique.mockResolvedValue(mockEmploye);
    const { data } = await exec(server, `query { meEmploye { id email role } }`, {}, ADMIN_USER);
    expect(data.meEmploye.email).toBe('admin@intia.cm');
  });

  it('renvoie une erreur sans token', async () => {
    const { errors } = await exec(server, `query { meEmploye { id } }`);
    expect(errors).toBeDefined();
  });
});

describe('Query meClient', () => {
  it('retourne le profil du client connectÃ©', async () => {
    prisma.client.findUnique.mockResolvedValue(mockClient);
    const { data } = await exec(server, `query { meClient { id email } }`, {}, CLIENT_USER);
    expect(data.meClient.email).toBe('jean@test.cm');
  });

  it('refuse l\'accÃ¨s Ã  un employÃ©', async () => {
    const { errors } = await exec(server, `query { meClient { id } }`, {}, ADMIN_USER);
    expect(errors).toBeDefined();
  });
});

