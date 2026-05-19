import { ApolloServer } from '@apollo/server';
import { typeDefs }  from '../../backend/src/schema/typeDefs';
import { resolvers } from '../../backend/src/controllers';
import type { JwtPayload } from '../../backend/src/middleware/auth';

export type { JwtPayload };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createServer(): ApolloServer<any> {
  return new ApolloServer<any>({ typeDefs, resolvers });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function exec(
  server: ApolloServer<any>,
  query: string,
  variables?: Record<string, unknown>,
  user?: JwtPayload | null
) {
  const res = await server.executeOperation(
    { query, variables },
    { contextValue: { user: user ?? null } }
  );
  if (res.body.kind !== 'single') throw new Error('Unexpected incremental response');
  return res.body.singleResult as { data: any; errors?: any[] };
}

// Payloads réutilisables dans tous les tests d'intégration
export const ADMIN_USER: JwtPayload = {
  id: 'emp-admin', email: 'admin@intia.cm',
  role: 'ADMIN', agenceId: null, type: 'employe',
};
export const AGENT_DOUALA: JwtPayload = {
  id: 'emp-agent', email: 'agent.douala@intia.cm',
  role: 'AGENT', agenceId: 'ag-douala', type: 'employe',
};
export const CLIENT_USER: JwtPayload = {
  id: 'cli-1', email: 'jean@client.cm',
  role: 'CLIENT', agenceId: 'ag-douala', type: 'client',
};
