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
   * /auth/login:
   *   post:
   *     summary: Login to the application
   *     tags: [Auth]
   *     produces:
   *       - application/json
   *     parameters:
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
   login(req, res) {
     const email = req.param('email');
     const password = req.param('password');

     if (!email || !password) {
       return res.unautorized('email and password required');
     }

     Users.findOne({email}).populate('subscriptions').then((user) => {
       if (!user) {
         return res.unautorized('invalid email or password');
       }

       Users.comparePassword(password, user, (err, valid) => {
         if (err) {
           return res.forbidden('forbidden', err);
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
     }).catch((err) => {
       return res.serverError('Server error', err);
     });

    //  Users.findOne({email}, (err, user) => {
    //    if (!user) {
    //      return res.unautorized('invalid email or password');
    //    }
     //
    //    Users.comparePassword(password, user, (err, valid) => {
    //      console.log('err', err);
    //      if (err) {
    //        return res.forbidden('forbidden', err);
    //      }
     //
    //      if (!valid) {
    //        return res.unautorized('invalid email or password');
    //      } else {
    //        res.json({
    //          user,
    //          token: jwToken.issue({userId: user.id}),
    //        });
    //      }
    //    });
    //  });
   },

   /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Registers a new user
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
   *           $ref: "#/definitions/UserCreatePayload"
   *     responses:
   *       201:
   *        description: Created
   *        schema:
   *          $ref: "#/definitions/AuthorizationResponseOk"
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
   *      - firstName
   *      - lastName
   *      - email
   *      - password
   *      - confirmPassword
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
   register(req, res) {
     // omit roles array, default role will be assigned by the model
     const userData = _.omit(req.body, 'roles');
     Users.create(userData).exec((err, user) => {
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
   * /auth:
   *   delete:
   *     summary: Logs user out (invalidates token)
   *     tags: [Auth]
   *     produces:
   *       - application/json
   *     parameters:
   *       - $ref: "#/parameters/AuthorizationHeader"
   *     responses:
   *       204:
   *        description: Successful
   *       500:
   *         description: Server error
   */
   logout(req, res) {
     const {userId, token, tokenPayload: {exp}} = req;
     const expired = exp - parseInt(new Date().getTime() / 1000);
     RevokedTokens.create({token, user: userId}).then((createdItem) => {
       // set TTL/Expire for token because redis memory is very valuable
       RevokedTokens.native((err, connection) => {
         if (err) {
           return res.serverError('Set revoked token TTL error', err);
         }
         connection.expire(`waterline:revokedtokens:id:${createdItem.id}`, expired, (err, redisResponse) => {
           res.noContent();
         });
       });
     }).catch((err) => {
       return res.serverError('Logout error', err);
     });
   },
 };
