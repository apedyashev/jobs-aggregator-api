/**
 * StatisticsController
 *
 * @description :: Server-side logic for managing statistics
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 /**
  * @swagger
  * tags:
  *   name: Statistics
  *   description: Statistics operations
  */
module.exports = {
  /**
  * @swagger
  * /statistics:
  *   get:
  *     summary: Returns statistics with both cities and availabilities arrays
  *     tags: [Statistics]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *     responses:
  *       200:
  *        description: Ok
  *        schema:
  *          $ref: "#/definitions/FullStatisticsResponse"
  *       500:
  *         description: Server error
  * definitions:
  *   FullStatisticsResponse:
  *     type: object
  *     properties:
  *       cities:
  *         type: array
  *         items:
  *           $ref: "#/definitions/StatisticsItem"
  *       availabilities:
  *         type: object
  *         schema:
  *           $ref: "#/definitions/StatisticsItem"
  *   StatisticsItem:
  *     type: object
  *     properties:
  *       name:
  *         type: string
  *       count:
  *         type: number
  */
  index(req, res) {
    this._getStats().then((results) => {
      res.ok(results);
    }).catch((err) => {
      res.serverError(err);
    });
  },

  /**
  * @swagger
  * /statistics/cities:
  *   get:
  *     summary: Returns statistics with only cities array
  *     tags: [Statistics]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *     responses:
  *       200:
  *        description: Ok
  *        schema:
  *          $ref: "#/definitions/CitiestatisticsResponse"
  *       500:
  *         description: Server error
  * definitions:
  *   CitiestatisticsResponse:
  *     type: object
  *     properties:
  *       cities:
  *         type: array
  *         items:
  *           $ref: "#/definitions/StatisticsItem"
  */
  cities(req, res) {
    this._getStats(['city']).then((results) => {
      res.ok(results);
    }).catch((err) => {
      res.serverError(err);
    });
  },

  /**
  * @swagger
  * /statistics/availabilities:
  *   get:
  *     summary: Returns statistics with only availabilities array
  *     tags: [Statistics]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *     responses:
  *       200:
  *        description: Ok
  *        schema:
  *          $ref: "#/definitions/AvailabilitiestatisticsResponse"
  *       500:
  *         description: Server error
  * definitions:
  *   AvailabilitiestatisticsResponse:
  *     type: object
  *     properties:
  *       availabilities:
  *         type: array
  *         items:
  *           $ref: "#/definitions/StatisticsItem"
  */
  availabilities(req, res) {
    this._getStats(['availability']).then((results) => {
      res.ok(results);
    }).catch((err) => {
      res.serverError(err);
    });
  },

  _getStats(statsFor = ['city', 'availability']) {
    const paramToDataKeyMap = {city: 'cities', availability: 'availabilities'};
    return new Promise((resolve, reject) => {
      async.map(statsFor, (paramName, done) => {
        const firstGroup = {
          _id: {},
          count: {
            $sum: 1,
          },
        };
        const secondGroup = {
          _id: null,
        };
        firstGroup._id[paramName] = {$ifNull: ['$' + paramName, 'N/A']};
        secondGroup[paramName] = {
          $addToSet: {
            name: '$_id.' + paramName,
            count: '$count',
          },
        };

        Jobs.native((err, collection) => {
          collection.aggregate([
            {$group: firstGroup},
            {$group: secondGroup},
          ], (err, results) => {
            if (err) {
              done(err);
            } else {
              const statsData = results[0] || {};
              delete statsData._id;
              done(null, statsData);
            }
          });
        });
      }, (err, results) => {
        if (err) {
          reject(err);
        } else {
          const statsData = {};
          results.forEach((dbResults) => {
            statsFor.forEach((paramName) => {
              const dataKeyName = paramToDataKeyMap[paramName];
              if (dbResults[paramName]) {
                statsData[dataKeyName] = dbResults[paramName];
              }
            });
          });
          resolve(statsData);
        }
      });
    });
  },
};
