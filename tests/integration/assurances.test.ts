/**
 * Tests d'intÃ©gration â€” CRUD Assurances + isolation client/agent
 */
import { ApolloServer } from '@apollo/server';
import { createServer, exec, ADMIN_USER, AGENT_DOUALA, CLIENT_USER } from '../setup/server';

jest.mock('../../backend/src/models', () => ({
  prisma: {
    employe:   { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn() },
    client:    { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    assurance: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    agence:    { findMany: jest.fn() },
  },
}));

const { prisma } = require('../../backend/src/models');

const agence     = { id: 'ag-douala', nom: 'INTIA-Douala', ville: 'Douala' };
const clientMock = { id: 'cli-1', nom: 'Kamga', prenom: 'Paul', agence, agenceId: 'ag-douala' };

const assurance1 = {
  id: 'ass-1', type: 'Auto', prime: 150000, statut: 'ACTIF',
  dateDebut: new Date('2024-01-01'), dateFin: new Date('2024-12-31'),
  clientId: 'cli-1', client: { ...clientMock, agence },
  createdAt: new Date(), updatedAt: new Date(),
};
const assurance2 = { ...assurance1, id: 'ass-2', clientId: 'cli-2', client: { ...clientMock, id: 'cli-2' } };

let server: ApolloServer<any>;
beforeAll(async () => { server = createServer(); await server.start(); });
afterAll(async () => { await server.stop(); });

// â”€â”€â”€ Query assurances â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Query assurances', () => {
  it('ADMIN voit tous les contrats', async () => {
    prisma.assurance.findMany.mockResolvedValue([assurance1, assurance2]);
    const { data } = await exec(server, `query { assurances { id type statut } }`, {}, ADMIN_USER);
    expect(data.assurances).toHaveLength(2);
    expect(prisma.assurance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  it('AGENT voit uniquement les contrats de son agence (filtre client.agenceId)', async () => {
    prisma.assurance.findMany.mockResolvedValue([assurance1]);
    await exec(server, `query { assurances { id } }`, {}, AGENT_DOUALA);
    expect(prisma.assurance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { client: { agenceId: 'ag-douala' } } })
    );
  });

  it('CLIENT voit uniquement ses propres contrats (filtre clientId)', async () => {
    prisma.assurance.findMany.mockResolvedValue([assurance1]);
    await exec(server, `query { assurances { id } }`, {}, CLIENT_USER);
    expect(prisma.assurance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clientId: CLIENT_USER.id } })
    );
  });

  it('refuse l\'accÃ¨s sans authentification', async () => {
    const { errors } = await exec(server, `query { assurances { id } }`);
    expect(errors).toBeDefined();
  });
});

// â”€â”€â”€ Query assurance(id) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Query assurance(id)', () => {
  it('retourne le dÃ©tail d\'un contrat', async () => {
    prisma.assurance.findUnique.mockResolvedValue(assurance1);
    const { data } = await exec(server, `query { assurance(id: "ass-1") { id type prime } }`, {}, ADMIN_USER);
    expect(data.assurance.type).toBe('Auto');
    expect(data.assurance.prime).toBe(150000);
  });
});

// â”€â”€â”€ Mutation createAssurance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Mutation createAssurance', () => {
  const INPUT = { type: 'Habitation', prime: 80000, dateDebut: '2024-01-01', dateFin: '2024-12-31', clientId: 'cli-1' };

  it('crÃ©e un contrat avec statut ACTIF par dÃ©faut', async () => {
    prisma.assurance.create.mockResolvedValue({ ...assurance1, type: 'Habitation', prime: 80000 });
    const { data, errors } = await exec(server, `
      mutation($input: AssuranceInput!) { createAssurance(input: $input) { id type statut } }
    `, { input: INPUT }, ADMIN_USER);
    expect(errors).toBeUndefined();
    expect(data.createAssurance.statut).toBe('ACTIF');
    // VÃ©rifier que les dates sont bien converties en Date
    expect(prisma.assurance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ dateDebut: new Date('2024-01-01'), dateFin: new Date('2024-12-31') })
      })
    );
  });

  it('bloque un utilisateur non authentifiÃ©', async () => {
    const { errors } = await exec(server, `
      mutation { createAssurance(input: { type:"Auto", prime:10000, dateDebut:"2024-01-01", dateFin:"2024-12-31", clientId:"c1" }) { id } }
    `);
    expect(errors).toBeDefined();
  });

  it('bloque un CLIENT (lecture seule)', async () => {
    const { errors } = await exec(server, `
      mutation($input: AssuranceInput!) { createAssurance(input: $input) { id } }
    `, { input: INPUT }, CLIENT_USER);
    expect(errors).toBeDefined();
    expect(errors![0].message).toMatch(/employ/i);
  });
});

// â”€â”€â”€ Mutation updateAssurance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Mutation updateAssurance', () => {
  it('met Ã  jour le statut vers RÃ‰SILIÃ‰', async () => {
    prisma.assurance.update.mockResolvedValue({ ...assurance1, statut: 'RESILIE' });
    const { data } = await exec(server, `
      mutation($id: ID!, $input: AssuranceInput!) { updateAssurance(id: $id, input: $input) { statut } }
    `, { id: 'ass-1', input: { type: 'Auto', prime: 150000, dateDebut: '2024-01-01', dateFin: '2024-12-31', statut: 'RESILIE', clientId: 'cli-1' } }, ADMIN_USER);
    expect(data.updateAssurance.statut).toBe('RESILIE');
  });
});

// â”€â”€â”€ Mutation deleteAssurance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Mutation deleteAssurance', () => {
  it('supprime un contrat', async () => {
    prisma.assurance.delete.mockResolvedValue(assurance1);
    const { data, errors } = await exec(server, `mutation { deleteAssurance(id: "ass-1") { id } }`, {}, ADMIN_USER);
    expect(errors).toBeUndefined();
    expect(data.deleteAssurance.id).toBe('ass-1');
  });
});

