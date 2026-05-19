import { gql } from '@apollo/client';

export const GET_AGENCES = gql`
  query GetAgences {
    agences { id nom ville }
  }
`;
