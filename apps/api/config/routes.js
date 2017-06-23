/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  // '/': {
  //   view: 'homepage'
  // }

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/
  'POST /auth/login': 'AuthController.login',
  'POST /auth/register': 'AuthController.register',
  'DELETE /auth': 'AuthController.logout',

  'GET /users': 'UsersController.index',
  'GET /users/profile': 'UsersController.profile',
  'PUT /users/profile': 'UsersController.updateProfile',

  'GET /jobs': 'JobsController.index',

  'GET /subscriptions/:id/jobs': 'SubscriptionsController.getBySubscription',
  'POST /subscriptions': 'SubscriptionsController.create',
  'GET /subscriptions': 'SubscriptionsController.find',
  'GET /subscriptions/:id': 'SubscriptionsController.findOne',
  'PUT /subscriptions/:id': 'SubscriptionsController.update',
  'DELETE /subscriptions/:id': 'SubscriptionsController.destroy',

  'GET /statistics': 'StatisticsController.index',
  'GET /statistics/cities': 'StatisticsController.cities',
  'GET /statistics/availabilities': 'StatisticsController.availabilities',

  'GET /swagger/docs/api.json': (req, res) => {
    const swaggerJSDoc = require('swagger-jsdoc');

    const options = {
      swaggerDefinition: {
        info: {
          title: 'Jobs Aggregator API', // Title (required)
          version: '1.0.0', // Version (required)
        },
      },
      apis: ['./api/**/*.js', './api/**/*.jsdoc'], // Path to the API docs
    };

    // Initialize swagger-jsdoc -> returns validated swagger spec in json format
    const swaggerSpec = swaggerJSDoc(options);
    res.json(200, swaggerSpec);
  },

};
