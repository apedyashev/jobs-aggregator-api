/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 * return res.forbidden('a message', err);
 *
 * e.g.:
 * ```
 * return res.forbidden('Access denied.');
 * ```
 */

module.exports = function forbidden(message = '', error = {}) {
  // Get access to `req`, `res`, & `sails`
  const req = this.req;
  const res = this.res;
  const sails = req._sails;

  // Set status code
  res.status(403);

  sails.log.verbose('Sending 403 ("Forbidden") response: \n', message, error);

  let repsonseData;
  if (sails.config.environment !== 'production') {
    repsonseData = {
      debug: {message, error},
    };
  }

  return res.jsonx(repsonseData);
};
