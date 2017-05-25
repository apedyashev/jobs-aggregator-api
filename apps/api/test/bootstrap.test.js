const sails = require('sails');
const chai = require('chai');
chai.use(require('chai-properties'));
const {loginDefaultUser, seedAndLoginAdmin} = require('seeders');

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
    Promise.all([
      loginDefaultUser(defaultUser),
      seedAndLoginAdmin(),
    ]).then(() => {
      done();
    }).catch((err) => {
      done(err);
    });
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});
