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
   *   post:
   *     description: Creates a new user
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
   *           $ref: "#/definitions/UserCreatePayload"
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
   *   UserCreatePayload:
   *     type: object
   *     required:
   *      - email
   *      - password
   *      - confirmPassword
   *     properties:
   *       email:
   *         type: string
   *       password:
   *         type: string
   *       confirmPassword:
   *         type: string
   *
   */
   create(req, res) {
     Users.create(req.body).exec((err, user) => {
       if (err) {
         if (err.Errors) {
            return res.validationError('validation failed', err.Errors);
         } else {
            return res.serverError('validation failed', err);
         }
       }
       // If user created successfuly we return user and token as response
       if (user) {
         const token = jwToken.issue({userId: user.id});
         res.created({user, token});
       } else {
         // have no idea how this can happen but we should send a response if it did
         res.serverError('user was not created');
       }
     });
   },

  /**
  * @swagger
  * /users/profile:
  *   get:
  *     description: Returs user by auth token
  *     tags: [Users]
  *     produces:
  *       - application/json
  *     parameters:
  *       - $ref: "#/parameters/AuthorizationHeader"
  *     responses:
  *       200:
  *        description: OK
  *       404:
  *         description: user not found
  *
  */
  profile(req, res) {
    const {userId} = req.tokenPayload;
    Users.findOne({id: userId}).then((item) => {
      item ? res.ok({item}) : res.notFound('user not found');
    }).catch((err) => {
      res.serverError(err);
    });
  },
 };
