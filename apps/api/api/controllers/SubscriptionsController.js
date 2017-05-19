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
  *     summary: Creates a new subscription
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
  *           $ref: "#/definitions/SubscriptionCreateUpdatePayload"
  *     responses:
  *       201:
  *        description: Created
  *        schema:
  *          $ref: "#/definitions/SubscriptionResponseOk"
  *       422:
  *         description: Validation error
  *         schema:
  *           $ref: "#/definitions/ValidationError"
  *       500:
  *         description: Server error
  * definitions:
  *   SubscriptionCreateUpdatePayload:
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
  */
  create(req, res) {
    const subscriptionData = _.merge({}, req.body, {user: req.userId});
    Subscriptions.create(subscriptionData).then((item) => {
      return res.created({item});
    }).catch((err) => {
      if (err.Errors) {
         return res.validationError('validation failed', err.Errors);
      } else {
         return res.serverError('Subscription create error', err);
      }
    });
  },

  /**
  * @swagger
  * /subscriptions:
  *   get:
  *     summary: Returns subscriptions list
  *     tags: [Subscriptions]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *       - $ref: "#/parameters/page"
  *       - $ref: "#/parameters/perPage"
  *       - $ref: "#/parameters/sortBy"
  *     responses:
  *       200:
  *        description: Ok
  *        schema:
  *          $ref: "#/definitions/GetSubscriptionListResponseOk"
  *       500:
  *         description: Server error
  * definitions:
  *   GetSubscriptionListResponseOk:
  *     type: object
  *     properties:
  *       items:
  *         type: array
  *         items:
  *           $ref: "#/definitions/SerializedSubscription"
  */
  find(req, res) {
    const page = +req.param('page', 1);
		const perPage = +req.param('perPage', 50);
    const sortBy = req.param('sortBy', 'createdAt:DESC');
    const [sortByField, sortByDirection] = sortBy.split(':');
    Subscriptions.pagify('items', {
      findQuery: {user: req.userId},
      sort: [`${sortByField || 'createdAt'} ${sortByDirection || 'DESC'}`],
      page,
      perPage,
    }).then((data) => {
      res.ok(data);
    }).catch((err) => {
      res.serverError('Subscriptions find error', err);
    });
  },

  /**
  * @swagger
  * /subscriptions/:id:
  *   get:
  *     summary: Returns a subscription by id
  *     tags: [Subscriptions]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *       - $ref: "#/parameters/id"
  *     responses:
  *       200:
  *        description: Ok
  *        schema:
  *          $ref: "#/definitions/SubscriptionResponseOk"
  *       500:
  *         description: Server error
  * definitions:
  *   SubscriptionResponseOk:
  *     required:
  *      - item
  *     properties:
  *       item:
  *         type: object
  *         $ref: "#/definitions/SerializedSubscription"
  */
  findOne(req, res) {
    const subscriptionId = req.param('id');
    Subscriptions.findOne({id: subscriptionId, user: req.userId}).then((item = {}) => {
      res.ok({item});
    }).catch((err) => {
      return res.serverError('Subscription findOne error', err);
    });
  },

  /**
  * @swagger
  * /subscriptions/:id:
  *   put:
  *     summary: Updates (patches) a subscription
  *     description: This endpoint works as PATCH, i.e updates only those fields which are presented in the request payload
  *     tags: [Subscriptions]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *       - $ref: "#/parameters/id"
  *       - name: payload
  *         description: Endpoint's payload.
  *         in: body
  *         required: true
  *         schema:
  *           $ref: "#/definitions/SubscriptionCreateUpdatePayload"
  *     responses:
  *       200:
  *        description: Ok
  *        schema:
  *          $ref: "#/definitions/SubscriptionResponseOk"
  *       400:
  *         description: Bad request
  *       404:
  *         description: Subscription not found
  *       500:
  *         description: Server error
  * definitions:
  *   SubscriptionResponseOk:
  *     required:
  *      - item
  *     properties:
  *       item:
  *         type: object
  *         $ref: "#/definitions/SerializedSubscription"
  */
  update(req, res) {
    const subscriptionId = req.param('id');
    if (!_.isPlainObject(req.body)) {
      return res.badRequest('Payload must be a plain object');
    }

    Subscriptions.update({id: subscriptionId, user: req.userId}, _.omit(req.body, 'user')).then(([item]) => {
      if (!item) {
        return res.notFound(`subscription ${subscriptionId} not found`);
      }
      return res.ok({item: item || {}});
    }).catch((err) => {
      if (err.Errors) {
         return res.validationError('validation failed', err.Errors);
      }
      return res.serverError('Subscription update error', err);
    });
  },

  /**
  * @swagger
  * /subscriptions/:id:
  *   delete:
  *     summary: Removes a subscription
  *     tags: [Subscriptions]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *       - $ref: "#/parameters/id"
  *     responses:
  *       204:
  *        description: Removed successfully
  *       404:
  *         description: Subscription not found
  *       500:
  *         description: Server error
  */
  destroy(req, res) {
    const subscriptionId = req.param('id');
    const searchQuery = {id: subscriptionId, user: req.userId};
    Subscriptions.findOne(searchQuery).then((item) => {
      if (item) {
        return Subscriptions.destroy(searchQuery).then(() => {
          res.noContent();
        });
      }
      return res.notFound(`subscription ${subscriptionId} not found`);
    }).catch((err) => {
      return res.serverError('Subscription destroy error', err);
    });
  },
};
