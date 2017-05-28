module.exports = function() {
  return {
    req: {
      _sails: {
        config: {
          environment: 'production',
        },
        log: {
          verbose() {},
          silly() {},
          error() {},
        },
      },
    },
    res: {
      status() {},
      jsonx() {},
    },
  };
};
