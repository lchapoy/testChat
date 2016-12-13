'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _connectMongo = require('connect-mongo');

var _connectMongo2 = _interopRequireDefault(_connectMongo);

var path = require('path');
var _ = require('lodash');

var mongoStore = (0, _connectMongo2['default'])(_expressSession2['default']);

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 8080,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'chat-yeo-secret'
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  facebook: {
    clientID: process.env.FACEBOOK_ID || 'id',
    clientSecret: process.env.FACEBOOK_SECRET || 'secret',
    callbackURL: (process.env.DOMAIN || '') + '/auth/facebook/callback'
  },

  twitter: {
    clientID: process.env.TWITTER_ID || 'id',
    clientSecret: process.env.TWITTER_SECRET || 'secret',
    callbackURL: (process.env.DOMAIN || '') + '/auth/twitter/callback'
  },
  session: (0, _expressSession2['default'])({
    secret: 'chat-yeo-secret',
    saveUninitialized: true,
    resave: true,
    store: new mongoStore({
      mongooseConnection: _mongoose2['default'].connection,
      db: 'chat-yeo'
    })
  })
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(all, require('./shared'), require('./' + process.env.NODE_ENV + '.js') || {});
//# sourceMappingURL=index.js.map
