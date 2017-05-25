const request = require('supertest');
const chai = require('chai');

module.exports = {
  seedAndLoginAdmin() {
    const data = {
      firstName: 'Admin',
      lastName: 'Test',
      email: 'test.admin@example.com',
      password: '123456',
      confirmPassword: '123456',
      roles: ['login', 'admin'],
    };
    return Users.create(data).then((user) => {
      return request(sails.hooks.http.app)
        .post('/auth/login')
        .send({email: data.email, password: data.password})
        .expect(200).then((res) => {
          global.loggedAdmin = res.body.user;
          global.loggedAdminAuth = `Bearer ${res.body.token}`;
        });
    });
  },

  loginDefaultUser(defaultUser) {
    return request(sails.hooks.http.app)
      .post('/auth/login')
      .send({email: defaultUser.email, password: defaultUser.password})
      .expect(200)
      .then((res) => {
        chai.assert.isString(res.body.token, 'token is set');
        chai.assert.isObject(res.body.user, 'user is set');
        global.authHeader = `Bearer ${res.body.token}`;
        global.loggedUser = res.body.user;
      });
  },

  seedRandomUsers(usersCount = 10) {
    const password = Math.random().toString(36).slice(2);
    const usersData = _.range(usersCount).map(() => ({
      firstName: 'firstName' + _.padLeft(_.uniqueId(), 8, '0'),
      lastName: 'lastName',
      email: `${_.uniqueId('random-email')}@example.com`,
      password,
      confirmPassword: password,
      roles: ['login'],
    }));
    return Users.create(usersData).then((users) => {
      return users.map((user) => _.omit(user.toJSON(), 'password'));
    });
  },
};
