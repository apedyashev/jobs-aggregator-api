module.exports = {
  seeds: {
    users: [
      {
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
