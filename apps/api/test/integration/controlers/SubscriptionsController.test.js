const request = require('supertest');
const assert = require('chai').assert;
const {seedSubscription} = require('seeders');
const mocks = require('mocks');

describe('SubscriptionsController', () => {
  describe('POST /subscriptions', () => {
    it('should return 422 and validation errors if payload is empty', () => {
      return request(sails.hooks.http.app)
        .post('/subscriptions')
        .set('Authorization', authHeader)
        .send({})
        .expect(422)
        .then((res) => {
          const failedFields = _.keys(res.body.validationErrors);
          assert.sameMembers(failedFields, ['title'], 'all expected fields failed');

          assert.notProperty(res.body, 'item', 'item is not set');
          assert.isArray(res.body.validationErrors.title, 'response contains validation errors array for title');
          const failedTitleRules = _.pluck(res.body.validationErrors.title, 'rule');
          assert.sameMembers(failedTitleRules, ['required'], 'require rule is presented for title');
        });
    });

    it('should return 201 and created subscription if only title  is set', () => {
      const newSubscription = {title: 'subscr123'};
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

    it('should return 401 if auth header is empty', () => {
      const newSubscription = {title: 'subscr1', keywords: ['sky', 'blue'], cities: ['victoria', 'male']};
      return request(sails.hooks.http.app)
        .post('/subscriptions')
        .set('Authorization', '')
        .send(newSubscription)
        .expect(401);
    });
  });


  describe('PUT /subscriptions/:id', () => {
    let createdSubscription = null;
    beforeEach(() => {
      return Subscriptions.destroy().then(() => {
        return seedSubscription({authHeader}).then((subscription) => {
          createdSubscription = subscription;
        });
      });
    });

    it('should return 422 and validation errors if fields are empty', () => {
      return request(sails.hooks.http.app)
        .put(`/subscriptions/${createdSubscription.id}`)
        .set('Authorization', authHeader)
        .send({title: '', keywords: null, cities: null})
        .expect(422)
        .then((res) => {
          const failedFields = _.keys(res.body.validationErrors);
          assert.sameMembers(failedFields, ['title'], 'all expected fields failed');

          assert.notProperty(res.body, 'item', 'item is not set');
          assert.isArray(res.body.validationErrors.title, 'response contains validation errors array for title');
          const failedTitleRules = _.pluck(res.body.validationErrors.title, 'rule');
          assert.sameMembers(failedTitleRules, ['required'], 'require rule is presented for title');
        });
    });

    it('should return 200 and unchanged object if request contains an empty object', () => {
      return request(sails.hooks.http.app)
        .put(`/subscriptions/${createdSubscription.id}`)
        .set('Authorization', authHeader)
        .send({})
        .expect(200)
        .then((res) => {
          assert.notProperty(res.body, 'validationErrors', 'response doesn`t contains validationErrors');
          assert.haveProperties(res.body.item, _.omit(createdSubscription, 'updatedAt'),
            'response contains unchanged subscription');
        });
    });

    it('should return 200 and updated subscription if only title  is set', () => {
      const newSubscription = {title: 'update subscr123'};
      return request(sails.hooks.http.app)
        .put(`/subscriptions/${createdSubscription.id}`)
        .set('Authorization', authHeader)
        .send(newSubscription)
        .expect(200)
        .then((res) => {
          assert.isObject(res.body.item, 'response contains item');
          assert.equal(res.body.item.user, loggedUser.id, 'returned subscription belongs to logged user');
          assert.haveProperties(res.body.item, newSubscription, 'response contains created subscription');
        });
    });

    it('should return 200 and updated subscription if payload is valid', () => {
      const newSubscription = {title: 'subscr1', keywords: ['sky', 'blue'], cities: ['victoria', 'male']};
      return request(sails.hooks.http.app)
        .put(`/subscriptions/${createdSubscription.id}`)
        .set('Authorization', authHeader)
        .send(newSubscription)
        .expect(200)
        .then((res) => {
          assert.isObject(res.body.item, 'response contains item');
          assert.equal(res.body.item.user, loggedUser.id, 'returned subscription belongs to logged user');
          assert.haveProperties(res.body.item, newSubscription, 'response contains created subscription');
        });
    });

    it('should not update user', () => {
      const newSubscription = {title: 'subscr1', user: 9999};
      return request(sails.hooks.http.app)
        .put(`/subscriptions/${createdSubscription.id}`)
        .set('Authorization', authHeader)
        .send(newSubscription)
        .expect(200)
        .then((res) => {
          assert.equal(res.body.item.user, loggedUser.id, 'returned subscription belongs to logged user');
        });
    });

    it('should return 404 if id is invalid', () => {
      const newSubscription = {title: 'subscr1'};
      return request(sails.hooks.http.app)
        .put(`/subscriptions/77787`)
        .set('Authorization', authHeader)
        .send(newSubscription)
        .expect(404);
    });

    it('should return 400 if payload is an array', () => {
      const newSubscription = {title: 'subscr1', keywords: ['sky', 'blue'], cities: ['victoria', 'male']};
      return request(sails.hooks.http.app)
        .put(`/subscriptions/${createdSubscription.id}`)
        .set('Authorization', authHeader)
        .send([newSubscription])
        .expect(400);
    });

    // it('should return 400 if payload is null', () => {
    //   return request(sails.hooks.http.app)
    //     .serialize((data) => data)
    //     .put(`/subscriptions/${createdSubscription.id}`)
    //     .set('Authorization', authHeader)
    //     .send(null)
    //     .expect(400);
    // });
    //
    // it('should return 400 if payload is a string', () => {
    //   return request(sails.hooks.http.app)
    //     .put(`/subscriptions/${createdSubscription.id}`)
    //     .set('Authorization', authHeader)
    //     .send('some string')
    //     .expect(400);
    // });

    it('should return 401 if auth header is empty', () => {
      const newSubscription = {title: 'subscr1', keywords: ['sky', 'blue'], cities: ['victoria', 'male']};
      return request(sails.hooks.http.app)
        .put(`/subscriptions/${createdSubscription.id}`)
        .set('Authorization', '')
        .send(newSubscription)
        .expect(401);
    });
  });


  describe('GET /subscriptions', () => {
    let subscriptions = [];
    before(() => {
      // remove all the subscriptions from DB because this test relies on the number of subscriptions in DB
      return Subscriptions.destroy().then(() => {
        const promises = [];
        for(let i = 0; i < 6; i++) {
          const promise = seedSubscription({authHeader}).then((subscription) => {
            subscriptions.push({title: subscription.title});
          });
          promises.push(promise);
        }
        return Promise.all(promises);
      });
    });

    it('should return 401 is auth header is not set', () => {
      return request(sails.hooks.http.app)
        .get('/subscriptions')
        .set('Authorization', '')
        .expect(401)
        .expect((res) => {
          assert.notProperty(res.body, 'items', 'there is no items property in the response');
        });
    });

    it('should return the list of the subscriptions sorted by `title`, DESC', () => {
      const meta = mocks.meta({totalCount: subscriptions.length});
      return request(sails.hooks.http.app)
        .get('/subscriptions?sortBy=title:desc')
        .set('Authorization', authHeader)
        .expect(200)
        .expect((res) => {
          // do not check job's id, createdAt etc. `title` checking is enought
          res.body.items = res.body.items.map((subscription) => ({title: subscription.title}));
        })
        .expect({meta, items: subscriptions.slice().reverse()});
    });

    it('should return the list ordered in DESC order if order direction is missed in the `sortBy` param', () => {
      const meta = mocks.meta({totalCount: subscriptions.length});
      return request(sails.hooks.http.app)
        .get('/subscriptions?sortBy=title')
        .set('Authorization', authHeader)
        .expect(200)
        .expect((res) => {
          // do not check subscription's id, createdAt etc. `title` checking is enought
          res.body.items = res.body.items.map((subscription) => ({title: subscription.title}));
        })
        .expect({meta, items: subscriptions.slice().reverse()});
    });

    it('should return the 2 first subscriptions when page is 1 and perPage is 2', () => {
      const meta = mocks.meta({
        totalCount: subscriptions.length,
        perPage: 2,
        totalPages: 3,
        nextPage: 2,
      });
      return request(sails.hooks.http.app)
        .get('/subscriptions?page=1&perPage=2&sortBy=title:asc')
        .set('Authorization', authHeader)
        .expect(200)
        .expect((res) => {
          // do not check subscription's id, createdAt etc. `title` checking is enought
          res.body.items = res.body.items.map((subscription) => ({title: subscription.title}));
        })
        .expect({meta, items: subscriptions.slice(0, 2)});
    });

    it('should return subscriptions at indeces 3-5 when page is 2 and perPage is 3', () => {
      const meta = mocks.meta({
        currentPage: 2,
        nextPage: null,
        prevPage: 1,
        totalPages: 2,
        totalCount: subscriptions.length,
        perPage: 3,
      });
      return request(sails.hooks.http.app)
        .get('/subscriptions?page=2&perPage=3&sortBy=title:asc')
        .set('Authorization', authHeader)
        .expect(200)
        .expect((res) => {
          // do not check job's id, createdAt etc. `title` checking is enought
          res.body.items = res.body.items.map((subscription) => ({title: subscription.title}));
        })
        .expect({meta, items: subscriptions.slice(3, 6)});
    });
  });


  describe('GET /subscriptions/:id', () => {
    let currentSubscription = null;
    before(() => {
      return seedSubscription({authHeader}).then((subscription) => {
        currentSubscription = subscription;
      });
    });

    it('should return 200 and seeded item by id', () => {
      return request(sails.hooks.http.app)
        .get(`/subscriptions/${currentSubscription.id}`)
        .set('Authorization', authHeader)
        .expect(200)
        .then((res) => {
          assert.isObject(res.body.item, 'response contains the item prop');
          assert.haveProperties(res.body.item, currentSubscription, 'response contains created subscription');
        });
    });

    it('should return 200 and empty object as the `item` if id is invalid', () => {
      return request(sails.hooks.http.app)
        .get('/subscriptions/invalid-id')
        .set('Authorization', authHeader)
        .expect(200)
        .then((res) => {
          assert.isObject(res.body.item, 'response contains the item prop');
          assert.isTrue(_.isPlainObject(res.body.item), 'item is a plain object');
          assert.isTrue(_.isEmpty(res.body.item), 'item is an empty object');
        });
    });

    it('should return 401 if auth header is empty', () => {
      return request(sails.hooks.http.app)
        .get(`/subscriptions/${currentSubscription.id}`)
        .set('Authorization', '')
        .expect(401);
    });
  });


  describe('DELETE /subscriptions/:id', () => {
    let currentSubscription = null;
    beforeEach(() => {
      return seedSubscription({authHeader}).then((subscription) => {
        currentSubscription = subscription;

        Subscriptions.findOne({id: currentSubscription.id}).then((item) => {
          assert.isObject(item, 'subscription is really created');
        });
      });
    });

    it('should return 204 and removes subscription from db if id is valid', () => {
      return request(sails.hooks.http.app)
        .del(`/subscriptions/${currentSubscription.id}`)
        .set('Authorization', authHeader)
        .expect(204).then(() => {
          Subscriptions.findOne({id: currentSubscription.id}).then((item) => {
            assert.isNotObject(item, 'subscription destroyed');
          });
        });
    });

    it('should return 404 if id is invalid', () => {
      return request(sails.hooks.http.app)
        .del(`/subscriptions/56988786`)
        .set('Authorization', authHeader)
        .expect(404);
    });

    it('should return 401 if auth header is empty', () => {
      return request(sails.hooks.http.app)
        .del(`/subscriptions/${currentSubscription.id}`)
        .set('Authorization', '')
        .expect(401);
    });
  });
});
