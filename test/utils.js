require('should');

var utils = require('../utils');

describe('#getNameFromFunc', function () {
  it('works', function () {
    var func1 = function  myName  (param) {
      return "hi";
    };
    var func2 = function myName2(param) {};
    var func3 = function (param) {};

    utils.getNameFromFunc(func1).should.eql('myName');
    utils.getNameFromFunc(func2).should.eql('myName2');
    utils.getNameFromFunc(func3).should.eql('');
  });

  it('throws when a non-function is passed', function () {
    (function () {
      utils.getNameFromFunc(true);
    }).should.throw('A function must be passed in');
  });
});

describe('#getParamsFromFunc', function () {
  it('works', function () {
    var func1 = function  myName  (param1, param2) {
      return "hi";
    };
    var func2 = function myName2( param ) {};
    var func3 = function (param1 ,  param2,  param3) {};
    var func4 = function () {};

    utils.getParamsFromFunc(func1).should.eql(['param1', 'param2']);
    utils.getParamsFromFunc(func2).should.eql(['param']);
    utils.getParamsFromFunc(func3).should.eql(['param1', 'param2', 'param3']);
    utils.getParamsFromFunc(func4).should.eql([]);
  });

  it('throws when a non-function is passed', function () {
    (function () {
      utils.getParamsFromFunc(true);
    }).should.throw('A function must be passed in');
  });
});

describe('#throwIfNotFunc', function () {
  it('throws when a non-function is passed', function () {
    (function () {
      utils.throwIfNotFunc(true);
    }).should.throw('A function must be passed in');
  });

  it('does not throw if not a func', function () {
    (function () {
      utils.getParamsFromFunc(function () {});
    }).should.not.throw();
  });
});
