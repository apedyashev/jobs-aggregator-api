/**
 * SubscriptionsController
 *
 * @description :: Server-side logic for managing Subscriptions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 /**
  * @swagger
  * tags:
  *   name: Subscriptions
  *   description: Subscriptions operations
  */
module.exports = {
  /**
  * @swagger
  * /subscriptions:
  *   post:
  *     description: Creates a new user
  *     tags: [Subscriptions]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *       - name: payload
  *         description: Endpoint's payload.
  *         in: body
  *         required: true
  *         schema:
  *           $ref: "#/definitions/SubscriptionCreatePayload"
  *     responses:
  *       201:
  *        description: Created
  *       422:
  *         description: Validation error
  *         schema:
  *           $ref: "#/definitions/ValidationError"
  *       500:
  *         description: Server error
  * definitions:
  *   SubscriptionCreatePayload:
  *     type: object
  *     required:
  *      - title
  *     properties:
  *       title:
  *         type: string
  *       keywords:
  *         type: array
  *         items:
  *           - type: string
  *       cities:
  *         type: array
  *         items:
  *           - type: string
  *       user:
  *         type: integer
  */
  create(req, res) {
    const {userId} = req.tokenPayload;
    const subscriptionData = _.merge({}, req.body, {user: userId});
    Subscriptions.create(subscriptionData).then((item) => {
      return res.created({item});
    }).catch((err) => {
      if (err.Errors) {
         return res.validationError('validation failed', err.Errors);
      } else {
         return res.serverError('validation failed', err);
      }
    });
  },
};
