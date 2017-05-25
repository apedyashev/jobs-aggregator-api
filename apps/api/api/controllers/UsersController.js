/* global Users */
/**
* UsersController
*
* @description :: Server-side logic for managing users
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

/**
* @swagger
* tags:
*   name: Users
*   description: Users operations
*/
module.exports = {
  /**
  * @swagger
  * /users:
  *   get:
  *     summary: Returs userlst
  *     description: Available only for users with admin role
  *     tags: [Users]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *     responses:
  *       200:
  *        description: OK
  *        schema:
  *          $ref: "#/definitions/UsersListResponseOk"
  *       403:
  *         description: Admin role is required for this endpoint
  *       500:
  *         description: Server error
  * definitions:
  *   UsersListResponseOk:
  *     type: object
  *     properties:
  *       items:
  *         type: array
  *         items:
  *           $ref: "#/definitions/SerializedUser"
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
    return Users.pagify('items', {
      sort: [`${sortByField || 'createdAt'} ${sortByDirection || 'DESC'}`],
      page,
      perPage,
    }).then((data) => {
      res.ok(data);
    }).catch((err) => {
      res.serverError('get users list', err);
    });
  },

  update(req, res) {
  // omit roles array, default role will be assigned by the model
  //  const userData = _.omit(req.body, 'roles');
  res.notFound();
  },

  /**
  * @swagger
  * /users/profile:
  *   get:
  *     summary: Returs user by auth token
  *     tags: [Users]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *     responses:
  *       200:
  *        description: OK
  *        schema:
  *          $ref: "#/definitions/UserResponseOk"
  *       404:
  *         description: user not found
  * definitions:
  *   UserResponseOk:
  *     required:
  *      - item
  *     properties:
  *       item:
  *         type: object
  *         $ref: "#/definitions/SerializedUser"
  */
  profile(req, res) {
    const {userId} = req.tokenPayload;
    Users.findOne({id: userId}).populate('subscriptions').then((item) => {
      item ? res.ok({item}) : res.notFound('user not found');
    }).catch((err) => {
      res.serverError(err);
    });
  },

  /**
  * @swagger
  * /users/profile:
  *   put:
  *     summary: Updates (patches) user data
  *     description: |
  *       This endpoint works as PATCH, i.e updates only those fields which are presented in the request payload
  *     tags: [Users]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *       - name: payload
  *         description: Endpoint's payload.
  *         in: body
  *         required: true
  *         schema:
  *           $ref: "#/definitions/UserUpdatePayload"
  *     responses:
  *       201:
  *        description: Created
  *        schema:
  *          $ref: "#/definitions/UserResponseOk"
  *       422:
  *         description: Validation error
  *         schema:
  *           $ref: "#/definitions/ValidationError"
  *       500:
  *         description: Server error
  * definitions:
  *   UserUpdatePayload:
  *     type: object
  *     properties:
  *       firstName:
  *         type: string
  *       lastName:
  *         type: string
  *       email:
  *         type: string
  *       password:
  *         type: string
  *       confirmPassword:
  *         type: string
  */
  updateProfile(req, res) {
    const {userId} = req.tokenPayload;
    const updateQuery = _.omit(req.body, 'roles', 'email', 'subscriptions');
    Users.update({id: userId}, updateQuery).then(([item]) => {
      if (!item) {
        return res.notFound(`user ${userId} not found`);
      }
      return res.ok({item: item || {}});
    }).catch((err) => {
      if (err.Errors) {
         return res.validationError('User update validation failed', err.Errors);
      }
      return res.serverError('User update error', err);
    });
  },
};
