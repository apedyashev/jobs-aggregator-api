const request = require('supertest');

module.exports = function seedSubscription({authHeader}) {
  const newSubscription = {
    title: 'subscription' + _.padLeft(_.uniqueId(), 8, '0'),
    keywords: [_.uniqueId('keyword'), _.uniqueId('keyword')],
    cities: [_.uniqueId('city'), _.uniqueId('city')],
  };
  return request(sails.hooks.http.app)
    .post('/subscriptions')
    .set('Authorization', authHeader)
    .send(newSubscription)
    .expect(201)
    .then((res) => res.body.item);
}
