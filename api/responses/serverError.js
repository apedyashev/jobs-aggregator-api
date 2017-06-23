/**
 * 500 (Server Error) Response
 *
 * Usage:
 * return res.serverError();
 * return res.serverError('a message', err);
 *
 * NOTE:
 * If something throws in a policy or controller, or an internal
 * error is encountered, Sails will call `res.serverError()`
 * automatically.
 */

module.exports = function serverError(message = '', error = {}) {
  // Get access to `req`, `res`, & `sails`
  const req = this.req;
  const res = this.res;
  const sails = req._sails;

  // Set status code
  res.status(500);

  // Log error to console
  sails.log.error('Sending 500 ("Server Error") response: \n', message, error);

  let repsonseData;
  if (sails.config.environment !== 'production') {
    repsonseData = {
      debug: {message, error},
    };
  }

  return res.jsonx(repsonseData);
};
