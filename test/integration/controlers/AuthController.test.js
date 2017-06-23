const request = require('supertest');
const assert = require('chai').assert;
const {endpoints} = require('constants.js');

describe('AuthController', () => {
  describe('POST /auth/login', () => {
    it('should login the default user', (done) => {
      const [defaultUser] = sails.config.seeds.users;
      request(sails.hooks.http.app)
        .post(endpoints.login)
        .send({email: defaultUser.email, password: defaultUser.password})
        .expect(200)
        .expect((res) => {
          if(!res.body.user) throw new Error('Missing user key');
          if(res.body.user.email !== defaultUser.email) throw new Error('Email of returned user is invalid');
        })
        .end(done);
    });


    it('should return 401 Unautorized if email is empty', (done) => {
      const [defaultUser] = sails.config.seeds.users;
      request(sails.hooks.http.app)
        .post(endpoints.login)
        .send({email: '', password: defaultUser.password})
        .expect(401)
        .end(done);
    });

    it('should return 401 Unautorized if password is empty', (done) => {
      const [defaultUser] = sails.config.seeds.users;
      request(sails.hooks.http.app)
        .post(endpoints.login)
        .send({email: defaultUser.email, password: ''})
        .expect(401)
        .end(done);
    });

    it('should return 401 Unautorized if email is incorrect', (done) => {
      const [defaultUser] = sails.config.seeds.users;
      request(sails.hooks.http.app)
        .post(endpoints.login)
        .send({email: `fake-${defaultUser.email}`, password: defaultUser.password})
        .expect(401)
        .end(done);
    });

    it('should return 401 Unautorized if password is incorrect', (done) => {
      const [defaultUser] = sails.config.seeds.users;
      request(sails.hooks.http.app)
        .post(endpoints.login)
        .send({email: defaultUser.email, password: `fake-${defaultUser.password}`})
        .expect(401)
        .end(done);
    });
  });


  describe('POST /auth/register', () => {
    it('should return 422 and valudation errors if fields are not set', () => {
      return request(sails.hooks.http.app)
        .post(endpoints.register)
        .send({})
        .expect(422)
        .then((res) => {
          assert.isObject(res.body.validationErrors, 'response contains validationErrors object');

          // firstName validation
          assert.isArray(res.body.validationErrors.firstName, 'response contains validation errors array for firstName');
          const failedFirstNameRules = _.pluck(res.body.validationErrors.firstName, 'rule');
          assert.sameMembers(failedFirstNameRules, ['required'], 'require rule is presented for firstName');

          // lastName validation
          assert.isArray(res.body.validationErrors.lastName, 'response contains validation errors array for lastName');
          const failedLastNameRules = _.pluck(res.body.validationErrors.lastName, 'rule');
          assert.sameMembers(failedLastNameRules, ['required'], 'require rule is presented for lastName');

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
        .post(endpoints.register)
        .send(_.merge(newUser, {confirmPassword: 'wrong-password'}))
        .expect(422)
        .then((res) => {
          assert.notProperty(res.body.validationErrors, 'password', 'there is no error for password');
          const failedConfirmPasswordRules = _.pluck(res.body.validationErrors.confirmPassword, 'rule');
          assert.sameMembers(failedConfirmPasswordRules, ['passwordConfirmed'],
            'passwordConfirmed rule is presented for confirmPassword');
        });
    });

    it('should return 422 if email is not uninque', () => {
      const defaultUser = sails.config.seeds.users[0];
      const newUser = {
        firstName: 'Fname',
        lastName: 'Lname',
        email: defaultUser.email,
        password: '123456',
        confirmPassword: '123456',
      };

      return request(sails.hooks.http.app)
        .post(endpoints.register)
        .send(newUser)
        .expect(422)
        .then((res) => {
          const failedEmailRules = _.pluck(res.body.validationErrors.email, 'rule');
          assert.sameMembers(failedEmailRules, ['unique'],
            'unique rule is presented for email');
        });
    });

    it('should return 201 and created user if payload is valid', () => {
      const newUser = {firstName: 'Bilbo', lastName: 'Beggins', email: 'fake-email@example.com', password: '123456'};
      function checkCreatedUser() {
        return request(sails.hooks.http.app)
          .post(endpoints.login)
          .send(newUser)
          .expect(200);
      }
      return request(sails.hooks.http.app)
        .post(endpoints.register)
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


  describe('DELETE /auth', () => {
    let currentAuthHeader = null;
    function checkToken(expectedCode) {
      return request(sails.hooks.http.app)
        .get('/subscriptions')
        .set('Authorization', currentAuthHeader)
        .expect(expectedCode);
    }

    before(() => {
      const currentUser = {
        firstName: _.uniqueId('firstName'),
        lastName: _.uniqueId('lastName'),
        email: `${_.uniqueId('revoke-token')}@example.com`,
        password: '123456',
      };

      return request(sails.hooks.http.app)
        .post(endpoints.register)
        .send(_.merge(currentUser, {confirmPassword: '123456'}))
        .expect(201)
        .then((res) => {
          assert.isString(res.body.token, 'response contains token');
          currentAuthHeader = `Bearer ${res.body.token}`;
          // make sure that token is VALID
          return checkToken(200);
        });
    });

    // logout and make sure that token cannot be used any more
    it('should revoke token and return 204', () => {
      return request(sails.hooks.http.app)
        .del(endpoints.auth)
        .set('Authorization', currentAuthHeader)
        .expect(204)
        .then((res) => {
          // make sure that token is INVALID
          return checkToken(401);
        });
    });

    it('should return 401 if auth header is empty', () => {
      return request(sails.hooks.http.app)
        .del(endpoints.auth)
        .set('Authorization', '')
        .expect(401);
    });
  });
});
