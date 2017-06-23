/**
 * 404 (Not Found) Handler
 *
 * Usage:
 * return res.notFound();
 * return res.notFound('message', err);
 *
 * e.g.:
 * ```
 * return res.notFound();
 * ```
 *
 * NOTE:
 * If a request doesn't match any explicit routes (i.e. `config/routes.js`)
 * or route blueprints (i.e. "shadow routes", Sails will call `res.notFound()`
 * automatically.
 */

module.exports = function notFound(message = '', error = {}) {
  // Get access to `req`, `res`, & `sails`
  const req = this.req;
  const res = this.res;
  const sails = req._sails;

  // Set status code
  res.status(404);

  sails.log.verbose('Sending 404 ("Not Found") response: \n', message, error);

  let repsonseData;
  if (sails.config.environment !== 'production') {
    repsonseData = {
      debug: {message, error},
    };
  }

  return res.jsonx(repsonseData);
};
