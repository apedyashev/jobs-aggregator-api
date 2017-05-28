/**
 * 204 (No Content) Handler
 *
 * Usage:
 * return res.noContent();
 *
 */

module.exports = function noContent() {
  // Get access to `req`, `res`, & `sails`
  const req = this.req;
  const res = this.res;
  const sails = req._sails;

  // Set status code
  res.status(204);

  sails.log.silly('Sending 204 ("No Content") response');

  return res.jsonx();
};
