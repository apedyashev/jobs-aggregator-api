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

module.exports = function unautorized(message, options) {
  // Get access to `req`, `res`, & `sails`
  const req = this.req;
  const res = this.res;
  const sails = req._sails;

  // Set status code
  res.status(401);

  sails.log.verbose('Sending 401 ("Unautorized") response: \n', message);

  // Only include errors in response if application environment
  // is not set to 'production'.  In production, we shouldn't
  // send back any identifying information about errors.
  if (sails.config.environment === 'production') {
    options = undefined;
  }

  if (req.wantsJSON || sails.config.hooks.views === false) {
    return res.jsonx({
      message,
      debugData: options
    });
  }
};
