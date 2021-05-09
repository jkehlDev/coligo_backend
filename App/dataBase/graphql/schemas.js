const { gql } = require('apollo-server-express');
const schemas = gql`
  type UserAuth {
    id_auth: ID!
    created_at: String!
    updated_at: String!
    email: String!
    password: String!
  }

  type UserInfo {
    id_info: ID!
    created_at: String!
    updated_at: String!
    pseudo: String!
    email: String!
    description: String
    id_user: ID!
  }

  type UserMsg {
    id_msg: ID!
    created_at: String!
    updated_at: String!
    title: String!
    content: String!
    id_user_from: ID!
  }

  type Project {
    id_project: ID!
    created_at: String!
    updated_at: String!
    title: String!
    description: String!
    location: String!
    lat: Float!
    long: Float!
    state: String!
    id_author: ID!
    needs: [Need]
    followers: [UserInfo]
    distance: Float
  }

  type Need {
    id_need: ID!
    created_at: String!
    updated_at: String!
    title: String!
    description: String!
    state: String!
    id_project: ID!
  }

  type ProjectConnection {
    cursor: String!
    hasMore: Boolean!
    projects: [Project]!
  }

  type FollowedConnection {
    cursor: String!
    hasMore: Boolean!
    projects: [Project]!
  }

  type Query {
    project(id: ID!): Project
    projectsByLocation(
      lat: Float!
      long: Float!
      scope: Float!
      archived: Boolean
    ): ProjectConnection!
    followed(id: ID!): FollowedConnection!
    userAuth(id: ID!): UserAuth
    userInfo(id: ID!): UserInfo
    userMsg(id: ID!): UserMsg
  }

  type Mutation {
    insertUser(
      email: String!
      password: String!
      pseudo: String!
      description: String!
    ): UserInfo
    insertProject(
      title: String!
      description: String!
      location: String!
      lat: Float!
      long: Float!
      state: String!
      id_author: ID!
      needs: [Need]
    ): Project
    insertNeed(
      title: String!
      description: String!
      state: String!
      id_project: ID!
    ): Need
    insertUserMsg(
      id_user_to: ID!
      title: String!
      content: String!
      id_user_from: ID!
    ): UserMsg
    updateUser(
      id_auth: ID!
      pseudo: String!
      email: String!
      description: String!
    ): UserInfo
    updateUserPassword(
      id_auth: ID!
      email: String!
      oldPassword: String!
      newPassword: String!
    ): UserInfo
    updateProject(
      id_project: ID!
      title: String!
      description: String!
      location: String!
      lat: Float!
      long: Float!
      state: String!
      id_author: ID!
      needs: [Need]
    ): Project
    updateNeeds(
      id_need: ID!
      title: String!
      description: String!
      state: String!
      id_project: ID!
    ): Need
    deleteUser(id_auth: ID!, email: String!, password: String!): Boolean
    deleteProject(id_project: ID!): Boolean
    deleteNeeds(id_need: ID!): Boolean
    deleteUserMsg(id_msg: ID!): Boolean
  }
`;

module.exports = schemas;
