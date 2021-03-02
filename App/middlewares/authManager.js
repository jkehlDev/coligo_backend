const jwt = require('jsonwebtoken');
const tokenDuration = parseInt(process.env.TOKEN_DURATION, 10) || 1000;
const userOnlineDuration =
  parseInt(process.env.USER_ONLINE_DURATION, 10) || 86400;
const redisClient = require('../dataBase/redisClient');
const TOKEN_REDIS_PREFIX = 'TOKENBLKLST';
const AUTH_REDIS_PREFIX = 'USERONLINE';

/**
 * @module manageAuthentification this manage user authentification into application
 */
const manageAuthentification = {
  /**
   * @function verifyAuthentification Verify user authentification based on verifying JWT
   * @param {Express.Request} request
   * @param {Express.Response} response
   * @param {Function} next
   */
  verifyAuthentification: (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      response
        .status(401)
        .json({ error: 'Authorization header not provided.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    try {
      redisClient
        .has(token, TOKEN_REDIS_PREFIX) // CHECK IF TOKEN IS BLACK LISTED
        .then((result) => {
          if (!result) {
            const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET); // IF Not black listed process check validity
            response.locals.userId = decodedToken.id; // SAVE IN LOCALS USER ID
            redisClient // ADD USED TOKEN INTO BLACK LIST FOR HIS LIFE DURATION
              .set(tokenDuration, 'token', token, TOKEN_REDIS_PREFIX)
              .then((_) => {})
              .catch((error) => {
                throw error;
              })
              .finally(() => {
                next();
              });
          } else {
            throw { name: 'TokenExpiredError' }; // IF black listed token throw Expired exception
          }
        })
        .catch((error) => {
          throw error;
        });
    } catch (error) {
      if (
        error.name == 'JsonWebTokenError' ||
        error.name == 'TokenExpiredError' ||
        error.name == 'NotBeforeError'
      ) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }
      next(error);
      return;
    }
  },

  /**
   * @function refreshAuthentification Generate new token for authentified and online user
   * @param {Express.Request} request
   * @param {Express.Response} response
   * @param {Function} next
   */
  refreshAuthentification: (_, response, next) => {
    // Check if user is authentified
    try {
      if (response.locals.userId) {
        redisClient
          .has(response.locals.userId, USER_ONLINE) // If user authentified, Check if user is online
          .then((response) => {
            if (response) {
              response.locals.token = jwt.sign(
                { id: userId },
                process.env.TOKEN_SECRET,
                {
                  expiresIn: tokenDuration,
                }
              ); // In case of user online, set a new jwt
            }
          })
          .catch((error) => {
            throw error;
          });
      }
    } catch (error) {
      next(error);
      return;
    }
    next();
  },

  /**
   * @function setUserOnline Set user online state
   * @param {Express.Request} request
   * @param {Express.Response} response
   * @param {Function} next
   */
  setUserOnLine: (_, response, next) => {
    const userId = response.locals.userId;
    const setCache = (userId) => {
      return redisClient.set(userOnlineDuration, userId, userId, AUTH_REDIS_PREFIX); // ADD NEW ENTRY
    };
    const removeCache = (userId) => {
      return redisClient.delete(userId, AUTH_REDIS_PREFIX); // REMOVE EXISTING ENTRY
    };
    try {
      redisClient
        .has(userId, AUTH_REDIS_PREFIX) // Check if user is already online state
        .then((response) => {
          if (response) {
            return removeCache(userId).then(() => setCache(userId)); // If user is already online refresh timed entry
          }
          return setCache(userId); // If user is not already online set a new timed entry
        })
        .catch((error) => {
          throw error;
        });
    } catch (error) {
      next(error);
      return;
    }
    next();
  },

  /**
   * @function setUserOnline Set user offLine state, remove entry in cached user state
   * @param {Express.Request} request
   * @param {Express.Response} response
   * @param {Function} next
   */
  setUserOffLine: (_, response, next) => {
    try {
      redisClient.delete(response.locals.userId, AUTH_REDIS_PREFIX).catch((error) => {
        throw error;
      });
    } catch (error) {
      next(error);
      return;
    }
    next();
  },
};

module.exports = manageAuthentification;
