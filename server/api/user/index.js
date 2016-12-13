'use strict';

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _express = require('express');

var _userController = require('./user.controller');

var controller = _interopRequireWildcard(_userController);

var _authAuthService = require('../../auth/auth.service');

var auth = _interopRequireWildcard(_authAuthService);

var router = new _express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router['delete']('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
//router.get('/getAllFriends', auth.isAuthenticated(), controller.getAllFriends);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
/*router.put('/:id/addContRoom', auth.isAuthenticated(), controller.addContRoom);*/
//router.put('/:id/addMail', auth.isAuthenticated(), controller.addFriend);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
