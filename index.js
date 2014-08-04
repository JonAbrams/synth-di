var utils = require('./utils'),
    Promise = require('bluebird');

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

DI.prototype.exec = function (nameOrService, servicesObj) {
  servicesObj = servicesObj || {};
  var customServices = Object.keys(servicesObj).map(function (serviceName) {
    return new Service(serviceName, function () {
        return servicesObj[serviceName];
      });
  });

  services = customServices.concat(this.services);

  var service;
  if (typeof nameOrService === 'string') {
    service = services.filter(function (service) {
      return service.name === nameOrService;
    })[0];

    if (service === undefined) {
      throw new Error(nameOrService + " doesn't appear to be a registerd service.");
    }
  } else if (typeof nameOrService === 'function') {
    service = new Service(utils.getNameFromFunc(nameOrService), nameOrService);
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
      // Check if service has yet to be resolved
      if ( !results.hasOwnProperty(serviceName) ) {
        // Find the request service
        var service = services.filter(function (service) {
          return service.name === serviceName;
        })[0];
        if (service === undefined) {
          throw new Error(serviceName + " doesn't appear to be a registered service.");
        }
        // Resolve this service, then record the results
        results[serviceName]= resolve(service);
      }
      dependencies.push(results[serviceName]);
    });

    return Promise.all(dependencies).then(function (dependencies) {
      return self.func.apply(self, dependencies);
    });
  })(this);
};
