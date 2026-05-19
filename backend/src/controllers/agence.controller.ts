import { prisma }          from '../models';
import { Context, requireEmployee } from '../middleware/auth';

export const agenceController = {
  Query: {
    agences: (_: unknown, __: unknown, { user }: Context) => {
      requireEmployee(user);
      return prisma.agence.findMany({ include: { clients: true, employes: true } });
    },
  },
};
