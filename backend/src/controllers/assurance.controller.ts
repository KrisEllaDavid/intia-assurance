import { prisma }                        from '../models';
import { Context, requireAuth, requireEmployee } from '../middleware/auth';

const include = { client: { include: { agence: true } } };

export const assuranceController = {
  Query: {
    assurances: (_: unknown, { clientId }: { clientId?: string }, { user }: Context) => {
      const u = requireAuth(user);
      const where: any = {};

      if (u.type === 'client') {
        // Un client ne voit que ses propres assurances
        where.clientId = u.id;
      } else {
        if (clientId)           where.clientId = clientId;
        if (u.role === 'AGENT') where.client   = { agenceId: u.agenceId! };
      }

      return prisma.assurance.findMany({ where, include, orderBy: { createdAt: 'desc' } });
    },

    assurance: (_: unknown, { id }: { id: string }, { user }: Context) => {
      requireAuth(user);
      return prisma.assurance.findUnique({ where: { id }, include });
    },
  },

  Mutation: {
    createAssurance: (_: unknown, { input }: { input: any }, { user }: Context) => {
      requireEmployee(user);
      return prisma.assurance.create({
        data:    { ...input, dateDebut: new Date(input.dateDebut), dateFin: new Date(input.dateFin) },
        include,
      });
    },

    updateAssurance: (_: unknown, { id, input }: { id: string; input: any }, { user }: Context) => {
      requireEmployee(user);
      return prisma.assurance.update({
        where:   { id },
        data:    { ...input, dateDebut: new Date(input.dateDebut), dateFin: new Date(input.dateFin) },
        include,
      });
    },

    deleteAssurance: (_: unknown, { id }: { id: string }, { user }: Context) => {
      requireEmployee(user);
      return prisma.assurance.delete({ where: { id }, include });
    },
  },
};
