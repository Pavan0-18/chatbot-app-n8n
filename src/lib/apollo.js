import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

export const createApolloClient = (nhost) => {
  const httpLink = createHttpLink({
    uri: nhost.graphql.getUrl(),
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: nhost.graphql.getUrl().replace('http', 'ws'),
      connectionParams: () => {
        return {
          headers: {
            authorization: `Bearer ${nhost.auth.getAccessToken()}`,
          },
        };
      },
    })
  );

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${nhost.auth.getAccessToken()}`,
      },
    };
  });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    authLink.concat(httpLink)
  );

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
};