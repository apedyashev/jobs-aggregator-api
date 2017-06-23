/**
 * 401 (Unautorized) Handler
 *
 * Usage:
 * return res.unautorized();
 * return res.unautorized(err);
 *
 * e.g.:
 * ```
 * return res.unautorized('Access denied.');
 * ```
 */

module.exports = function unautorized(message = '', error = {}) {
  // Get access to `req`, `res`, & `sails`
  const req = this.req;
  const res = this.res;
  const sails = req._sails;

  // Set status code
  res.status(401);

  sails.log.verbose('Sending 401 ("Unautorized") response: \n', message, error);

  let repsonseData;
  if (sails.config.environment !== 'production') {
    repsonseData = {
      debug: {message, error},
    };
  }

  return res.jsonx(repsonseData);
};
