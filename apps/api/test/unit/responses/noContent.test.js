/* global APP_ROOT */
const assert = require('chai').assert;
const mocks = require('mocks');
const noContent = require(`${APP_ROOT}/api/responses/noContent.js`);
const sinon = require('sinon');

describe('requests/noContent', () => {
  let responseContext = null;
  beforeEach(() => {
    responseContext = mocks.responseContext();
  });

  it('sends 204 with empty body in production', () => {
    const status = sinon.spy();
    responseContext.res.status = status;
    const silly = sinon.spy();
    responseContext.req._sails.log.silly = silly;
    const jsonx = sinon.spy();
    responseContext.res.jsonx = jsonx;

    noContent.call(responseContext, 'data');

    assert.isTrue(status.calledOnce, 'called res.status once');
    assert.isTrue(status.calledWith(204), 'status is set to 204');

    assert.isTrue(silly.calledOnce, 'called sails.log.silly once');
    assert.equal(silly.getCall(0).args.length, 1, 'silly is called with single argument');
    assert.equal(silly.getCall(0).args[0], 'Sending 204 ("No Content") response',
      'silly is called with a description');

    assert.isTrue(jsonx.calledOnce, 'called res.jsonx once');
    assert.equal(jsonx.getCall(0).args.length, 0, 'jsonx is called without any arguments');
  });

  it('sends 204 with empty body in development', () => {
    const status = sinon.spy();
    responseContext.res.status = status;
    const jsonx = sinon.spy();
    responseContext.res.jsonx = jsonx;
    responseContext.req._sails.config.environment = 'development';

    noContent.call(responseContext, 'data');

    assert.isTrue(status.calledOnce, 'called res.status once');
    assert.isTrue(status.calledWith(204), 'status is set to 204');

    assert.isTrue(jsonx.calledOnce, 'called res.jsonx once');
      assert.equal(jsonx.getCall(0).args.length, 0, 'jsonx is called without any arguments');
  });
});
