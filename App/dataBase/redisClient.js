const redis = require('redis');

// START REDIS CLIENT connection  - Manage connection  error case.
const client = redis.createClient({
  retry_strategy: function (options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      return new Error(
        'REDIS CLIENT ERROR - The server refused the connection'
      );
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      return new Error('REDIS CLIENT ERROR - Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  },
});
// GENRIC KEY PREFIX
const GENERIC_PREFIX = 'GENDATA';

/**
 * @module redisClient This provide a tiny redis client for CRUD operations.
 */
const redisCli = {
  /**
   * @function set Set a new pair (key, value) in redis store with expiration time
   * @param {Number} seconds expiration timer duration in seconds
   * @param {String} value Target value
   * @param {String} key Target key, Key must be unique
   * @param {String} prefix Prefix key (default 'DATA')
   * @returns {bool} True if new pair is stored, false otherwise
   */
  set: (seconds, value, key, prefix = GENERIC_PREFIX) => {
    return new Promise((resolve, reject) => {
      redisCli
        .has(key, prefix)
        .then((has) => {
          has
            ? client.setex(
                `${prefix}#${key}`,
                seconds,
                value,
                (error, state) => {
                  if (error) {
                    reject(error);
                  }
                  resolve(state === 1); // If set resolve then state === 1
                }
              )
            : resolve(false);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  /**
   * @function has  Testing if a pair (key, value) exist in redis store by target Key
   * @param {String} key Target key in store
   * @param {String} prefix Prefix key (default 'DATA')
   * @returns {bool} True if pair exist in store, false otherwise
   */
  has: (key, prefix = GENERIC_PREFIX) =>
    new Promise((resolve, reject) => {
      client.exists(`${prefix}#${key}`, (error, state) => {
        if (error) {
          reject(error);
        }
        resolve(state === 1); // If exist then state === 1
      });
    }),

  /**
   * @function get Get a value from pair (key, value) in redis store by target key
   * @param {String} key Target key in store
   * @param {String} prefix Prefix key (default 'DATA')
   * @returns {string} Target value if key exist in store, undefine otherwise
   */
  get: (key, prefix = GENERIC_PREFIX) =>
    new Promise((resolve, reject) => {
      redisCli
        .has(key, prefix)
        .then((has) => {
          has
            ? client.get(`${prefix}#${key}`, (error, value) => {
                if (error) {
                  reject(error);
                }
                resolve(value); // Return value
              })
            : resolve(undefined);
        })
        .catch((error) => {
          reject(error);
        });
    }),

  /**
   * @function delete Delete a pair (key, value) in redis store by key
   * @param {String} key Target key in store
   * @param {String} prefix Prefix key (default 'DATA')
   * @returns {bool} True if pair deleted in store, false otherwise
   */
  delete: (key, prefix = GENERIC_PREFIX) =>
    new Promise((resolve, reject) => {
      redisCli
        .has(key, prefix)
        .then((has) => {
          has
            ? client.del(`${prefix}#${key}`, (error, state) => {
                if (error) {
                  reject(error);
                }
                resolve(state === 1); // If selete resolve then state === 1
              })
            : resolve(false);
        })
        .catch((error) => {
          reject(error);
        });
    }),

  /**
   *  @function close Close client connection  to redis database
   */
  close: () => {
    client.end(true);
  },
};

module.exports = redisCli;
