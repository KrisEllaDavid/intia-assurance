import { gql } from '@apollo/client';

export const GET_EMPLOYES = gql`
  query GetEmployes {
    employes { id nom prenom email role agence { id nom } }
  }
`;

export const CREATE_EMPLOYE = gql`
  mutation CreateEmploye($input: EmployeInput!) {
    createEmploye(input: $input) { id nom prenom email role agence { nom } }
  }
`;

export const DELETE_EMPLOYE = gql`
  mutation DeleteEmploye($id: ID!) {
    deleteEmploye(id: $id) { id }
  }
`;
