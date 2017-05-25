/* global authHeader, loggedUser, loggedAdmin, loggedAdminAuth */
const request = require('supertest');
const assert = require('chai').assert;
const {seedSubscription, seedRandomUsers} = require('seeders');
const mocks = require('mocks');

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


  describe('PUT /users/profile', () => {
    let userToBeUpdated = null;
    let authHeaderForUpdatedUser = null;
    before(() => {
      const password = '123456';
      return Users.create({
        firstName: 'oldFirstName',
        lastName: 'oldLastName',
        email: `old-email@example.com`,
        password,
        confirmPassword: password,
        roles: ['login'],
      }).then((user) => {
        return request(sails.hooks.http.app)
          .post('/auth/login')
          .send({email: user.email, password})
          .expect(200)
          .then((res) => {
            authHeaderForUpdatedUser = `Bearer ${res.body.token}`;
            userToBeUpdated = res.body.user;
          });
      });
    });

    it('should return 401 status code if auth token is incorrect', () => {
      return request(sails.hooks.http.app)
        .put('/users/profile')
        .set('Authorization', 'fake token')
        .expect(401);
    });

    it('should return 422 status code if firstName is empty', () => {
      return request(sails.hooks.http.app)
        .put('/users/profile')
        .set('Authorization', authHeaderForUpdatedUser)
        .send({firstName: ''})
        .expect(422)
        .then((res) => {
          const failedFields = _.keys(res.body.validationErrors);
          assert.sameMembers(failedFields, ['firstName'], 'all expected fields failed');
          assert.notProperty(res.body, 'item', 'item is not set');

          const failedFirstNameRules = _.pluck(res.body.validationErrors.firstName, 'rule');
          assert.sameMembers(failedFirstNameRules, ['required'], 'require rule is presented for title');
        });
    });

    it('should return 200 status code if payload is valid', () => {
      const newPassword = 'updatedpassword';
      const newUserData = {
        firstName: 'DefaultUpdated',
        lastName: 'LastNameUpdated',
        email: 'new-email@example.com',
        roles: ['login', 'admin'],
        password: newPassword,
        confirmPassword: newPassword,
      };
      function checkNewPassword() {
        return request(sails.hooks.http.app)
          .post('/auth/login')
          .send({email: userToBeUpdated.email, password: newPassword})
          .then((res) => {
            assert.equal(res.statusCode, 200, 'login with updated password works');
          });
      }
      return request(sails.hooks.http.app)
        .put('/users/profile')
        .set('Authorization', authHeaderForUpdatedUser)
        .send(newUserData)
        .expect(200)
        .then((res) => {
          assert.property(res.body, 'item', 'item not set');
          assert.equal(res.body.item.firstName, newUserData.firstName, 'firstName was updated');
          assert.equal(res.body.item.lastName, newUserData.lastName, 'lastName was updated');
          assert.equal(res.body.item.email, userToBeUpdated.email, 'email was NOT updated');
          assert.sameMembers(res.body.item.roles, userToBeUpdated.roles, 'roles was NOT updated');

          // check if password has been updated
          return checkNewPassword();
        });
    });
  });


  describe('GET /users', () => {
    it('should return 403 status code if auth token belongs to non-admin user', () => {
      return request(sails.hooks.http.app)
        .get('/users')
        .set('Authorization', authHeader)
        .expect(403);
    });

    describe('allows getting list of users for adminstrators and', () => {
      let seededUsers = null;
      before(() => {
        return Users.destroy({
          $and: [
            {id: {'!': loggedUser.id}},
            {id: {'!': loggedAdmin.id}},
          ],
        })
        .then(() => seedRandomUsers(10))
        .then((users) => {
          seededUsers = users;
        });
      });

      it('should return users list', () => {
        return request(sails.hooks.http.app)
          .get('/users')
          .set('Authorization', loggedAdminAuth)
          .expect(200)
          .then((res) => {
            assert.isArray(res.body.items, 'response contains items array');
            assert.isObject(res.body.meta, 'response contains meta object');

            const expectedUsers = [loggedUser, loggedAdmin].concat(seededUsers);
            assert.sameDeepMembers(res.body.items, expectedUsers, 'response contains users');
          });
      });

      it('should return the list of the users sorted by `firstName`, DESC', () => {
        const expectedUsers = _.sortByOrder([loggedUser, loggedAdmin].concat(seededUsers), ['firstName'], ['desc']);
        const meta = mocks.meta({totalCount: expectedUsers.length});
        return request(sails.hooks.http.app)
          .get('/users?sortBy=firstName:desc')
          .set('Authorization', loggedAdminAuth)
          .expect(200)
          .expect({meta, items: expectedUsers});
      });

      it('should return the list of the users sorted by `firstName`, ASC', () => {
        const expectedUsers = _.sortByOrder([loggedUser, loggedAdmin].concat(seededUsers), ['firstName'], ['asc']);
        const meta = mocks.meta({totalCount: expectedUsers.length});
        return request(sails.hooks.http.app)
          .get('/users?sortBy=firstName:asc')
          .set('Authorization', loggedAdminAuth)
          .expect(200)
          .expect({meta, items: expectedUsers});
      });

      it('should return first 5 users sorted by `firstName`, ASC if page=1, perPage=5', () => {
        const allUsers = [loggedUser, loggedAdmin].concat(seededUsers);
        const expectedUsers = _(allUsers)
          .sortByOrder(['firstName'], ['asc'])
          .slice(0, 5)
          .value();
        const meta = mocks.meta({
          totalCount: allUsers.length,
          nextPage: 2,
          perPage: 5,
          totalPages: Math.ceil(allUsers.length / 5),
        });
        return request(sails.hooks.http.app)
          .get('/users?sortBy=firstName:asc&page=1&perPage=5')
          .set('Authorization', loggedAdminAuth)
          .expect(200)
          .expect({meta, items: expectedUsers});
      });

      it('should return 2nd set of users sorted by `firstName`, ASC if page=2, perPage=3', () => {
        const allUsers = [loggedUser, loggedAdmin].concat(seededUsers);
        const expectedUsers = _(allUsers)
          .sortByOrder(['firstName'], ['asc'])
          .slice(3, 6)
          .value();
        const meta = mocks.meta({
          totalCount: allUsers.length,
          prevPage: 1,
          nextPage: 3,
          currentPage: 2,
          perPage: 3,
          totalPages: Math.ceil(allUsers.length / 3),
        });
        return request(sails.hooks.http.app)
          .get('/users?sortBy=firstName:asc&page=2&perPage=3')
          .set('Authorization', loggedAdminAuth)
          .expect(200)
          .expect({meta, items: expectedUsers});
      });
    });
  });
});
