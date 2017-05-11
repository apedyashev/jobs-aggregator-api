const request = require('supertest');
const assert = require('chai').assert;

describe('JobsController', () => {
  describe('GET /jobs', () => {
    const jobs = [{title: 'job1'}, {title: 'job2'}, {title: 'job3'}, {title: 'job4'}, {title: 'job5'}, {title: 'job6'}];
    before(() => {
      return Jobs.create(jobs);
    });

    const meta = {
      paginate: {
        currentPage: 1,
        nextPage: null,
        prevPage: null,
        totalPages: 1,
        totalCount: jobs.length,
        perPage: 50,
      },
    };

    it('should return the list of the jobs without authentication', () => {
      return request(sails.hooks.http.app)
        .get('/jobs?sortBy=title:asc')
        .expect(200)
        .expect((res) => {
          assert.isArray(res.body.items, 'items property exists');
          // do not check job's id, createdAt etc. `title` checking is enought
          res.body.items = res.body.items.map((job) => ({title: job.title}));
        })
        .expect({meta, items: jobs});
    });

    it('should return the list of the jobs sorted by `title`, DESC', () => {
      return request(sails.hooks.http.app)
        .get('/jobs?sortBy=title:desc')
        .expect(200)
        .expect((res) => {
          // do not check job's id, createdAt etc. `title` checking is enought
          res.body.items = res.body.items.map((job) => ({title: job.title}));
        })
        .expect({meta, items: jobs.slice().reverse()});
    });

    it('should return the list ordered in DESC order if order direction is missed in the `sortBy` param', () => {
      return request(sails.hooks.http.app)
        .get('/jobs?sortBy=title')
        .expect(200)
        .expect((res) => {
          // do not check job's id, createdAt etc. `title` checking is enought
          res.body.items = res.body.items.map((job) => ({title: job.title}));
        })
        .expect({meta, items: jobs.slice().reverse()});
    });

    it('should return the 2 first jobs when page is 1 and perPage is 2', () => {
      const expectedMeta = Object.assign({}, meta);
      expectedMeta.paginate.perPage = 2;
      expectedMeta.paginate.totalPages = 3;
      expectedMeta.paginate.nextPage = 2;
      return request(sails.hooks.http.app)
        .get('/jobs?page=1&perPage=2&sortBy=title:asc')
        .expect(200)
        .expect((res) => {
          // do not check job's id, createdAt etc. `title` checking is enought
          res.body.items = res.body.items.map((job) => ({title: job.title}));
        })
        .expect({meta: expectedMeta, items: jobs.slice(0, 2)});
    });

    it('should return jobs at indeces 3-5 when page is 2 and perPage is 3', () => {
      const expectedMeta = Object.assign(meta, {paginate: {
        currentPage: 2,
        nextPage: null,
        prevPage: 1,
        totalPages: 2,
        totalCount: jobs.length,
        perPage: 3,
      }});
      return request(sails.hooks.http.app)
        .get('/jobs?page=2&perPage=3&sortBy=title:asc')
        .expect(200)
        .expect((res) => {
          // do not check job's id, createdAt etc. `title` checking is enought
          res.body.items = res.body.items.map((job) => ({title: job.title}));
        })
        .expect({meta: expectedMeta, items: jobs.slice(3, 6)});
    });
  });
});
