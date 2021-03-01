/**
 * @function enforceHttps Define callback Express middleware To enforce HTTPS connexion
 * @param {String} PORT_HTTP HTTP Server port configuration
 * @param {String} PORT_HTTPS HTTPS Server port configuration
 */
const enforceHttps = (PORT_HTTP, PORT_HTTPS) =>
  /**
   * callback Express middleware
   * @param {Request} request
   * @param {Response} response
   * @param {CallableFunction} next
   */
  (request, response, next) => {
    if (!request.secure) {
      return response
        .status(301)
        .redirect(
          "https://" +
            request.headers.host.replace(":" + PORT_HTTP, ":" + PORT_HTTPS) +
            "/"
        );
    }
    next();
  };

module.exports = enforceHttps;
