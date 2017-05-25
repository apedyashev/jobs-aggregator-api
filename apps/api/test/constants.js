const apiPrefix = '';
module.exports = {
  endpoints: {
    users: (id) => id ? `${apiPrefix}/user/${id}` : `${apiPrefix}/users`,
    usersProfile: `${apiPrefix}/users/profile`,

    auth: `${apiPrefix}/auth`,
    login: `${apiPrefix}/auth/login`,
    register: `${apiPrefix}/auth/register`,

    subscriptions: (id) => id ? `${apiPrefix}/subscriptions/${id}` : `${apiPrefix}/subscriptions`,
    subscriptionJobs: (id) => `${apiPrefix}/subscriptions/${id}/jobs`,

    jobs: `${apiPrefix}/jobs`,

    statistics: `${apiPrefix}/statistics`,
    statisticsCities: `${apiPrefix}/statistics/cities`,
    statisticsAvailabilities: `${apiPrefix}/statistics/availabilities`,
  },
};
