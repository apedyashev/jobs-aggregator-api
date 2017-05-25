const request = require('supertest');
const {endpoints} = require('constants.js');

module.exports = function seedSubscription({authHeader, data}) {
  const newSubscription = data || {
    title: 'subscription' + _.padLeft(_.uniqueId(), 8, '0'),
    keywords: [_.uniqueId('keyword'), _.uniqueId('keyword')],
    cities: [_.uniqueId('city'), _.uniqueId('city')],
  };
  if (_.isArray(newSubscription)) {
    const promises = newSubscription.map((subscription) => {
      return request(sails.hooks.http.app)
        .post(endpoints.subscriptions())
        .set('Authorization', authHeader)
        .send(subscription)
        .expect(201)
        .then((res) => res.body.item);
    });
    return Promise.all(promises);
  } else {
    return request(sails.hooks.http.app)
      .post(endpoints.subscriptions())
      .set('Authorization', authHeader)
      .send(newSubscription)
      .expect(201)
      .then((res) => res.body.item);
  }
};
