/**
 * 422 (Unprocessable Entity) Handler
 *
 * Usage:
 * return res.validationError();
 * return res.validationError(err);
 *
 */

module.exports = function validationError(message = '', validationErrors = {}) {
  // Get access to `req`, `res`, & `sails`
  const req = this.req;
  const res = this.res;
  const sails = req._sails;

  // Set status code
  res.status(422);

  sails.log.verbose('Sending 422 ("Unprocessable Entity/Validation Error") response: \n', message, validationErrors);

  return res.jsonx({
    message,
    validationErrors
  });
};
