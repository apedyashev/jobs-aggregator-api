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
  *        description: Ok
  *        schema:
  *          $ref: "#/definitions/JobsListResponseOk"
  *
  * definitions:
  *   JobsListResponseOk:
  *     type: object
  *     properties:
  *       items:
  *         type: array
  *         items:
  *           $ref: "#/definitions/SerializedJob"
  *       meta:
  *         type: object
  *         schema:
  *           $ref: "#/definitions/MetaDataObject"
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
      res.serverError('get jobs list error', err);
    });
  },
};
