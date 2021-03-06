/* global APP_ROOT */
const assert = require('chai').assert;
const mocks = require('mocks');
const created = require(`${APP_ROOT}/api/responses/created.js`);
const sinon = require('sinon');

describe('requests/created', () => {
  let responseContext = null;
  beforeEach(() => {
    responseContext = mocks.responseContext();
  });

  it('sends 201 with data in production', () => {
    const status = sinon.spy();
    responseContext.res.status = status;
    const silly = sinon.spy();
    responseContext.req._sails.log.silly = silly;
    const jsonx = sinon.spy();
    responseContext.res.jsonx = jsonx;

    created.call(responseContext, 'data');

    assert.isTrue(status.calledOnce, 'called res.status once');
    assert.isTrue(status.calledWith(201), 'status is set to 201');

    assert.isTrue(silly.calledOnce, 'called sails.log.silly once');
    assert.equal(silly.getCall(0).args.length, 1, 'silly is called with single argument');
    assert.equal(silly.getCall(0).args[0], 'Sending 201 ("CREATED") response',
      'silly is called with a description');

    assert.isTrue(jsonx.calledOnce, 'called res.jsonx once');
    assert.isTrue(jsonx.calledWith('data'), 'jsonx is called with `data`');
  });

  it('sends 201 with data in development', () => {
    const status = sinon.spy();
    responseContext.res.status = status;
    const jsonx = sinon.spy();
    responseContext.res.jsonx = jsonx;
    responseContext.req._sails.config.environment = 'development';

    created.call(responseContext, 'data');

    assert.isTrue(status.calledOnce, 'called res.status once');
    assert.isTrue(status.calledWith(201), 'status is set to 201');

    assert.isTrue(jsonx.calledOnce, 'called res.jsonx once');
    assert.isTrue(jsonx.calledWith('data'), 'jsonx is called with `data`');
  });
});
