/**
 * Sails Seed Settings
 * (sails.config.seeds)
 *
 * Configuration for the data seeding in Sails.
 *
 * For more information on configuration, check out:
 * http://github.com/frostme/sails-seed
 */
module.exports.seeds = {
  users: [
    {
      firstName: 'Default',
      lastName: 'User',
      email: 'alex@example.com',
      password: '123456',
      confirmPassword: '123456',
    },
  ],
};
