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
  *         - firstName
  *         - lastName
  *       - properties:
  *          email:
  *            type: string
  *          firstName:
  *            type: string
  *          lastName:
  *            type: string
  *          subscriptions:
  *            type: array
  *            items:
  *              - $ref: '#/definitions/SerializedSubscription'
  *          roles:
  *            type: array
  */
 module.exports = {
   schema: true,

  types: {
    passwordConfirmed(confirmPassword) {
      return this.password ? (confirmPassword === this.password) : true;
    },
  },

  attributes: {
    firstName: {
      required: true,
    },
    lastName: {
      required: true,
    },
    email: {
      type: 'email',
      required: true,
      unique: true,
    },

    password: {
      required: true,
      minLength: 6,
    },

    // used only for validation
    confirmPassword: {
      passwordConfirmed: true,
    },

    subscriptions: {
      collection: 'subscriptions',
      via: 'user',
    },

    roles: {
      type: 'array',
      defaultsTo: ['login'],
    },

    // We don't wan't to send back encrypted password either
    toJSON() {
      const obj = this.toObject();
      //  delete obj.encryptedPassword;
      delete obj.password;
      return obj;
    },
  },

  _handlePasswordBeforeSave(values, next) {
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

  // Here we encrypt password before creating a User
  beforeCreate(values, next) {
    this._handlePasswordBeforeSave(values, next);
  },

  beforeUpdate(values, next) {
    this._handlePasswordBeforeSave(values, next);
  },

  comparePassword(password, user, cb) {
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
