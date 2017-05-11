const sails = require('sails');

before(function(done) {
  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(20000);

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
    return done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});
