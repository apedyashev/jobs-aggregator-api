/* global APP_ROOT */
const assert = require('chai').assert;
const mocks = require('mocks');
const serverError = require(`${APP_ROOT}/api/responses/serverError.js`);
const sinon = require('sinon');

describe('requests/serverError', () => {
  let responseContext = null;
  beforeEach(() => {
    responseContext = mocks.responseContext();
  });

  it('sends 500 with empty body in production even if data is set', () => {
    const status = sinon.spy();
    responseContext.res.status = status;
    const error = sinon.spy();
    responseContext.req._sails.log.error = error;
    const jsonx = sinon.spy();
    responseContext.res.jsonx = jsonx;

    serverError.call(responseContext, 'message', 'error');

    assert.isTrue(status.calledOnce, 'called res.status once');
    assert.isTrue(status.calledWith(500), 'status is set to 500');

    assert.isTrue(error.calledOnce, 'called sails.log.error once');
    assert.equal(error.getCall(0).args.length, 3, 'error is called with 3 arguments');
    assert.equal(error.getCall(0).args[0], 'Sending 500 ("Server Error") response: \n',
      'error is called with a description');
    assert.equal(error.getCall(0).args[1], 'message', 'error is called with `message`');
    assert.equal(error.getCall(0).args[2], 'error', 'error is called with `error`');

    assert.isTrue(jsonx.calledOnce, 'called res.jsonx once');
    assert.isTrue(jsonx.calledWith(undefined), 'jsonx is called with `undefined`');
  });

  it('sends 500 with data in body if env is not production', () => {
    const status = sinon.spy();
    responseContext.res.status = status;
    const error = sinon.spy();
    responseContext.req._sails.log.error = error;
    const jsonx = sinon.spy();
    responseContext.res.jsonx = jsonx;
    responseContext.req._sails.config.environment = 'development';

    serverError.call(responseContext, 'message', 'error');

    assert.isTrue(status.calledOnce, 'called res.status once');
    assert.isTrue(status.calledWith(500), 'status is set to 500');

    assert.isTrue(error.calledOnce, 'called sails.log.error once');
    assert.equal(error.getCall(0).args.length, 3, 'error is called with 3 arguments');
    assert.equal(error.getCall(0).args[0], 'Sending 500 ("Server Error") response: \n',
      'error is called with a description');
    assert.equal(error.getCall(0).args[1], 'message', 'error is called with `message`');
    assert.equal(error.getCall(0).args[2], 'error', 'error is called with `error`');

    assert.isTrue(jsonx.calledOnce, 'called res.jsonx once');
    assert.isTrue(jsonx.calledWith({debug: {message: 'message', error: 'error'}}), 'jsonx is called with `debug`');
  });
});
