/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 *
 */

module.exports = function sendOK(data, options) {
  // Get access to `req`, `res`, & `sails`
  const req = this.req;
  const res = this.res;
  const sails = req._sails;

  sails.log.silly('Sending 200 ("OK") response');

  // Set status code
  res.status(200);

  return res.jsonx(data);
};
