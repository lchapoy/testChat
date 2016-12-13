'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var MessageSchema = new mongoose.Schema({
  date: {
    type: Date,
    'default': Date.now
  },
  name: String,
  text: String,
  scribble: { type: Boolean, 'default': false },
  roomId: mongoose.Schema.Types.ObjectId,
  origin: mongoose.Schema.Types.ObjectId
});

var RoomSchema = new mongoose.Schema({
  messages: [MessageSchema],
  name: String,
  admin: mongoose.Schema.Types.ObjectId,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  kind: String,
  lastMessageDate: { type: Date, 'default': Date.now() },
  img: String
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

RoomSchema.virtual('lastMessageDate_ms').get(function () {
  return this.lastMessageDate.getTime();
});

exports['default'] = mongoose.model('Room', RoomSchema);
var Message = mongoose.model('Message', MessageSchema);
exports.Message = Message;
//# sourceMappingURL=room.model.js.map
