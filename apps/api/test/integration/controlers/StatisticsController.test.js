/* global authHeader */
const request = require('supertest');
const assert = require('chai').assert;
const {endpoints} = require('constants.js');

describe('StatisticsController', () => {
  const expectedCities = [{name: 'city1', count: 2}, {name: 'city2', count: 2}, {name: 'city3', count: 1}];
  const expectedAvailabilities = [{name: '80%', count: 2}, {name: '60%', count: 1}, {name: '100%', count: 2}];
  before(() => {
    const jobs = [
      {title: 'job2', city: 'city2', availability: '80%'},
      {title: 'job3', city: 'city1', availability: '60%'},
      {title: 'job4', city: 'city3', availability: '100%'},
      {title: 'job4', city: 'city2', availability: '80%'},
      {title: 'job1', city: 'city1', availability: '100%'},
    ];

    return Promise.all([
      Jobs.destroy(),
      Jobs.create(jobs),
    ]);
  });

  describe('GET /statistics', () => {
    it('should return statistics with both cities and availabilities arrays', () => {
      return request(sails.hooks.http.app)
        .get(endpoints.statistics)
        .set('Authorization', authHeader)
        .expect(200)
        .then((res) => {
          assert.isArray(res.body.cities, 'response contains cities');
          assert.isArray(res.body.availabilities, 'response contains availabilities');
          assert.sameDeepMembers(res.body.cities, expectedCities, 'response contains correct stats for cities');
          assert.sameDeepMembers(res.body.availabilities, expectedAvailabilities,
            'response contains correct stats for availabilities');
        });
    });

    it('should return 401 if auth header is empty', () => {
      return request(sails.hooks.http.app)
        .get(endpoints.statistics)
        .set('Authorization', '')
        .expect(401);
    });
  });


  describe('GET /statistics/cities', () => {
    it('should return statistics with only cities', () => {
      return request(sails.hooks.http.app)
        .get(endpoints.statisticsCities)
        .set('Authorization', authHeader)
        .expect(200)
        .then((res) => {
          assert.isArray(res.body.cities, 'response contains cities');
          assert.sameDeepMembers(res.body.cities, expectedCities, 'response contains correct stats for cities');
          assert.isUndefined(res.body.availabilities, 'response contains availabilities');
        });
    });

    it('should return 401 if auth header is empty', () => {
      return request(sails.hooks.http.app)
        .get(endpoints.statisticsCities)
        .set('Authorization', '')
        .expect(401);
    });
  });

  describe('GET /statistics/availabilities', () => {
    it('should return statistics with only availabilities', () => {
      return request(sails.hooks.http.app)
        .get(endpoints.statisticsAvailabilities)
        .set('Authorization', authHeader)
        .expect(200)
        .then((res) => {
          assert.isUndefined(res.body.cities, 'response contains cities');
          assert.isArray(res.body.availabilities, 'response contains availabilities');
          assert.sameDeepMembers(res.body.availabilities, expectedAvailabilities,
            'response contains correct stats for availabilities');
        });
    });

    it('should return 401 if auth header is empty', () => {
      return request(sails.hooks.http.app)
        .get(endpoints.statisticsAvailabilities)
        .set('Authorization', '')
        .expect(401);
    });
  });
});
