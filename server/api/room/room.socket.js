/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.register = register;

var _userUserModel = require('../user/user.model');

var _userUserModel2 = _interopRequireDefault(_userUserModel);

var _roomModel = require('./room.model');

var _roomModel2 = _interopRequireDefault(_roomModel);

var RoomEvents = require('./room.events');

var socketEvents = {
  'delete': eventToRoom,
  'removeRoom': removeRoomListener,
  'newMessage': eventToRoom
};

function register(socket, id) {
  //Listen to user socketEvent
  for (var e in socketEvents) {
    var callback = socketEvents[e];
    var listener = createListener(e, socket, callback, id);
    socket.on('room:' + e, listener);
  }
  //***************************************
  //Added by me
  socket.on('forceDisconnect', forceDisconnect(socket, id));
  //***************************************
}

function forceDisconnect(socket, id) {
  return function () {
    _userUserModel2['default'].findOne({ _id: id._id }, { rooms: 1, status: 1 }).populate({
      path: 'rooms',
      model: _roomModel2['default'],
      select: { 'members': { $elemMatch: { $ne: id._id } }, kind: "par" }
    }).exec(function (err, data) {
      data.status = 'Offline';
      data.saveAsync();
      data = data.rooms;
      for (var i = 0; i < data.length; i++) {
        socket.log(data[i].members[0].name);
        socket.to(data[i].members[0]).emit("userDisconnect", data[i]._id, " " + socket.request.session.name + " is offline");
      }
      socket.disconnect();
    });
  };
}

function removeRoomListener(socket) {
  return function (roomId) {
    socket.leave(roomId);
  };
}

function eventToRoom(socket, event) {
  return function (doc, message) {
    //console.log(event);
    socket.to(doc.roomId).emit(event, doc, message);
  };
}

function createListener(event, socket, cb, id) {
  return cb(socket, event, id);
}

function removeListener(event, listener) {
  return function () {
    RoomEvents.removeListener(event, listener);
  };
}
//# sourceMappingURL=room.socket.js.map
