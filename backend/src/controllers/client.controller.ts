import bcrypt from 'bcryptjs';
import { prisma }                        from '../models';
import { Context, requireAuth, requireEmployee } from '../middleware/auth';

const include = { agence: true, assurances: true };

export const clientController = {
  Query: {
    clients: (_: unknown, { agenceId }: { agenceId?: string }, { user }: Context) => {
      const u = requireEmployee(user);
      const effectiveAgenceId = u.role === 'AGENT' ? u.agenceId ?? undefined : agenceId;
      return prisma.client.findMany({
        where:   effectiveAgenceId ? { agenceId: effectiveAgenceId } : undefined,
        include,
        orderBy: { createdAt: 'desc' },
      });
    },

    client: (_: unknown, { id }: { id: string }, { user }: Context) => {
      requireEmployee(user);
      return prisma.client.findUnique({ where: { id }, include });
    },
  },

  Mutation: {
    createClient: async (_: unknown, { input }: { input: any }, { user }: Context) => {
      const u = requireEmployee(user);
      const agenceId  = u.role === 'AGENT' ? u.agenceId! : input.agenceId;
      const { motDePasse, ...rest } = input;
      const hashed = motDePasse ? await bcrypt.hash(motDePasse, 10) : undefined;
      return prisma.client.create({
        data:    { ...rest, agenceId, ...(hashed ? { motDePasse: hashed } : {}) },
        include,
      });
    },

    updateClient: async (_: unknown, { id, input }: { id: string; input: any }, { user }: Context) => {
      requireEmployee(user);
      const { motDePasse, ...rest } = input;
      const hashed = motDePasse ? await bcrypt.hash(motDePasse, 10) : undefined;
      return prisma.client.update({
        where:   { id },
        data:    { ...rest, ...(hashed ? { motDePasse: hashed } : {}) },
        include,
      });
    },

    deleteClient: (_: unknown, { id }: { id: string }, { user }: Context) => {
      requireEmployee(user);
      return prisma.client.delete({ where: { id }, include });
    },
  },
};
