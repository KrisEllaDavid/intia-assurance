import { gql } from '@apollo/client';

export const LOGIN_EMPLOYE = gql`
  mutation LoginEmploye($email: String!, $motDePasse: String!) {
    loginEmploye(email: $email, motDePasse: $motDePasse) {
      token
      employe { id nom prenom email role agence { id nom } }
    }
  }
`;

export const LOGIN_CLIENT = gql`
  mutation LoginClient($email: String!, $motDePasse: String!) {
    loginClient(email: $email, motDePasse: $motDePasse) {
      token
      client { id nom prenom email agenceId agence { id nom } }
    }
  }
`;
