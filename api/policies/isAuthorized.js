/**
 * isAuthorized
 *
 * @description :: Policy to check if user is authorized with JSON web token
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */

module.exports = function(req, res, next) {
  let token;

  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      const scheme = parts[0];
      const credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.json(401, {err: 'Format is Authorization: Bearer [token]'});
    }
  } else if (req.param('token')) {
    token = req.param('token');
    // We delete the token from param to not mess with blueprints
    delete req.query.token;
  } else {
    return res.json(401, {err: 'No Authorization header was found'});
  }

  jwToken.verify(token, (err, tokenPayload) => {
    if (err) {
      return res.json(401, {err: 'Invalid Token!'});
    }

    RevokedTokens.findOne({token, user: tokenPayload.userId}).then((revokedTokenItem) => {
      if (revokedTokenItem) {
        // token has been revoked
        return res.json(401, {err: 'Invalid Token!'});
      } else {
        // token is still valid
        req.tokenPayload = tokenPayload; // This is the decrypted token or the payload you provided
        req.userId = tokenPayload.userId;
        req.token = token;
        next();
      }
    });
  });
};
