/* global Users */
/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 module.exports = {
   index(req, res) {
     const email = req.param('email');
     const password = req.param('password');

     if (!email || !password) {
       return res.unautorized({error: 'email and password required'});
     }

     Users.findOne({email}, (err, user) => {
       if (!user) {
         return res.unautorized({error: 'invalid email or password'});
       }

       Users.comparePassword(password, user, (err, valid) => {
         if (err) {
           return res.forbidden({error: 'forbidden'});
         }

         if (!valid) {
           return res.unautorized({error: 'invalid email or password'});
         } else {
           res.json({
             user,
             token: jwToken.issue({id: user.id}),
           });
         }
       });
     });
   },
 };
