/**
 * Subscriptions.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

 /**
  * @swagger
  * definitions:
  *   SerializedSubscription:
  *     allOf:
  *       - $ref: '#/definitions/BaseModel'
  *       - properties:
  *          title:
  *            type: string
  *          keywords:
  *            type: array
  *            items:
  *              - type: string
  *          cities:
  *            type: array
  *            items:
  *             - type: string
  *          user:
  *            type: integer
  */
module.exports = {
  attributes: {
    title: {
      type: 'string',
      defaultsTo: '',
      required: true,
    },
    keywords: {
      type: 'array',
      defaultsTo: [],
    },
    cities: {
      type: 'array',
      defaultsTo: [],
    },
    user: {
      model: 'users',
    },
  },
};
