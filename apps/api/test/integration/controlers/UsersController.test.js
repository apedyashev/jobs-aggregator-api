const request = require('supertest');
const assert = require('chai').assert;

describe('UsersController', () => {
  describe('POST /users', () => {
    it('should return 422 and valudation errors if email and password are not set', () => {
      return request(sails.hooks.http.app)
        .post('/users')
        .send({})
        .expect(422)
        .then((res) => {
          assert.isObject(res.body.validationErrors, 'response contains validationErrors object');

          // email validation
          assert.isArray(res.body.validationErrors.email, 'response contains validation errors array for email');
          const failedEmailRules = _.pluck(res.body.validationErrors.email, 'rule');
          assert.sameMembers(failedEmailRules, ['email', 'required'], 'email and required rules are presented for email');

          // password validation
          assert.isArray(res.body.validationErrors.password, 'response contains validation errors array for password');
          const failedPasswordRules = _.pluck(res.body.validationErrors.password, 'rule');
          assert.sameMembers(failedPasswordRules, ['minLength', 'required'],
            'required rules are presented for password');
        });
    });

    it('should return 422 if password != confirmPassword', () => {
      const newUser = {email: 'fake-email-wrong-pass@example.com', password: '123456'};
      return request(sails.hooks.http.app)
        .post('/users')
        .send(_.merge(newUser, {confirmPassword: 'wrong-password'}))
        .expect(422)
        .then((res) => {
          assert.notProperty(res.body.validationErrors, 'password', 'there is no error for password');
          const failedConfirmPasswordRules = _.pluck(res.body.validationErrors.confirmPassword, 'rule');
          assert.sameMembers(failedConfirmPasswordRules, ['passwordConfirmed'],
            'passwordConfirmed rule is presented for confirmPassword');
        });
    });

    it('should return 201 and created users if payload is valid', () => {
      const newUser = {email: 'fake-email@example.com', password: '123456'};
      function checkCreatedUser() {
        return request(sails.hooks.http.app)
          .post('/auth')
          .send(newUser)
          .expect(200);
      }
      return request(sails.hooks.http.app)
        .post('/users')
        .send(_.merge(newUser, {confirmPassword: '123456'}))
        .expect(201)
        .then((res) => {
          assert.isString(res.body.token, 'response contains token');
          assert.isObject(res.body.user, 'response contains user');
          assert.equal(res.body.user.email, newUser.email, 'user has correct email');

          // make sure that created user can be logged in
          return checkCreatedUser();
        });
    });
  });


  describe('GET /users/profile', () => {
    let authHeader = null;
    let defaultUser = null;
    before(() => {
      // const [defaultUser] = sails.config.seeds.users;
      defaultUser = sails.config.seeds.users[0];
      return request(sails.hooks.http.app)
        .post('/auth')
        .send({email: defaultUser.email, password: defaultUser.password})
        .expect(200)
        .then((res) => {
          assert.isString(res.body.token, 'token is set');
          authHeader = `Bearer ${res.body.token}`;
        });
    });

    it('should return logged user by auth token', () => {
      return request(sails.hooks.http.app)
        .post('/users/profile')
        .set('Authorization', authHeader)
        .expect(200)
        .then((res) => {
          assert.isObject(res.body.item, 'item contains user data');
          assert.notProperty(res.body.item, 'encryptedPassword', 'doesnt expose encryptedPassword');
          assert.equal(res.body.item.email, defaultUser.email, 'emails match');
        });
    });

    it('should return 401 status code if auth token is incorrect', () => {
      return request(sails.hooks.http.app)
        .post('/users/profile')
        .set('Authorization', 'fake token')
        .expect(401);
    });
  });
});
