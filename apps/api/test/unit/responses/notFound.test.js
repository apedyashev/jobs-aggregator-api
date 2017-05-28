/* global APP_ROOT */
const assert = require('chai').assert;
const mocks = require('mocks');
const notFound = require(`${APP_ROOT}/api/responses/notFound.js`);
const sinon = require('sinon');

describe('requests/notFound', () => {
  let responseContext = null;
  beforeEach(() => {
    responseContext = mocks.responseContext();
  });

  it('sends 404 with empty body in production even if data is set', () => {
    const status = sinon.spy();
    responseContext.res.status = status;
    const verbose = sinon.spy();
    responseContext.req._sails.log.verbose = verbose;
    const jsonx = sinon.spy();
    responseContext.res.jsonx = jsonx;

    notFound.call(responseContext, 'message', 'error');

    assert.isTrue(status.calledOnce, 'called res.status once');
    assert.isTrue(status.calledWith(404), 'status is set to 404');

    assert.isTrue(verbose.calledOnce, 'called sails.log.verbose once');
    assert.equal(verbose.getCall(0).args.length, 3, 'verbose is called with 3 arguments');
    assert.equal(verbose.getCall(0).args[0], 'Sending 404 ("Not Found") response: \n',
      'verbose is called with a description');
    assert.equal(verbose.getCall(0).args[1], 'message', 'verbose is called with `message`');
    assert.equal(verbose.getCall(0).args[2], 'error', 'verbose is called with `error`');

    assert.isTrue(jsonx.calledOnce, 'called res.jsonx once');
    assert.isTrue(jsonx.calledWith(undefined), 'jsonx is called with `undefined`');
  });

  it('sends 404 with data in body if env is not production', () => {
    const status = sinon.spy();
    responseContext.res.status = status;
    const verbose = sinon.spy();
    responseContext.req._sails.log.verbose = verbose;
    const jsonx = sinon.spy();
    responseContext.res.jsonx = jsonx;
    responseContext.req._sails.config.environment = 'development';

    notFound.call(responseContext, 'message', 'error');

    assert.isTrue(status.calledOnce, 'called res.status once');
    assert.isTrue(status.calledWith(404), 'status is set to 404');

    assert.isTrue(verbose.calledOnce, 'called sails.log.verbose once');
    assert.equal(verbose.getCall(0).args.length, 3, 'verbose is called with 3 arguments');
    assert.equal(verbose.getCall(0).args[0], 'Sending 404 ("Not Found") response: \n',
      'verbose is called with a description');
    assert.equal(verbose.getCall(0).args[1], 'message', 'verbose is called with `message`');
    assert.equal(verbose.getCall(0).args[2], 'error', 'verbose is called with `error`');

    assert.isTrue(jsonx.calledOnce, 'called res.jsonx once');
    assert.isTrue(jsonx.calledWith({debug: {message: 'message', error: 'error'}}), 'jsonx is called with `debug`');
  });
});
