/**
 * 201 (CREATED) Response
 *
 * Usage:
 * return res.created();
 * return res.created(data);
 */

module.exports = function created(data) {
  // Get access to `req`, `res`, & `sails`
  const req = this.req;
  const res = this.res;
  const sails = req._sails;

  sails.log.silly('Sending 201 ("CREATED") response');

  // Set status code
  res.status(201);

  return res.jsonx(data);
};
