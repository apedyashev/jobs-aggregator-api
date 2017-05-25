/* global authHeader, loggedUser */
const request = require('supertest');
const assert = require('chai').assert;
const faker = require('faker');
const _ = require('lodash');
const {seedSubscription} = require('seeders');
const mocks = require('mocks');
const {endpoints} = require('constants.js');

describe('SubscriptionsController', () => {
  describe('POST /subscriptions', () => {
    it('should return 422 and validation errors if payload is empty', () => {
      return request(sails.hooks.http.app)
        .post(endpoints.subscriptions())
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
        .post(endpoints.subscriptions())
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
        .post(endpoints.subscriptions())
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
        .post(endpoints.subscriptions())
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
        .put(endpoints.subscriptions(createdSubscription.id))
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
        .put(endpoints.subscriptions(createdSubscription.id))
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
        .put(endpoints.subscriptions(createdSubscription.id))
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
        .put(endpoints.subscriptions(createdSubscription.id))
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
        .put(endpoints.subscriptions(createdSubscription.id))
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
        .put(endpoints.subscriptions(77787))
        .set('Authorization', authHeader)
        .send(newSubscription)
        .expect(404);
    });

    it('should return 400 if payload is an array', () => {
      const newSubscription = {title: 'subscr1', keywords: ['sky', 'blue'], cities: ['victoria', 'male']};
      return request(sails.hooks.http.app)
        .put(endpoints.subscriptions(createdSubscription.id))
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
        .put(endpoints.subscriptions(createdSubscription.id))
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
        .get(endpoints.subscriptions())
        .set('Authorization', '')
        .expect(401)
        .expect((res) => {
          assert.notProperty(res.body, 'items', 'there is no items property in the response');
        });
    });

    it('should return the list of the subscriptions sorted by `title`, DESC', () => {
      const meta = mocks.meta({totalCount: subscriptions.length});
      return request(sails.hooks.http.app)
        .get(`${endpoints.subscriptions()}?sortBy=title:desc`)
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
        .get(`${endpoints.subscriptions()}?sortBy=title`)
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
        .get(`${endpoints.subscriptions()}?page=1&perPage=2&sortBy=title:asc`)
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
        .get(`${endpoints.subscriptions()}?page=2&perPage=3&sortBy=title:asc`)
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
        .get(endpoints.subscriptions(currentSubscription.id))
        .set('Authorization', authHeader)
        .expect(200)
        .then((res) => {
          assert.isObject(res.body.item, 'response contains the item prop');
          assert.haveProperties(res.body.item, currentSubscription, 'response contains created subscription');
        });
    });

    it('should return 200 and empty object as the `item` if id is invalid', () => {
      return request(sails.hooks.http.app)
        .get(endpoints.subscriptions('invalid-id'))
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
        .get(endpoints.subscriptions(currentSubscription.id))
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
        .del(endpoints.subscriptions(currentSubscription.id))
        .set('Authorization', authHeader)
        .expect(204).then(() => {
          Subscriptions.findOne({id: currentSubscription.id}).then((item) => {
            assert.isNotObject(item, 'subscription destroyed');
          });
        });
    });

    it('should return 404 if id is invalid', () => {
      return request(sails.hooks.http.app)
        .del(endpoints.subscriptions('56988786'))
        .set('Authorization', authHeader)
        .expect(404);
    });

    it('should return 401 if auth header is empty', () => {
      return request(sails.hooks.http.app)
        .del(endpoints.subscriptions(currentSubscription.id))
        .set('Authorization', '')
        .expect(401);
    });
  });

  describe('GET /subscriptions/:id/jobs', () => {
    const keywords = _.range(10).map((i) => `uniq-keyword-for-testing${i}`);
    const cities = _.range(10).map(() => faker.address.city());
    const jobs = [
      {title: faker.fake(`00 {{lorem.words}} ${keywords[0]} {{lorem.words}}`), city: cities[1]},
      {title: faker.fake(`01 {{lorem.words}} ${keywords[1]} {{lorem.words}}`), city: cities[0]},
      {title: faker.fake(`02 {{lorem.words}} ${keywords[2]} {{lorem.words}}`)},
      {title: faker.fake(`03 {{lorem.words}} ${keywords[3]} {{lorem.words}}`), city: cities[2]},
      {title: faker.fake(`04 {{lorem.words}} ${keywords[4]} {{lorem.words}}`)},
      {title: faker.fake(`05 {{lorem.words}} ${keywords[5]} {{lorem.words}}`), city: cities[3]},
      {title: faker.fake(`06 {{lorem.words}} ${keywords[3]} {{lorem.words}}`)},
      {title: faker.fake(`07 {{lorem.words}} ${keywords[5]} ${keywords[3]} ${keywords[1]} {{lorem.words}}`)},
      {title: faker.fake(`08 {{lorem.words}} ${keywords[6]} ${keywords[3]} {{lorem.words}}`)},
      {
        title: faker.fake(`09 {{lorem.words}}`),
        shortDescription: faker.fake(`{{lorem.words}} ${keywords[7]} {{lorem.words}}`),
      },
      {
        title: faker.fake(`10 {{lorem.words}} ${keywords[8]} {{lorem.words}}`),
        shortDescription: faker.fake(`{{lorem.words}} ${keywords[9]} {{lorem.words}}`),
      },
    ];
    let createdJobIds = [];
    before(() => {
      return Promise.all([Jobs.destroy(), Subscriptions.destroy()]).then(() => {
        return Jobs.create(jobs).then((createdJobs) => {
          createdJobIds = _.pluck(createdJobs, 'id');
        });
      });
    });

    it('should return jobs for subscription with single city', () => {
      const newSubscription = {title: 'by single city', cities: [cities[0]]};

      return seedSubscription({authHeader, data: newSubscription}).then((subscription) => {
        return request(sails.hooks.http.app)
          .get(endpoints.subscriptionJobs(subscription.id))
          .set('Authorization', authHeader)
          .expect(200)
          .then((res) => {
            assert.isArray(res.body.items, 'response contains items array');
            const jobIds = _.pluck(res.body.items, 'id');
            const expectedJobIds = [createdJobIds[1]];
            assert.sameMembers(jobIds, expectedJobIds, 'returns expected jobs');
          });
      });
    });

    it('should return jobs for subscription with 3 cities', () => {
      const newSubscription = {title: 'by cities', cities: [cities[1], cities[2], cities[3]]};

      return seedSubscription({authHeader, data: newSubscription}).then((subscription) => {
        return request(sails.hooks.http.app)
          .get(endpoints.subscriptionJobs(subscription.id))
          .set('Authorization', authHeader)
          .expect(200)
          .then((res) => {
            assert.isArray(res.body.items, 'response contains items array');
            const jobIds = _.pluck(res.body.items, 'id');
            const expectedJobIds = [createdJobIds[0], createdJobIds[3], createdJobIds[5]];
            assert.sameMembers(jobIds, expectedJobIds, 'returns expected jobs');
          });
      });
    });

    // BEGIN of pagination and sorting tests
    it('should return 1 job when page=1 and perPage=1', () => {
      const newSubscription = {title: 'by cities', cities: [cities[1], cities[2], cities[3]]};

      return seedSubscription({authHeader, data: newSubscription}).then((subscription) => {
        return request(sails.hooks.http.app)
          .get(`${endpoints.subscriptionJobs(subscription.id)}?page=1&perPage=1&sortBy=title:ASC`)
          .set('Authorization', authHeader)
          .expect(200)
          .then((res) => {
            assert.isArray(res.body.items, 'response contains items array');
            const jobIds = _.pluck(res.body.items, 'id');
            // all job indexes for this subscription: 0, 3, 5
            const expectedJobIds = [createdJobIds[0]];
            assert.sameMembers(jobIds, expectedJobIds, 'returns expected jobs');

            // total 3 jobs are expecting for this subscription
            const meta = mocks.meta({totalCount: 3, totalPages: 3, perPage: 1, nextPage: 2});
            assert.haveProperties(res.body.meta, meta, 'meta is correct');
          });
      });
    });

    it('should return 2 jobs when page=1 and perPage=2', () => {
      const newSubscription = {title: 'by cities', cities: [cities[1], cities[2], cities[3]]};

      return seedSubscription({authHeader, data: newSubscription}).then((subscription) => {
        return request(sails.hooks.http.app)
          .get(`${endpoints.subscriptionJobs(subscription.id)}?page=1&perPage=2&sortBy=title:ASC`)
          .set('Authorization', authHeader)
          .expect(200)
          .then((res) => {
            assert.isArray(res.body.items, 'response contains items array');
            const jobIds = _.pluck(res.body.items, 'id');
            // all job indexes for this subscription: 0, 3, 5
            const expectedJobIds = [createdJobIds[0], createdJobIds[3]];
            assert.sameMembers(jobIds, expectedJobIds, 'returns expected jobs');

            // total 3 jobs are expecting for this subscription
            const meta = mocks.meta({totalCount: 3, totalPages: 2, perPage: 2, nextPage: 2});
            assert.haveProperties(res.body.meta, meta, 'meta is correct');
          });
      });
    });

    it('should return 2 jobs in sorted by id:DESC when page=1 and perPage=2', () => {
      const newSubscription = {title: 'by cities', cities: [cities[1], cities[2], cities[3]]};

      return seedSubscription({authHeader, data: newSubscription}).then((subscription) => {
        return request(sails.hooks.http.app)
          .get(`${endpoints.subscriptionJobs(subscription.id)}?page=1&perPage=2&sortBy=title:DESC`)
          .set('Authorization', authHeader)
          .expect(200)
          .then((res) => {
            assert.isArray(res.body.items, 'response contains items array');
            const jobIds = _.pluck(res.body.items, 'id');
            // all job indexes for this subscription: 0, 3, 5
            const expectedJobIds = [createdJobIds[5], createdJobIds[3]];
            assert.sameMembers(jobIds, expectedJobIds, 'returns expected jobs');

            // total 3 jobs are expecting for this subscription
            const meta = mocks.meta({totalCount: 3, totalPages: 2, perPage: 2, nextPage: 2});
            assert.haveProperties(res.body.meta, meta, 'meta is correct');
          });
      });
    });

    it('should return 1 job when page=2 and perPage=2', () => {
      const newSubscription = {title: 'by cities', cities: [cities[1], cities[2], cities[3]]};

      return seedSubscription({authHeader, data: newSubscription}).then((subscription) => {
        return request(sails.hooks.http.app)
          .get(`${endpoints.subscriptionJobs(subscription.id)}?page=2&perPage=2&sortBy=title:ASC`)
          .set('Authorization', authHeader)
          .expect(200)
          .then((res) => {
            assert.isArray(res.body.items, 'response contains items array');
            const jobIds = _.pluck(res.body.items, 'id');
            // all job indexes for this subscription: 0, 3, 5
            const expectedJobIds = [createdJobIds[5]];
            assert.sameMembers(jobIds, expectedJobIds, 'returns expected jobs');

            // total 3 jobs are expecting for this subscription
            const meta = mocks.meta({totalCount: 3, totalPages: 2, perPage: 2, nextPage: null, prevPage: 1, currentPage: 2});
            assert.haveProperties(res.body.meta, meta, 'meta is correct');
          });
      });
    });
    // END of pagination and sorting tests

    it('should return jobs for subscription with a keyword in the title', () => {
      const newSubscription = {title: 'by a keyword', keywords: [keywords[3]]};
      return seedSubscription({authHeader, data: newSubscription}).then((subscription) => {
        return request(sails.hooks.http.app)
          .get(endpoints.subscriptionJobs(subscription.id))
          .set('Authorization', authHeader)
          .expect(200)
          .then((res) => {
            assert.isArray(res.body.items, 'response contains items array');
            const jobIds = _.pluck(res.body.items, 'id');
            const expectedJobIds = [createdJobIds[3], createdJobIds[6], createdJobIds[7], createdJobIds[8]];
            assert.sameMembers(jobIds, expectedJobIds, 'returns expected jobs');
          });
      });
    });

    it('should return jobs for subscription with multiple keywords in the single title', () => {
      const newSubscription = {title: 'by a keyword', keywords: [keywords[3], keywords[1], keywords[5]]};

      return seedSubscription({authHeader, data: newSubscription}).then((subscription) => {
        return request(sails.hooks.http.app)
          .get(endpoints.subscriptionJobs(subscription.id))
          .set('Authorization', authHeader)
          .expect(200)
          .then((res) => {
            assert.isArray(res.body.items, 'response contains items array');
            const jobIds = _.pluck(res.body.items, 'id');
            const expectedJobIds = [createdJobIds[7]];
            assert.sameMembers(jobIds, expectedJobIds, 'returns expected jobs');
          });
      });
    });

    it('should return jobs for subscription with a keyword in the descriptions', () => {
      const newSubscription = {title: 'by a keyword in descr', keywords: [keywords[7]]};

      return seedSubscription({authHeader, data: newSubscription}).then((subscription) => {
        return request(sails.hooks.http.app)
          .get(endpoints.subscriptionJobs(subscription.id))
          .set('Authorization', authHeader)
          .expect(200)
          .then((res) => {
            assert.isArray(res.body.items, 'response contains items array');
            const jobIds = _.pluck(res.body.items, 'id');
            const expectedJobIds = [createdJobIds[9]];
            assert.sameMembers(jobIds, expectedJobIds, 'returns expected jobs');
          });
      });
    });

    it('should return jobs for subscription with keywords in both title and descriptions', () => {
      const newSubscription = {title: 'by a keyword in descr', keywords: [keywords[8], keywords[9]]};

      return seedSubscription({authHeader, data: newSubscription}).then((subscription) => {
        return request(sails.hooks.http.app)
          .get(endpoints.subscriptionJobs(subscription.id))
          .set('Authorization', authHeader)
          .expect(200)
          .then((res) => {
            assert.isArray(res.body.items, 'response contains items array');
            const jobIds = _.pluck(res.body.items, 'id');
            const expectedJobIds = [createdJobIds[10]];
            assert.sameMembers(jobIds, expectedJobIds, 'returns expected jobs');
          });
      });
    });

    it('should return 401 if auth header is empty', () => {
      return seedSubscription({authHeader}).then((subscription) => {
        return request(sails.hooks.http.app)
          .get(endpoints.subscriptionJobs(subscription.id))
          .set('Authorization', '')
          .expect(401);
      });
    });
  });
});
