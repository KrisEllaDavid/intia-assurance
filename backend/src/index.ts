import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs }    from './schema/typeDefs';
import { resolvers }   from './controllers';
import { buildContext } from './middleware/auth';

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, {
  context: async ({ req }) => buildContext(req as any),
  listen:  { port: Number(process.env.PORT) || 4000 },
}).then(({ url }) => console.log(`Backend INTIA prêt : ${url}`));
