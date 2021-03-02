const { Pool } = require('pg');
// Obtain new postgresql pool connection 
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * @module pgClient This module provide client for postgresql database
 */
module.exports = {
  /**
   * @function query Performe query to postgresql with pg client
   * @param  {...any} params query parameters
   * @return {Promise} https://node-postgres.com/features/pooling
   */
  query(...params) {
    return pool.query(...params);
  },
  /**
   * @function close This close Postgresql clien connection 
   * @returns {Promise} https://node-postgres.com/api/client
   */
  close(){
    return pool.end();
  }
};
