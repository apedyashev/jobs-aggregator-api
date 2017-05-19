/* global Users */
/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 /**
  * @swagger
  * tags:
  *   name: Auth
  *   description: User authentication and authorization
  *
  * parameters:
  *   AuthorizationHeader:
  *     name: Authorization
  *     in: header
  *     description: Access token
  *     required: true
  *     type: string
  *     default: Bearer CODEHERE
  *
  */
 module.exports = {
   /**
   * @swagger
   * /auth:
   *   post:
   *     summary: Login to the application
   *     tags: [Auth]
   *     produces:
   *       - application/json
   *     parameters:
   *       - $ref: "#/parameters/AuthorizationHeader"
   *       - name: payload
   *         description: Endpoint's payload.
   *         in: body
   *         required: true
   *         schema:
   *           $ref: "#/definitions/AuthorizationRequestPayload"
   *     responses:
   *       200:
   *         description: OK
   *         schema:
   *           type: object
   *           $ref: '#/definitions/AuthorizationResponseOk'
   *
   * definitions:
   *   AuthorizationRequestPayload:
   *     type: object
   *     required:
   *      - email
   *      - password
   *     properties:
   *       email:
   *         type: string
   *       password:
   *         type: string
   *
   *   AuthorizationResponseOk:
   *     required:
   *      - user
   *      - token
   *     properties:
   *       user:
   *         type: object
   *         $ref: '#/definitions/SerializedUser'
   *       token:
   *         type: string
   */
   index(req, res) {
     const email = req.param('email');
     const password = req.param('password');

     if (!email || !password) {
       return res.unautorized('email and password required');
     }

     Users.findOne({email}, (err, user) => {
       if (!user) {
         return res.unautorized('invalid email or password');
       }

       Users.comparePassword(password, user, (err, valid) => {
         if (err) {
           return res.forbidden('forbidden');
         }

         if (!valid) {
           return res.unautorized('invalid email or password');
         } else {
           res.json({
             user,
             token: jwToken.issue({userId: user.id}),
           });
         }
       });
     });
   },
 };
