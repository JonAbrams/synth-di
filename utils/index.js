exports.getNameFromFunc = function (func) {
  throwIfNotFunc(func);

  return parseFunc.exec(func)[1];
};

exports.getParamsFromFunc = function (func) {
  throwIfNotFunc(func);

  return parseFunc.exec(func)[2].split(/\s*,\s*/).filter(function (param) {
    return param;
  });
};

var throwIfNotFunc = exports.throwIfNotFunc = function (param) {
  if (typeof param !== 'function') {
    throw new Error('A function must be passed in');
  }
};

var parseFunc = /function\s+([^\s\(]*)\s*\(\s*(.*?)\s*\).*/;
