module.exports = {
  seeds: {
    users: [
      {
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@example.com',
        password: '123456',
        confirmPassword: '123456',
      },
    ],
  },

  connections: {
    testDb: {
      adapter: 'sails-memory',
    },
  },
};
