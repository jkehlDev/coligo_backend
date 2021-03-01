const jwt = require('jsonwebtoken');
const tokenDuration = parseInt(process.env.TOKEN_DURATION, 10) || 1000;

const manageJWT = {
  /**
   * @function verify JWT Server Manager
   * @param {Express.Request} request
   * @param {Express.Response} response
   * @param {Function} next
   */
  verify: (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      response
        .status(401)
        .json({ error: 'Authorization header not provided.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
      response.locals.userId = decodedToken.id;
      next();
    } catch (err) {
      if (
        err.name == 'JsonWebTokenError' ||
        err.name == 'TokenExpiredError' ||
        err.name == 'NotBeforeError'
      ) {
        response.status(401).json({ error: 'Unauthorized' });
        return;
      }
      next(err);
    }
  },
  /**
   * @function genToken Generate new token for authentified user
   * @param {Express.Request} request
   * @param {Express.Response} response
   * @param {Function} next
   */
  genToken: (_, response, next) => {
    if (response.locals.userId) {
      response.locals.token = jwt.sign(
        { id: userId },
        process.env.TOKEN_SECRET,
        {
          expiresIn: tokenDuration,
        }
      );
    }
    next();
  },
};
module.exports = manageJWT;
