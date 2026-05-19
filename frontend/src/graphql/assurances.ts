import { gql } from '@apollo/client';

export const GET_ASSURANCES = gql`
  query GetAssurances($clientId: ID) {
    assurances(clientId: $clientId) {
      id type prime statut dateDebut dateFin
      client { id nom prenom agence { nom } }
    }
  }
`;

export const GET_ASSURANCE = gql`
  query GetAssurance($id: ID!) {
    assurance(id: $id) {
      id type prime statut dateDebut dateFin
      client { id nom prenom agence { id nom } }
    }
  }
`;

export const CREATE_ASSURANCE = gql`
  mutation CreateAssurance($input: AssuranceInput!) {
    createAssurance(input: $input) { id type prime statut }
  }
`;

export const UPDATE_ASSURANCE = gql`
  mutation UpdateAssurance($id: ID!, $input: AssuranceInput!) {
    updateAssurance(id: $id, input: $input) { id type prime statut }
  }
`;

export const DELETE_ASSURANCE = gql`
  mutation DeleteAssurance($id: ID!) {
    deleteAssurance(id: $id) { id }
  }
`;
