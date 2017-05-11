/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

 // We don't want to store password with out encryption
 const bcrypt = require('bcrypt');

 /**
  * @swagger
  * definitions:
  *   SerializedUser:
  *     allOf:
  *       - $ref: '#/definitions/BaseModel'
  *       - required:
  *         - email
  *       - properties:
  *          email:
  *            type: string
  */
 module.exports = {
   schema: true,

  types: {
    passwordConfirmed(confirmPassword) {
      return confirmPassword === this.password;
    },
  },

  attributes: {
    email: {
      type: 'email',
      required: 'true',
      unique: true,
    },

    password: {
      required: 'true',
      minLength: 6,
    },

    confirmPassword: {
      passwordConfirmed: 'true',
    },

    // We don't wan't to send back encrypted password either
    toJSON() {
      const obj = this.toObject();
      //  delete obj.encryptedPassword;
      delete obj.password;
      return obj;
    },
  },

  // Here we encrypt password before creating a User
  beforeCreate(values, next) {
    // confirmPassword is used only for validation, we don't want to save it to DB
    delete values.confirmPassword;

    if (!values.password) {
      // just call next withot errors - models validation will generate necessary errors
      return next();
    }

    bcrypt.genSalt(10, (err, salt) => {
      if(err) return next(err);

      bcrypt.hash(values.password, salt, (err, hash) => {
        if(err) return next(err);
        values.password = hash;
        return next();
      });
    });
  },

  comparePassword(password, user, cb) {
    //  bcrypt.compare(password, user.encryptedPassword, (err, match) => {
    bcrypt.compare(password, user.password, (err, match) => {
      if(err) return cb(err);

      if(match) {
        return cb(null, true);
      } else {
        return cb(err);
      }
    });
  },
 };
