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
};
