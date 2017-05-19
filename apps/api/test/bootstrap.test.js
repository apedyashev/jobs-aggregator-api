const sails = require('sails');
const chai = require('chai');
const request = require('supertest');
chai.use(require('chai-properties'));

before(function(done) {
  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(25000);

  sails.lift({
    models: {
      connection: 'testDb',
      migrate: 'drop',
    },
  }, function(err) {
    if (err) {
      return done(err);
    }
    // here you can load fixtures, etc.

    const [defaultUser] = sails.config.seeds.users;
    request(sails.hooks.http.app)
      .post('/auth')
      .send({email: defaultUser.email, password: defaultUser.password})
      .expect(200)
      .then((res) => {
        chai.assert.isString(res.body.token, 'token is set');
        chai.assert.isObject(res.body.user, 'user is set');
        global.authHeader = `Bearer ${res.body.token}`;
        global.loggedUser = res.body.user;

        return done(err);
      });
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});
