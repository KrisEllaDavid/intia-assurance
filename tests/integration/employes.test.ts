/**
 * Tests d'intÃ©gration â€” CRUD EmployÃ©s (Admin uniquement)
 */
import { ApolloServer } from '@apollo/server';
import { createServer, exec, ADMIN_USER, AGENT_DOUALA } from '../setup/server';

jest.mock('../../backend/src/models', () => ({
  prisma: {
    employe:   { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
    client:    { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    assurance: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    agence:    { findMany: jest.fn() },
  },
}));

const { prisma } = require('../../backend/src/models');

const agence    = { id: 'ag-douala', nom: 'INTIA-Douala', ville: 'Douala' };
const empAdmin  = { id: 'e-admin', nom: 'Admin', prenom: 'INTIA',  email: 'admin@intia.cm', role: 'ADMIN', agenceId: null,       agence: null };
const empAgent  = { id: 'e-agent', nom: 'Agent', prenom: 'Douala', email: 'agent@intia.cm', role: 'AGENT', agenceId: 'ag-douala', agence };

let server: ApolloServer<any>;
beforeAll(async () => { server = createServer(); await server.start(); });
afterAll(async () => { await server.stop(); });

// â”€â”€â”€ Query employes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Query employes', () => {
  it('ADMIN rÃ©cupÃ¨re la liste de tous les employÃ©s', async () => {
    prisma.employe.findMany.mockResolvedValue([empAdmin, empAgent]);
    const { data, errors } = await exec(server, `query { employes { id nom role agence { nom } } }`, {}, ADMIN_USER);
    expect(errors).toBeUndefined();
    expect(data.employes).toHaveLength(2);
    expect(data.employes[0].role).toBe('ADMIN');
  });

  it('AGENT ne peut pas lister les employÃ©s', async () => {
    const { errors } = await exec(server, `query { employes { id } }`, {}, AGENT_DOUALA);
    expect(errors).toBeDefined();
    expect(errors![0].message).toMatch(/admin/i);
  });

  it('refuse l\'accÃ¨s sans authentification', async () => {
    const { errors } = await exec(server, `query { employes { id } }`);
    expect(errors).toBeDefined();
  });
});

// â”€â”€â”€ Mutation createEmploye â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Mutation createEmploye', () => {
  const INPUT = { nom: 'Bello', prenom: 'Ali', email: 'ali@intia.cm', motDePasse: 'Pass@1234', role: 'AGENT', agenceId: 'ag-douala' };

  it('ADMIN crÃ©e un nouvel employÃ©', async () => {
    prisma.employe.create.mockResolvedValue({ ...empAgent, nom: 'Bello', prenom: 'Ali', email: 'ali@intia.cm' });
    const { data, errors } = await exec(server, `
      mutation($input: EmployeInput!) { createEmploye(input: $input) { id nom email role agence { nom } } }
    `, { input: INPUT }, ADMIN_USER);
    expect(errors).toBeUndefined();
    expect(data.createEmploye.nom).toBe('Bello');
    expect(data.createEmploye.role).toBe('AGENT');
  });

  it('le mot de passe est hachÃ© avant stockage', async () => {
    prisma.employe.create.mockResolvedValue(empAgent);
    await exec(server, `
      mutation($input: EmployeInput!) { createEmploye(input: $input) { id } }
    `, { input: INPUT }, ADMIN_USER);
    const callData = prisma.employe.create.mock.calls[0][0].data;
    // Le mot de passe stockÃ© ne doit pas Ãªtre en clair
    expect(callData.motDePasse).not.toBe('Pass@1234');
    expect(callData.motDePasse).toMatch(/^\$2[aby]\$/); // format bcrypt
  });

  it('AGENT ne peut pas crÃ©er d\'employÃ©', async () => {
    const { errors } = await exec(server, `
      mutation($input: EmployeInput!) { createEmploye(input: $input) { id } }
    `, { input: INPUT }, AGENT_DOUALA);
    expect(errors).toBeDefined();
    expect(errors![0].message).toMatch(/admin/i);
  });

  it('sans authentification, la crÃ©ation est refusÃ©e', async () => {
    const { errors } = await exec(server, `
      mutation($input: EmployeInput!) { createEmploye(input: $input) { id } }
    `, { input: INPUT });
    expect(errors).toBeDefined();
  });
});

// â”€â”€â”€ Mutation deleteEmploye â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Mutation deleteEmploye', () => {
  it('ADMIN supprime un employÃ©', async () => {
    prisma.employe.delete.mockResolvedValue(empAgent);
    const { data, errors } = await exec(server, `mutation { deleteEmploye(id: "e-agent") { id nom } }`, {}, ADMIN_USER);
    expect(errors).toBeUndefined();
    expect(data.deleteEmploye.id).toBe('e-agent');
  });

  it('AGENT ne peut pas supprimer d\'employÃ©', async () => {
    const { errors } = await exec(server, `mutation { deleteEmploye(id: "e-admin") { id } }`, {}, AGENT_DOUALA);
    expect(errors).toBeDefined();
  });
});

