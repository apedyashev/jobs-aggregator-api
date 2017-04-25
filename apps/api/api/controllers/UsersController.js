/* global Users */
/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
   create(req, res) {
     if (req.body.password !== req.body.confirmPassword) {
       return res.json(401, {err: 'Password doesn\'t match, What a shame!'});
     }
     Users.create(req.body).exec((err, user) => {
       if (err) {
         return res.json(err.status, {error: err});
       }
       // If user created successfuly we return user and token as response
       if (user) {
         // NOTE: payload is { id: user.id}
         const token = jwToken.issue({id: user.id});
         res.json(200, {user, token});
       }
     });
   },
 };
