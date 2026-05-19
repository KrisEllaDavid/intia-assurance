// Mock léger de @prisma/client — utilisé par moduleNameMapper
export const PrismaClient = jest.fn().mockImplementation(() => ({
  $disconnect: jest.fn(),
}));

export const Role   = { ADMIN: 'ADMIN', AGENT: 'AGENT' } as const;
export const Statut = { ACTIF: 'ACTIF', RESILIE: 'RESILIE' } as const;
