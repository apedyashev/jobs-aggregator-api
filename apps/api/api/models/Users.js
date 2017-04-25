/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

 // We don't want to store password with out encryption
 const bcrypt = require('bcrypt');

 module.exports = {
   schema: true,

   attributes: {
     email: {
       type: 'email',
       required: 'true',
       unique: true,
     },

     encryptedPassword: {
       type: 'string',
     },
     // We don't wan't to send back encrypted password either
     toJSON() {
       const obj = this.toObject();
       delete obj.encryptedPassword;
       return obj;
     },
   },
   // Here we encrypt password before creating a User
   beforeCreate(values, next) {
     bcrypt.genSalt(10, (err, salt) => {
       if(err) return next(err);

       bcrypt.hash(values.password, salt, (err, hash) => {
         if(err) return next(err);
         values.encryptedPassword = hash;
         return next();
       });
     });
   },

   comparePassword(password, user, cb) {
     bcrypt.compare(password, user.encryptedPassword, (err, match) => {
       if(err) return cb(err);

       if(match) {
         return cb(null, true);
       } else {
         return cb(err);
       }
     });
   },
 };
