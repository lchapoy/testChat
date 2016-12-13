/**
 * Room model events
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _events = require('events');

var _roomModel = require('./room.model');

var _roomModel2 = _interopRequireDefault(_roomModel);

var RoomEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
RoomEvents.setMaxListeners(0);

// Model events
var events = {
  'tellGroup': 'newGroup',
  'tellFriend': 'newRequest',
  'groupRemovedContact': 'tellFriendRemoved',
  'groupExitContact': 'tellFriendExit',
  'friendDeleted': 'deleteFriend',
  'acceptFriend': 'tellFriendAccepted',
  'joinRooms': 'joinRooms',
  // 'rejectFriend':'tellFriendRejected', //This behavior was deleted
  'groupDeleted': 'tellGroupDeleted',
  'groupAddedContact': 'tellGroupAddedFriend'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _roomModel2['default'].schema.on(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc, info) {
    RoomEvents.emit(event, doc, info);
  };
}

exports['default'] = RoomEvents;
module.exports = exports['default'];
//# sourceMappingURL=room.events.js.map
