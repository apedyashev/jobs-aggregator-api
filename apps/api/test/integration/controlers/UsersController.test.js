const request = require('supertest');
const assert = require('chai').assert;
const {seedSubscription} = require('seeders');

describe('UsersController', () => {
  describe('GET /users/profile', () => {
    let authHeader = null;
    let defaultUser = null;
    let seededSubscriptions = null;
    before(() => {
      defaultUser = sails.config.seeds.users[0];

      const loginAndSeed = () => {
        return request(sails.hooks.http.app)
          .post('/auth/login')
          .send({email: defaultUser.email, password: defaultUser.password})
          .expect(200)
          .then((res) => {
            assert.isString(res.body.token, 'token is set');
            authHeader = `Bearer ${res.body.token}`;
          }).then(() => {
            return Promise.all([
              seedSubscription({authHeader}),
              seedSubscription({authHeader}),
              seedSubscription({authHeader}),
            ]).then((subscriptions) => {
              seededSubscriptions = subscriptions;
            });
          });
      };
      return Promise.all([
        Subscriptions.destroy(),
        loginAndSeed(),
      ]);
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

          assert.sameDeepMembers(res.body.item.subscriptions, seededSubscriptions,
            'response contains populated subscriptions');
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
