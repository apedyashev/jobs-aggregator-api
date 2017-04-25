const request = require('supertest');

describe('AuthController', () => {
  describe('POST /auth', () => {
    it('should login the default user', (done) => {
      const [defaultUser] = sails.config.seeds.users;
      request(sails.hooks.http.app)
        .post('/auth')
        .send({email: defaultUser.email, password: defaultUser.password})
        .expect(200)
        .expect((res) => {
          if(!res.body.user) throw new Error('Missing user key');
          if(res.body.user.email !== defaultUser.email) throw new Error('Email of returned user is invalid');
        })
        .end(done);
    });


    it('should return 401 Unautorized if email is empty', (done) => {
      const [defaultUser] = sails.config.seeds.users;
      request(sails.hooks.http.app)
        .post('/auth')
        .send({email: '', password: defaultUser.password})
        .expect(401)
        .end(done);
    });

    it('should return 401 Unautorized if password is empty', (done) => {
      const [defaultUser] = sails.config.seeds.users;
      request(sails.hooks.http.app)
        .post('/auth')
        .send({email: defaultUser.email, password: ''})
        .expect(401)
        .end(done);
    });

    it('should return 401 Unautorized if email is incorrect', (done) => {
      const [defaultUser] = sails.config.seeds.users;
      request(sails.hooks.http.app)
        .post('/auth')
        .send({email: `fake-${defaultUser.email}`, password: defaultUser.password})
        .expect(401)
        .end(done);
    });

    it('should return 401 Unautorized if password is incorrect', (done) => {
      const [defaultUser] = sails.config.seeds.users;
      request(sails.hooks.http.app)
        .post('/auth')
        .send({email: defaultUser.email, password: `fake-${defaultUser.password}`})
        .expect(401)
        .end(done);
    });
  });
});
