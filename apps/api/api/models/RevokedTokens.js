/**
 * RevokedTokens.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection: 'dockerRedis',
  attributes: {
    token: {
      type: 'string',
    },

    user: {
      model: 'users',
    },
  },
};
