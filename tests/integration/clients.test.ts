/**
 * Tests d'intÃ©gration â€” CRUD Clients + isolation par agence
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

const agenceDouala  = { id: 'ag-douala', nom: 'INTIA-Douala',  ville: 'Douala'  };
const agenceYaounde = { id: 'ag-yde',    nom: 'INTIA-YaoundÃ©', ville: 'YaoundÃ©' };

const clientDouala  = { id: 'c1', nom: 'Kamga', prenom: 'Paul',   email: 'paul@d.cm',   telephone: null, agenceId: 'ag-douala',  agence: agenceDouala,  assurances: [], createdAt: new Date(), updatedAt: new Date() };
const clientYaounde = { id: 'c2', nom: 'Mballa', prenom: 'Marie', email: 'marie@y.cm',  telephone: null, agenceId: 'ag-yde',     agence: agenceYaounde, assurances: [], createdAt: new Date(), updatedAt: new Date() };

let server: ApolloServer<any>;
beforeAll(async () => { server = createServer(); await server.start(); });
afterAll(async () => { await server.stop(); });

// â”€â”€â”€ Query clients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Query clients', () => {
  it('ADMIN voit tous les clients', async () => {
    prisma.client.findMany.mockResolvedValue([clientDouala, clientYaounde]);
    const { data } = await exec(server, `query { clients { id nom agence { nom } } }`, {}, ADMIN_USER);
    expect(data.clients).toHaveLength(2);
    expect(prisma.client.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: undefined }));
  });

  it('AGENT ne voit que les clients de son agence', async () => {
    prisma.client.findMany.mockResolvedValue([clientDouala]);
    const { data } = await exec(server, `query { clients { id nom agence { nom } } }`, {}, AGENT_DOUALA);
    expect(data.clients).toHaveLength(1);
    expect(data.clients[0].agence.nom).toBe('INTIA-Douala');
    // VÃ©rifier que le filtre agenceId a Ã©tÃ© appliquÃ©
    expect(prisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { agenceId: 'ag-douala' } })
    );
  });

  it('requiert une authentification', async () => {
    const { errors } = await exec(server, `query { clients { id } }`);
    expect(errors).toBeDefined();
    expect(errors![0].message).toMatch(/authentifi/i);
  });
});

// â”€â”€â”€ Query client(id) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Query client(id)', () => {
  it('retourne un client existant', async () => {
    prisma.client.findUnique.mockResolvedValue(clientDouala);
    const { data } = await exec(server, `query { client(id: "c1") { id nom prenom } }`, {}, ADMIN_USER);
    expect(data.client.nom).toBe('Kamga');
  });

  it('retourne null si client inexistant', async () => {
    prisma.client.findUnique.mockResolvedValue(null);
    const { data } = await exec(server, `query { client(id: "xxx") { id } }`, {}, ADMIN_USER);
    expect(data.client).toBeNull();
  });
});

// â”€â”€â”€ Mutation createClient â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Mutation createClient', () => {
  const INPUT_ADMIN = { nom: 'Nkono', prenom: 'Luc', email: 'luc@test.cm', agenceId: 'ag-douala' };

  it('ADMIN crÃ©e un client dans n\'importe quelle agence', async () => {
    prisma.client.create.mockResolvedValue({ ...clientDouala, nom: 'Nkono', prenom: 'Luc' });
    const { data, errors } = await exec(server, `
      mutation($input: ClientInput!) { createClient(input: $input) { id nom } }
    `, { input: INPUT_ADMIN }, ADMIN_USER);
    expect(errors).toBeUndefined();
    expect(data.createClient.nom).toBe('Nkono');
  });

  it('AGENT crÃ©e un client forcÃ© dans son agence (agenceId override)', async () => {
    prisma.client.create.mockResolvedValue(clientDouala);
    await exec(server, `
      mutation($input: ClientInput!) { createClient(input: $input) { id } }
    `, { input: INPUT_ADMIN }, AGENT_DOUALA);
    // Le resolver doit forcer agenceId = ag-douala (l'agence de l'agent)
    expect(prisma.client.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ agenceId: 'ag-douala' }) })
    );
  });

  it('bloque un utilisateur non authentifiÃ©', async () => {
    const { errors } = await exec(server, `
      mutation { createClient(input: { nom:"X", prenom:"Y", email:"x@y.cm", agenceId:"ag1" }) { id } }
    `);
    expect(errors).toBeDefined();
  });
});

// â”€â”€â”€ Mutation updateClient â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Mutation updateClient', () => {
  it('met Ã  jour les donnÃ©es du client', async () => {
    prisma.client.update.mockResolvedValue({ ...clientDouala, nom: 'KamgaUpdated' });
    const { data } = await exec(server, `
      mutation($id: ID!, $input: ClientInput!) { updateClient(id: $id, input: $input) { nom } }
    `, { id: 'c1', input: { nom: 'KamgaUpdated', prenom: 'Paul', email: 'paul@d.cm', agenceId: 'ag-douala' } }, ADMIN_USER);
    expect(data.updateClient.nom).toBe('KamgaUpdated');
  });
});

// â”€â”€â”€ Mutation deleteClient â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Mutation deleteClient', () => {
  it('supprime le client et retourne son profil', async () => {
    prisma.client.delete.mockResolvedValue(clientDouala);
    const { data, errors } = await exec(server, `
      mutation { deleteClient(id: "c1") { id nom } }
    `, {}, ADMIN_USER);
    expect(errors).toBeUndefined();
    expect(data.deleteClient.id).toBe('c1');
  });

  it('bloque un client (non employÃ©)', async () => {
    const CLIENT_USER = { id: 'c1', email: 'x@x.cm', role: 'CLIENT' as const, agenceId: 'ag1', type: 'client' as const };
    const { errors } = await exec(server, `mutation { deleteClient(id: "c1") { id } }`, {}, CLIENT_USER);
    expect(errors).toBeDefined();
  });
});

