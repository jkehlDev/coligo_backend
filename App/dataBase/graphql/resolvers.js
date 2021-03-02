const { Mutation } = require('../../../../projet-hub-back/app/resolver');

module.exports = {
  Query: {
    userAuth(_, args, context){},
    userInfo(_, args, context){},    
  },
  Mutation: {
    insertUser(_, args, context){},
    updateUser(_, args, context){},
    updateUserPassword(_, args, context){},
    deleteUser(_, args, context){},
  },
};
