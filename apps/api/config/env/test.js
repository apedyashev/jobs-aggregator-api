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

    jobs: [
      {title: 'seeded-job1'},
      {title: 'seeded-job2'},
      {title: 'seeded-job3'},
      {title: 'seeded-job4'},
      {title: 'seeded-job5'},
      {title: 'seeded-job6'},
    ],
  },

  connections: {
    testDb: {
      adapter: 'sails-memory',
    },
  },
};
