const request = require('supertest');
const assert = require('chai').assert;

describe('SubscriptionsController', () => {
  describe('POST /subscriptions', () => {
    let authHeader = null;
    let loggedUser = null;
    before(() => {
      const [defaultUser] = sails.config.seeds.users;
      return request(sails.hooks.http.app)
        .post('/auth')
        .send({email: defaultUser.email, password: defaultUser.password})
        .expect(200)
        .then((res) => {
          assert.isString(res.body.token, 'token is set');
          assert.isObject(res.body.user, 'user is set');
          authHeader = `Bearer ${res.body.token}`;
          loggedUser = res.body.user;
        });
    });

    it('should return 422 and validatio errors if payload is empty', () => {
      return request(sails.hooks.http.app)
        .post('/subscriptions')
        .set('Authorization', authHeader)
        .send({})
        .expect(422)
        .then((res) => {
          assert.notProperty(res.body, 'item', 'item is not set');
          assert.isArray(res.body.validationErrors.title, 'response contains validation errors array for title');
          const failedTitleRules = _.pluck(res.body.validationErrors.title, 'rule');
          assert.sameMembers(failedTitleRules, ['required'], 'require rule is presented for title');
        });
    });

    it('should return 201 and created subscription if payload is valid', () => {
      const newSubscription = {title: 'subscr1', keywords: ['sky', 'blue'], cities: ['victoria', 'male']};
      return request(sails.hooks.http.app)
        .post('/subscriptions')
        .set('Authorization', authHeader)
        .send(newSubscription)
        .expect(201)
        .then((res) => {
          assert.isObject(res.body.item, 'response contains item');
          assert.equal(res.body.item.user, loggedUser.id, 'returned subscription belongs to logged user');
          assert.haveProperties(res.body.item, newSubscription, 'response contains created subscription');
        });
    });
  });
});
