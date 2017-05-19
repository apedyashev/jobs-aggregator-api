/**
 * JobsController
 *
 * @description :: Server-side logic for managing jobs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 /**
  * @swagger
  * tags:
  *   name: Jobs
  *   description: Jobs operations
  */
module.exports = {
  /**
  * @swagger
  * /jobs:
  *   get:
  *     summary: Lists jobs
  *     tags: [Jobs]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/page"
  *       - $ref: "#/parameters/perPage"
  *       - $ref: "#/parameters/sortBy"
  *     responses:
  *       200:
  *         description: Ok
  *
  */
  index(req, res) {
    const page = +req.param('page', 1);
		const perPage = +req.param('perPage', 50);
    const sortBy = req.param('sortBy', 'createdAt:DESC');
    const [sortByField, sortByDirection] = sortBy.split(':');
    Jobs.pagify('items', {
      sort: [`${sortByField || 'createdAt'} ${sortByDirection || 'DESC'}`],
      page,
      perPage,
    }).then((data) => {
      res.ok(data);
    }).catch((err) => {
      res.serverError(err);
    });
  },

  /**
  * @swagger
  * /subscriptions/:subscriptionId/jobs:
  *   get:
  *     summary: Lists jobs for specific subscription
  *     tags: [Jobs]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *       - $ref: "#/parameters/page"
  *       - $ref: "#/parameters/perPage"
  *       - $ref: "#/parameters/sortBy"
  *     responses:
  *       200:
  *         description: login
  *
  */
  getBySubscription(req, res) {
    // const query = {};
    // const subcriptionId = req.param('subscriptionId');
    // if (subcriptionId) {
    //
    // }
    req.ok();
  },
};
