import { gql } from '@apollo/client';

export const GET_CLIENTS = gql`
  query GetClients($agenceId: ID) {
    clients(agenceId: $agenceId) {
      id nom prenom email telephone
      agence { id nom }
      createdAt
    }
  }
`;

export const GET_CLIENT = gql`
  query GetClient($id: ID!) {
    client(id: $id) {
      id nom prenom email telephone adresse
      agence { id nom }
      assurances { id type prime statut dateDebut dateFin }
    }
  }
`;

export const CREATE_CLIENT = gql`
  mutation CreateClient($input: ClientInput!) {
    createClient(input: $input) { id nom prenom email }
  }
`;

export const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: ClientInput!) {
    updateClient(id: $id, input: $input) { id nom prenom email }
  }
`;

export const DELETE_CLIENT = gql`
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id) { id }
  }
`;
