/* global APP_ROOT */
const assert = require('chai').assert;
const mocks = require('mocks');
const validationError = require(`${APP_ROOT}/api/responses/validationError.js`);
const sinon = require('sinon');

describe('requests/validationError', () => {
  let responseContext = null;
  beforeEach(() => {
    responseContext = mocks.responseContext();
  });

  it('sends 422 with with message and error in production', () => {
    const status = sinon.spy();
    responseContext.res.status = status;
    const verbose = sinon.spy();
    responseContext.req._sails.log.verbose = verbose;
    const jsonx = sinon.spy();
    responseContext.res.jsonx = jsonx;

    validationError.call(responseContext, 'message', 'error');

    assert.isTrue(status.calledOnce, 'called res.status once');
    assert.isTrue(status.calledWith(422), 'status is set to 422');

    assert.isTrue(verbose.calledOnce, 'called sails.log.verbose once');
    assert.equal(verbose.getCall(0).args.length, 3, 'verbose is called with 3 arguments');
    assert.equal(verbose.getCall(0).args[0], 'Sending 422 ("Unprocessable Entity/Validation Error") response: \n',
      'verbose is called with a description');
    assert.equal(verbose.getCall(0).args[1], 'message', 'verbose is called with `message`');
    assert.equal(verbose.getCall(0).args[2], 'error', 'verbose is called with `error`');

    assert.isTrue(jsonx.calledOnce, 'called res.jsonx once');
    assert.isTrue(jsonx.calledWith({message: 'message', validationErrors: 'error'}), 'jsonx is called with `undefined`');
  });

  it('sends 422 with with message and error if env is not production', () => {
    const status = sinon.spy();
    responseContext.res.status = status;
    const verbose = sinon.spy();
    responseContext.req._sails.log.verbose = verbose;
    const jsonx = sinon.spy();
    responseContext.res.jsonx = jsonx;
    responseContext.req._sails.config.environment = 'development';

    validationError.call(responseContext, 'message', 'error');

    assert.isTrue(status.calledOnce, 'called res.status once');
    assert.isTrue(status.calledWith(422), 'status is set to 422');

    assert.isTrue(jsonx.calledOnce, 'called res.jsonx once');
    assert.isTrue(jsonx.calledWith({message: 'message', validationErrors: 'error'}), 'jsonx is called with `debug`');
  });
});
