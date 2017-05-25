/**
 * isAdmin
 *
 * @description :: Policy to check if user has admin role
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */

module.exports = function(req, res, next) {
  Users.findOne({id: req.userId}).then((user) => {
    if (user && user.roles && user.roles.indexOf('admin') >= 0) {
      next();
    } else {
      res.forbidden();
    }
  }).catch((err) => {
    next(err);
  });
};
