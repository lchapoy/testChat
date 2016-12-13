/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _apiThingThingModel = require('../api/thing/thing.model');

var _apiThingThingModel2 = _interopRequireDefault(_apiThingThingModel);

var _apiUserUserModel = require('../api/user/user.model');

var _apiUserUserModel2 = _interopRequireDefault(_apiUserUserModel);

var _apiRoomRoomModel = require('../api/room/room.model');

var _apiRoomRoomModel2 = _interopRequireDefault(_apiRoomRoomModel);

_apiRoomRoomModel2['default'].find({}).removeAsync();
_apiRoomRoomModel.Message.find({}).removeAsync();
_apiThingThingModel2['default'].find({}).removeAsync().then(function () {
  _apiThingThingModel2['default'].create({
    name: 'Development Tools',
    info: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' + 'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' + 'Stylus, Sass, and Less.'
  }, {
    name: 'Server and Client integration',
    info: 'Built with a powerful and fun stack: MongoDB, Express, ' + 'AngularJS, and Node.'
  }, {
    name: 'Smart Build System',
    info: 'Build system ignores `spec` files, allowing you to keep ' + 'tests alongside code. Automatic injection of scripts and ' + 'styles into your index.html'
  }, {
    name: 'Modular Structure',
    info: 'Best practice client and server structures allow for more ' + 'code reusability and maximum scalability'
  }, {
    name: 'Optimized Build',
    info: 'Build process packs up your templates as a single JavaScript ' + 'payload, minifies your scripts/css/images, and rewrites asset ' + 'names for caching.'
  }, {
    name: 'Deployment Ready',
    info: 'Easily deploy your app to Heroku or Openshift with the heroku ' + 'and openshift subgenerators'
  });
});

_apiUserUserModel2['default'].find({}).removeAsync().then(function () {
  _apiUserUserModel2['default'].createAsync({
    provider: 'local',
    name: 'Test User',
    email: 'test@example.com',
    img: '/assets/images/no_user_image.jpg',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@example.com',
    img: '/assets/images/no_user_image.jpg',
    password: 'admin'
  }, {
    provider: 'local',
    name: 'Janet Perkins',
    email: 'jperkins@example.com',
    img: '/assets/images/janetPerkings.jpg',
    password: 'test'
  }, {
    provider: 'local',
    name: 'Mary Johnson',
    email: 'mjohnson@example.com',
    img: '/assets/images/maryJohnson.jpg',
    password: 'test'
  }, {
    provider: 'local',
    name: 'Peter Carlsson',
    email: 'pcarlsson@example.com',
    img: '/assets/images/peterCarlsson.jpg',
    password: 'test'
  }).then(function () {
    console.log('finished populating users');
  });
});
//# sourceMappingURL=seed.js.map
