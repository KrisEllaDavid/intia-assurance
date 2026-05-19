import { agenceController }   from './agence.controller';
import { clientController }    from './client.controller';
import { assuranceController } from './assurance.controller';
import { authController }      from './auth.controller';

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
};
