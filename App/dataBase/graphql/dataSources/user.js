const { DataSource } = require('apollo-datasource');
const bcrypt = require('bcrypt');

class User extends DataSource {
  constructor() {
    super();
  }
  initialize(config) {
    this.context = config.context;
    this.client = config.context.sqlClient;
  }

  async findUserById(userId) {
    const preparedStatement = `
      SELECT * 
      FROM USERAUTH
      INNER JOIN USERINFO ON USERAUTH.id_auth = USERINFO.id_info
      WHERE 
        USERAUTH.id_auth = $1
    `;
    let result = [];
    try {
      result = await this.client.query(preparedStatement, [userId]);
    } catch (error) {
      throw error;
    }
    return result.length > 0 ? Array.from(result).shift() : undefined;
  }

  async updateUser(userId, pseudo, email, description) {
    const preparedStatement = `
      WITH user_auth AS (
        UPDATE USERAUTH
        SET
          USERAUTH.email = $3
        WHERE 
          USERAUTH.id_auth = $1
        RETURNING *
      )
      UPDATE USERINFO
      SET 
        USERINFO.pseudo = $2
        USERINFO.description = $4
      FROM user_auth
      WHERE 
        USERINFO.id_user = user_auth.id_auth
      RETURNING *
    `;
    let result = [];
    try {
      result = await this.client.query(preparedStatement, [
        userId,
        pseudo,
        email,
        description,
      ]);
    } catch (error) {
      throw error;
    }
    return result.length > 0;
  }

  async updateUserPassword(userId, email, oldPassword, newPassword) {
    const user = this.findUserById(userId);
    const comparedPassword = bcrypt.compareSync(oldPassword, user.password);
    if (!comparedPassword || user.email !== email) {
      throw new Error('OPERATION NOT ALLOWED');
    }

    const preparedStatement = `
      UPDATE USERAUTH
      SET
        USERAUTH.password = $2
      WHERE 
        USERAUTH.id_auth = $1
      RETURNING *
    `;
    let result = [];
    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newPassword, salt);
      result = await this.client.query(preparedStatement, [userId, hash]);
    } catch (error) {
      throw error;
    }
    return result.length > 0;
  }

  async insertUser(email, password, pseudo, description) {
    const preparedStatementAuth = `
      INSERT INTO USERAUTH (email, password)
      VALUE ($1, $2)
      RETURNING id_auth
    `;
    const preparedStatementInfo = `
      INSERT INTO USERINFO (pseudo, description, id_user)
      VALUE ($1, $2, $3)
      RETURNING *
    `;
    let result = [];
    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      result = await this.client.query(preparedStatementAuth, [email, hash]);
      if (result.length === 0) {
        throw new Error('error happened during creating user');
      }
      const id_auth = Array.from(result).shift().id_auth;
      result = await this.client.query(preparedStatementInfo, [
        pseudo,
        description,
        id_auth,
      ]);
    } catch (error) {
      throw error;
    }
    return result.length > 0;
  }

  async deleteUser(userId, email, password) {
    const user = this.findUserById(userId);
    const comparedPassword = bcrypt.compareSync(password, user.password);
    if (!comparedPassword || user.email !== email) {
      throw new Error('OPERATION NOT ALLOWED');
    }

    const preparedStatement = `
      WITH user_auth AS (
        DELETE FROM USERAUTH
        WHERE 
          USERAUTH.id_auth = $1
        RETURNING *
      )
      DELETE FROM USERINFO
      USING user_auth
      WHERE 
        USERINFO.id_user = user_auth.id_auth
      RETURNING *
    `;

    let result = [];
    try {
      result = await this.client.query(preparedStatement, [userId]);
    } catch (error) {
      throw error;
    }
    return result.length > 0;
  }
}
module.exports = User;
