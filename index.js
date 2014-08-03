var utils = require('./utils');

var DI = module.exports = function DI () {
  this.services = [];
};

DI.prototype.register = function (name, func) {
  if (typeof name === 'function') {
    func = name;
    name = utils.getNameFromFunc(func);
  }

  var service = new Service(name, func);

  // If service already registered, remove old version first
  this.services = this.services.filter(function (service) {
    return service.name !== name;
  });

  this.services.push(service);
};

DI.prototype.exec = function (name, servicesObj) {
  servicesObj = servicesObj || {};
  var customServices = Object.keys(servicesObj).map(function (serviceName) {
    return new Service(serviceName, function () {
        return servicesObj[serviceName];
      });
  });

  services = customServices.concat(this.services);

  var service = services.filter(function (service) {
    return service.name === name;
  })[0];

  if (service === undefined) {
    throw new Error(name + " doesn't appear to be a registerd service.");
  }

  return service.resolve(services);
};

var Service = exports.Service = function Service (name, func) {
  this.name = name;
  this.dependencyNames = utils.getParamsFromFunc(func);
  this.func = func;
};

Service.prototype.resolve = function (services) {
  var results = {};
  var callStack = [this.name];

  return (function resolve (self) {
    var dependencies = [];
    self.dependencyNames.forEach(function (serviceName) {
      if ( !results.hasOwnProperty(serviceName) ) {
        var service = services.filter(function (service) {
          return service.name === serviceName;
        })[0];
        if (service === undefined) {
          throw new Error(serviceName + " doesn't appear to be a registered service.");
        }
        if (callStack.indexOf(serviceName) !== -1) {
          throw new Error("Service dependency cycle detected for " + serviceName);
        }
        callStack.push(serviceName);
        results[serviceName] = resolve(service);
      }
      dependencies.push(results[serviceName]);
    });

    return self.func.apply(self, dependencies);
  })(this, services);
};
