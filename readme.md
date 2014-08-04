# Synth-DI

A promise-enabled dependency-injection module designed for [Synth](https://github.com/JonAbrams/synth), but can be used for your own projects.

## Status

It doesn't work yet, but ideas and feedback are certainly welcome, just make an issue!

## Usage

Install it.

```
npm install synth-di
```

Load it.

```javascript
var DI = require('synth-di');
// Create a new dependency system
var di = new DI();
```

## What is a service?

A service is a function that can be requested by another service.

They're just ordinary JS functions, except:

- Each service must have a unique name (unique for your app), unless being executed immediately.
- Each service has 0 or more dependencies.
- When a service is executed, Synth-DI will invoke its dependencies first, along with its dependencies' dependencies, and so on.
- A service declares its dependencies by requesting them as parameters. Unlike ordinary JavaScript functions, this means that the names of the parameters are significant, and their order doesn't matter!
- A service need not be a function though (I lied earlier). It can also be a named piece of data that is provided at time of execution.
- If a service is not a function, then it can't have any dependencies.
- A service can optionally return a promise. If so, the service won't be considered "ready" until the promise resolves. The result of the promise is then passed in to its caller.
- When a service is executed, a promise is always returned.
- Each service is only called once per execution. So if two services `A and B` depend on `C`, `C` is resolved once and returned to both A and B.

## An elaborate Example

Let's say you're writing an [Express](http://expressjs.com) server and want to fetch some data for an admin user, and then send a response. It needs two things: The user (guaranteed to be an admin), and a connection to the DB.

```javascript
var DI = require('synth-di');
var di = new DI();

// service name specified as first parameter
di.register('adminUser', function (user) {
  if (!user || !user.admin) {
    throw "The specified user is not an administrator";
  }

  return user;
});

// The order you register services doesn't matter
di.register('user', function (db, authToken) {
  // The 'req' service is actually an object that will be passed in at time of execution
  // Returns a promise that returns a user object (or null if no user found)
  return db.collection('users').find({
    id: userid
  });
});

var dbConnection = require('mongojs')(process.env.MONGO_DB);
// service name extracted from given named-function
di.register(function db () {
  return dbConnection;
});

// Now that we have our services registered, let's get that admin user and data!
app.get('/api/users/:userid/secrets', function (req, res) {
  var authToken = req.cookies.authToken;
  // Execute an anonymous service that depends on adminUser and db services
  di.exec(function (adminUser, db) {
    // Send back the requested data
    db.collection('secrets').findAll({ user_id: user.id }, function (err, data) {
      res.send(data);
    });
  });
});
```

## API

### di.register([optional serviceName:String], [service:Function])

Registers a service/function that can be used by another service/function.

The service name can be specified as the first parameter, or as the name of the function passed in.

### di.exec([serviceName:String], [optional services:Object])

Executes the specified service. The requested service should already be registered before executing it.

It returns a promise that then returns the result of the call.

#### The optional 2nd paramter
An optional 2nd parameter can be provided to provide service dependencies at execution time (overriding already registered services).

The keys are the names of the services, and the values are passed in as those services, untouched.

Unlike a registered service, if a value is a function, it will NOT be invoked first, the function itself will be passed in.

## License

MIT

## Credit

- This project was created by Jon Abrams ([Twitter](https://twitter.com/JonathanAbrams) | [GitHub](https://github.com/JonAbrams)).
- Thanks to [Mikael Møller](https://github.com/mikaelhm) for his feedback on Synth which [lead to this project](https://github.com/JonAbrams/synth/issues/39#issuecomment-50677052).
- Thanks to the AngularJS project for inspiring this version of dependency injection.
