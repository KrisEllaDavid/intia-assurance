import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getToken } from '../lib/auth';

const httpLink = createHttpLink({ uri: '/graphql' });

const authLink = setContext((_, { headers }) => ({
  headers: { ...headers, authorization: getToken() ? `Bearer ${getToken()}` : '' },
}));

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
