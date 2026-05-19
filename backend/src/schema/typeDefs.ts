export const typeDefs = `#graphql
  enum Statut { ACTIF  RESILIE }
  enum Role   { ADMIN  AGENT   }

  type Agence {
    id:       ID!
    nom:      String!
    ville:    String!
    clients:  [Client!]!
    employes: [Employe!]!
  }

  type Employe {
    id:      ID!
    nom:     String!
    prenom:  String!
    email:   String!
    role:    Role!
    agence:  Agence
  }

  type AuthEmployePayload {
    token:   String!
    employe: Employe!
  }

  type AuthClientPayload {
    token:  String!
    client: Client!
  }

  type Client {
    id:         ID!
    nom:        String!
    prenom:     String!
    email:      String!
    telephone:  String
    adresse:    String
    agence:     Agence!
    assurances: [Assurance!]!
    createdAt:  String!
    updatedAt:  String!
  }

  type Assurance {
    id:        ID!
    type:      String!
    prime:     Float!
    dateDebut: String!
    dateFin:   String!
    statut:    Statut!
    client:    Client!
    createdAt: String!
    updatedAt: String!
  }

  input EmployeInput {
    nom:        String!
    prenom:     String!
    email:      String!
    motDePasse: String!
    role:       Role!
    agenceId:   ID
  }

  input ClientInput {
    nom:        String!
    prenom:     String!
    email:      String!
    motDePasse: String
    telephone:  String
    adresse:    String
    agenceId:   ID!
  }

  input AssuranceInput {
    type:      String!
    prime:     Float!
    dateDebut: String!
    dateFin:   String!
    statut:    Statut
    clientId:  ID!
  }

  type Query {
    meEmploye:               Employe
    meClient:                Client
    employes:                [Employe!]!
    agences:                 [Agence!]!
    clients(agenceId: ID):   [Client!]!
    client(id: ID!):         Client
    assurances(clientId: ID):[Assurance!]!
    assurance(id: ID!):      Assurance
  }

  type Mutation {
    loginEmploye(email: String!, motDePasse: String!): AuthEmployePayload!
    loginClient(email: String!, motDePasse: String!):  AuthClientPayload!
    createEmploye(input: EmployeInput!):               Employe!
    deleteEmploye(id: ID!):                            Employe!

    createClient(input: ClientInput!):                 Client!
    updateClient(id: ID!, input: ClientInput!):        Client!
    deleteClient(id: ID!):                             Client!

    createAssurance(input: AssuranceInput!):           Assurance!
    updateAssurance(id: ID!, input: AssuranceInput!):  Assurance!
    deleteAssurance(id: ID!):                          Assurance!
  }
`;
