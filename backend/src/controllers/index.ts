import { agenceController }   from './agence.controller';
import { clientController }    from './client.controller';
import { assuranceController } from './assurance.controller';
import { authController }      from './auth.controller';
import { prisma }              from '../models';

export const resolvers = {
  Query: {
    ...authController.Query,
    ...agenceController.Query,
    ...clientController.Query,
    ...assuranceController.Query,
  },
  Mutation: {
    ...authController.Mutation,
    ...clientController.Mutation,
    ...assuranceController.Mutation,
  },

  // Field resolvers — garantissent que les champs non-null sont toujours résolus
  // même quand Prisma ne les a pas inclus dans la requête parente.
  Assurance: {
    client: (parent: any) =>
      parent.client ??
      prisma.client.findUnique({
        where:   { id: parent.clientId },
        include: { agence: true },
      }),
  },
  Client: {
    agence: (parent: any) =>
      parent.agence ??
      prisma.agence.findUnique({ where: { id: parent.agenceId } }),

    assurances: (parent: any) =>
      parent.assurances ??
      prisma.assurance.findMany({ where: { clientId: parent.id } }),
  },
  Agence: {
    clients: (parent: any) =>
      parent.clients ??
      prisma.client.findMany({ where: { agenceId: parent.id } }),

    employes: (parent: any) =>
      parent.employes ??
      prisma.employe.findMany({ where: { agenceId: parent.id } }),
  },
};
