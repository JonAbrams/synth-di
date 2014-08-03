require('should');

describe('synth-di', function () {
  var DI = require('../');
  var di;

  beforeEach(function () {
    di = new DI();
  });

  describe('#register', function () {
    it('registers services with name given as string', function () {
      di.register('aService', function () {});
      di.services[0].name.should.eql('aService');
    });

    it('registers services with name taken from function', function () {
      di.register(function aService () {});
      di.register(function anotherService(params) { return "stuff"; });
      di.services[0].name.should.eql('aService');
      di.services[1].name.should.eql('anotherService');
    });
  });

  describe('#exec', function () {
    var di;
    beforeEach(function () {
      di = new DI();
      di.register(function truth () { return true; });
      di.register(function justice() { return 'just'; });
      di.register(function superman(truth, justice) {
        return truth + ' and ' + justice;
      });
    });

    it('uses registered services', function () {
      di.exec('superman').should.eql('true and just');
    });

    it('uses given services when executed', function () {
      di.exec('superman', {
        justice: 'just and undocumented American'
      }).should.eql('true and just and undocumented American');
    });

    it('calls a given service only once', function () {
      var batarangs = 0;
      di.register(function batman (batarang, smokePellet) {
        return batarang + " " + smokePellet;
      });
      di.register(function smokePellet (batarang) {
        return batarang;
      });
      di.register(function batarang () {
        batarangs++;
        return "Bang";
      });
      di.exec('batman').should.eql("Bang Bang");
      batarangs.should.eql(1);
    });

    it('throws when cycle detected', function () {
      di.register(function justice (truth) { return 'just'; });
      di.register(function truth (justice) { return true; });
      (function () {
        di.exec('superman');
      }).should.throw("Service dependency cycle detected for truth");
    });
  });
});
