'use strict';

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _express = require('express');

var _roomController = require('./room.controller');

var controller = _interopRequireWildcard(_roomController);

var _authAuthService = require('../../auth/auth.service');

var auth = _interopRequireWildcard(_authAuthService);

var router = new _express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id/getRooms', auth.isAuthenticated(), controller.getRooms);
router.get('/:id/getRequestPendings', auth.isAuthenticated(), controller.getRequestPendings);
router.get('/:id/getMessage', auth.isAuthenticated(), controller.getMessage);
router.post('/', auth.isAuthenticated(), controller.friendRequest);
router.post('/createGroup', auth.isAuthenticated(), controller.createGroup);
router.post('/deleteFriendFromGroup', auth.isAuthenticated(), controller.deleteFriendFromGroup);
router.post('/addFriendToGroup', auth.isAuthenticated(), controller.addFriendToGroup);
router.post('/deleteGroup', auth.isAuthenticated(), controller.deleteGroup);
router.post('/exitGroup', auth.isAuthenticated(), controller.exitGroup);
router.post('/acceptFriend', auth.isAuthenticated(), controller.acceptFriend);
router.post('/rejectFriend', auth.isAuthenticated(), controller.rejectFriend);
router.put('/:id/storeMessage', auth.isAuthenticated(), controller.storeMessage);
router['delete']('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
//# sourceMappingURL=index.js.map
