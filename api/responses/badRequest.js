/**
 * 400 (Bad Request) Handler
 *
 * Usage:
 * return res.badRequest();
 * return res.badRequest('message', err);
 */

module.exports = function badRequest(message = '', error = {}) {
  // Get access to `req`, `res`, & `sails`
  const req = this.req;
  const res = this.res;
  const sails = req._sails;

  // Set status code
  res.status(400);

  sails.log.verbose('Sending 400 ("Bad Request") response: \n', message, error);

  let repsonseData;
  if (sails.config.environment !== 'production') {
    repsonseData = {
      debug: {message, error},
    };
  }

  return res.jsonx(repsonseData);
};
