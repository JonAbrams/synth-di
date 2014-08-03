require('should');

describe('synth-di', function () {
  var DI = require('../');
  var di;

  beforeEach(function () {
    di = new DI();
  });

  it('registers services with name given as string', function () {
    di.register('aService', function () {});
    di.services.contains('aService');
  });

  it('registers services with name taken from function', function () {
    di.register(function aService () {});
    di.services.contains('aService');
  });
});
