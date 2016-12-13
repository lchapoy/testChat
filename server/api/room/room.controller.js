/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/rooms              ->  index
 * POST    /api/rooms              ->  create
 * GET     /api/rooms/:id          ->  show
 * PUT     /api/rooms/:id          ->  update
 * DELETE  /api/rooms/:id          ->  destroy
 */

'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.index = index;
exports.destroy = destroy;
exports.changePassword = changePassword;
exports.friendRequest = friendRequest;
exports.createGroup = createGroup;
exports.getRooms = getRooms;
exports.storeMessage = storeMessage;
exports.getMessage = getMessage;
exports.deleteFriendFromGroup = deleteFriendFromGroup;
exports.exitGroup = exitGroup;
exports.deleteGroup = deleteGroup;
exports.addFriendToGroup = addFriendToGroup;
exports.acceptFriend = acceptFriend;
exports.rejectFriend = rejectFriend;
exports.getRequestPendings = getRequestPendings;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _roomModel = require('./room.model');

var _roomModel2 = _interopRequireDefault(_roomModel);

var _userUserModel = require('../user/user.model');

var _userUserModel2 = _interopRequireDefault(_userUserModel);

var mongoose = require('mongoose');

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    res.status(statusCode).json(err);
  };
}

function showErrorMessage(res, message, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    res.status(statusCode).json({ message: message });
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

function respondWith(res, statusCode) {
  statusCode = statusCode || 200;
  return function () {
    res.status(statusCode).end();
  };
}

// Gets a list of Rooms

function index(req, res) {
  _roomModel2['default'].findAsync().then(responseWithResult(res))['catch'](handleError(res));
}

/**
 * Deletes a Room
 * restriction: 'admin'
 */

function destroy(req, res) {
  var roomId = req.params.id;
  var friendId = req.query.friendId;
  _roomModel2['default'].findByIdAndRemoveAsync(roomId).then(function (data) {
    removeContRoom(data.members).then(function () {
      _roomModel2['default'].schema.emit('friendDeleted', { friendId: friendId, roomId: roomId, name: req.session.name, userId: req.session._id });
      res.status(204).end();
    });
  })['catch'](handleError(res));
}

/**
 * Change a users password
 */

function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  _userUserModel2['default'].findByIdAsync(userId).then(function (user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      return user.saveAsync().then(function () {
        res.status(204).end();
      })['catch'](validationError(res));
    } else {
      return res.status(403).end();
    }
  });
}

/**
 *  Verify if User is already Registered
 * @param email
 * @param userId
 * @param cb
 * @param catchFn
 * @returns {*}
 */
function isRegistered(email, userId, cb, catchFn) {
  return _userUserModel2['default'].findOneAsync({ email: email, request: { $ne: userId }, pending: { $ne: userId }, spam: { $ne: userId } }, { "name": 1, "img": 1, "status": 1, "email": 1 }).then(cb)['catch'](catchFn);
}
/**
 * Add Room
 */
function addContRoom(roomId, membersId) {
  return _userUserModel2['default'].update({ _id: { $in: membersId } }, { $push: { rooms: roomId } }, { multi: true });
}
/**
 * Friend Request
 */
function requestFriend(pendingId, requestId) {
  var promises = [];
  promises.push(_userUserModel2['default'].update({ _id: { $in: requestId } }, { $push: { request: pendingId } }, { multi: true }));
  promises.push(_userUserModel2['default'].update({ _id: { $in: pendingId } }, { $push: { pending: requestId } }, { multi: true }));
  return _Promise.all(promises);
}
/**
 * add par room and erase pending and request pending
 */
function addParRoom(pendingId, requestId, roomId) {
  var promises = [];
  promises.push(_userUserModel2['default'].update({ _id: { $in: requestId } }, { $pull: { request: pendingId } }, { multi: true }));
  promises.push(_userUserModel2['default'].update({ _id: { $in: pendingId } }, { $pull: { pending: requestId } }, { multi: true }));
  promises.push(_userUserModel2['default'].update({ _id: { $in: [pendingId, requestId] } }, { $push: { rooms: roomId } }, { multi: true }));
  return _Promise.all(promises);
}
/**
 * Remove Room
 */
function removeContRoom(roomId, membersId) {
  return _userUserModel2['default'].update({ _id: { $in: membersId } }, { $pull: { rooms: roomId } }, { multi: true });
}

/**
 * Add Friend
 */

function friendRequest(req, res) {

  var userId = req.session._id;
  var email = String(req.body.email);
  isRegistered(email, userId, function (user) {
    var friend = user;
    if (friend._id.equals(userId)) {
      return showErrorMessage(res, "You are not suppose to be your own friend")();
    }
    _roomModel2['default'].findOne({
      $or: [{ members: [userId, friend._id] }, { members: [friend._id, userId] }],
      kind: 'par'
    }).then(function (room) {
      if (!room) {
        requestFriend(userId, friend._id).then(function (response) {
          console.log(response);
          if (response.length == 2) {
            _roomModel2['default'].schema.emit("tellFriend", { toId: friend._id,
              from: req.session.user
            });
            res.status(201).json(friend);
          } else {
            showErrorMessage(res, "Request could not be sent to " + email)();
          }
        })['catch'](handleError(res));
      } else {
        showErrorMessage(res, email + " is already your friend")();
      }
    });
  }, function () {
    _userUserModel2['default'].findOneAsync({ email: email }).then(function (data) {
      if (data.pending.indexOf(userId) != -1) showErrorMessage(res, "You have a pending request from that user")();else if (data.request.indexOf(userId) != -1) showErrorMessage(res, "User already have a pending request")();else showErrorMessage(res, data.email + " don't want to be your friend")();
    })['catch'](function () {
      showErrorMessage(res, "User doesn't exist")();
    });
  });
}

/**
 * Add Group
 */

function createGroup(req, res) {
  var group = new _roomModel2['default']();
  group.admin = req.session._id;
  group.name = String(req.body.groupName);
  group.img = String(req.body.img);
  var membersId = req.body.membersId;
  membersId.push(group.admin);
  group.members = membersId;
  group.kind = 'group';
  group.saveAsync().spread(function (contactRoom) {
    addContRoom(contactRoom._id, membersId).then(function (response) {
      if (response.nModified == membersId.length) {
        group.populate({
          path: 'members',
          model: _userUserModel2['default'],
          select: "name img status email",
          match: { _id: { $ne: req.session._id } }
        }, function (err, data) {
          if (err) res.status(401).json(data);
          _roomModel2['default'].schema.emit("tellGroup", data, req.session.name);
          res.status(201).json(data);
        });
      } else {
        showErrorMessage(res, email + " could not be added to the room")();
      }
    })['catch'](handleError(res));
  })['catch'](handleError(res));
}

/**
 * Get All Friend Info
 */

function getRooms(req, res) {
  var userId = req.params.id;
  var kind = req.query.kind;
  _userUserModel2['default'].find({ _id: userId }, { "rooms": 1, "_id": 0 }).populate({
    path: "rooms",
    select: "members name kind img admin lastMessageDate lastMessageDate_ms",
    match: { kind: kind },
    populate: {
      path: "members",
      model: _userUserModel2['default'],
      select: "name img status email",
      match: { _id: { $ne: userId } }
    }
  }).exec(function (err, res1) {
    ;
    if (err) res.status(401).json(res1);
    //  if(kind=='par'&&res1[0].rooms){
    console.log("Emiting", res1[0].rooms);
    _roomModel2['default'].schema.emit('joinRooms', { rooms: res1[0].rooms, userId: userId });
    // }

    res.json(res1);
  });
}

/**
 * StoreMessage
 */

function storeMessage(req, res) {
  var userId = req.params.id;
  var roomId = String(req.body.roomId);
  var message = new _roomModel.Message({
    name: req.body.name,
    text: req.body.text,
    origin: userId,
    roomId: roomId
  });
  /*var message={
    name:req.body.name,
    text:req.body.text,
    origin:userId
  };*/
  if (req.body.scribble) message.scribble = req.body.scribble;
  //console.log("storeMessage "+message, userId)
  _roomModel2['default'].findOneAndUpdateAsync({ _id: roomId }, { lastMessageDate: Date.now() }, { upsert: true }).then(function () {
    message.saveAsync().spread(function () {
      res.status(204).end();
    });
  });
}

/**
 * getMessage
 */

function getMessage(req, res) {
  var roomId = req.params.id;
  var page = Number(req.query.page);
  var messageXpage = Number(req.query.messageXpage);
  var firstMessage = page * messageXpage;
  console.log(roomId);
  /* Room.aggregate([
     {"$match":{_id:mongoose.Types.ObjectId(roomId)}},
     {"$project":{"messages":1}},
     {"$unwind":"$messages"},
     {"$sort":{"messages.date":-1}},
     {"$skip":firstMessage},
     {"$limit":messageXpage},
     {"$group":
       {	"_id":"$_id",
         "messages":{"$push":"$messages"}
       }
     }
   ],(err,message) =>{
     console.log(message[0],err,"hi");
     if(message[0])
       return res.json(message[0].messages);
     else
       return res.json(message[0]);
   })*/
  _roomModel.Message.find({ roomId: roomId }).sort({ "date": -1 }).skip(firstMessage).limit(messageXpage).exec(function (err, message) {
    return res.json(message);
  });
}

/**
 *  delete Friend From Group
 */

function deleteFriendFromGroup(req, res) {
  //var user = new Room;
  var roomId = String(req.body.roomId);
  var friendId = String(req.body.friendId);
  var groupName = String(req.body.groupName);

  _roomModel2['default'].updateAsync({ _id: roomId }, { $pull: { members: friendId } }).then(function () {
    _userUserModel2['default'].findByIdAsync(friendId, { name: 1 }).then(function (doc) {
      // Room.schema.emit("leaveRoom",{id:friendId,roomId});
      _roomModel2['default'].schema.emit("groupRemovedContact", {
        roomId: roomId,
        friendId: friendId,
        groupName: groupName,
        friendName: doc.name
      }, req.session.name);
    })['catch'](handleError(res));
    res.status(204).end();
  });
  _userUserModel2['default'].updateAsync({ _id: friendId }, { $pull: { rooms: roomId } });
}

//************************************************
//Group Behavior
/**
 *  exit Group
 */

function exitGroup(req, res) {
  //var user = new Room;
  var userId = req.session._id;
  var roomId = String(req.body.roomId);
  var newAdmin = String(req.body.newAdmin);
  var groupName = String(req.body.groupName);
  _roomModel2['default'].updateAsync({ _id: roomId }, { $pull: { members: userId }, admin: newAdmin }).then(function () {
    _roomModel2['default'].schema.emit("groupExitContact", { name: req.session.name, groupName: groupName, userId: userId, roomId: roomId });
    res.status(204).end();
  })['catch'](handleError(res));
  _userUserModel2['default'].updateAsync({ _id: userId }, { $pull: { rooms: roomId } });
}

/**
 *  delete Group
 */

function deleteGroup(req, res) {

  var roomId = String(req.body.roomId);
  _roomModel2['default'].findByIdAndRemoveAsync(roomId, { 'members': 1, 'name': 1, '_id': 0 }).then(function (data) {
    // console.log(data);
    removeContRoom(roomId, data.members).then(function () {
      _roomModel2['default'].schema.emit("groupDeleted", { name: req.session.name, groupName: data.name, roomId: roomId });
      res.status(204).end();
    })['catch'](handleError(res));
  })['catch'](handleError(res));
}

/**
 *  add Friend To Group
 */

function addFriendToGroup(req, res) {
  var roomId = req.body.roomId;
  var membersId = req.body.membersId;
  var groupName = String(req.body.groupName);
  _roomModel2['default'].updateAsync({ _id: roomId }, { $addToSet: { members: { $each: membersId } } }).then(function () {
    addContRoom(roomId, membersId).then(function () {
      _roomModel2['default'].schema.emit("groupAddedContact", {
        roomId: roomId,
        membersId: membersId,
        groupName: groupName
      }, req.session.name);
    })['catch'](handleError(res));
    res.status(204).end();
  });
}

//**********************************
//friend request behavior

/**
 *  Accept friend from a request
 */

function acceptFriend(req, res) {
  var friendId = String(req.body.friendId);
  var userId = req.session._id;
  _userUserModel2['default'].findByIdAsync(friendId, { "name": 1, "img": 1, "status": 1, "email": 1 }).then(function (friend) {
    _roomModel2['default'].createAsync({
      members: [friendId, userId],
      kind: 'par'
    }).then(function (contactRoom) {
      addParRoom(friendId, userId, contactRoom._id).then(function () {
        _roomModel2['default'].schema.emit("acceptFriend", { toId: friendId,
          fromId: userId,
          from: { _id: contactRoom._id,
            members: [req.session.user],
            messages: [],
            kind: 'par',
            lastMessageDate_ms: contactRoom.lastMessageDate_ms
          }
        });
        res.status(201).json({ _id: contactRoom._id,
          members: [friend], messages: [],
          kind: 'par',
          lastMessageDate_ms: contactRoom.lastMessageDate_ms
        });
      })['catch'](handleError(res));
    })['catch'](handleError(res));
  })['catch'](handleError(res));
}

/**
 * Reject friend:
 *  rejecting a friend will add the user into the spam array that won't allow that
 *  user to ask the current user being a friend again
 * @param req
 * @param res
 */

function rejectFriend(req, res) {
  var friendId = String(req.body.friendId);
  var userId = req.session._id;
  var promises = [];
  promises.push(_userUserModel2['default'].findByIdAndUpdate(friendId, { $pull: { pending: userId } }));
  promises.push(_userUserModel2['default'].findByIdAndUpdate(userId, { $pull: { request: friendId }, $push: { spam: friendId } }));
  _Promise.all(promises).then(function () {
    res.status(201).json({});
  })['catch'](handleError(res));
}

/**
 * GetRequestPendings:
 *  Will get all the pending request that a certain user have
 * @param req
 * @param res
 */

function getRequestPendings(req, res) {
  var userId = req.params.id;
  var promises = [];
  promises.push(_userUserModel2['default'].findOne({ _id: userId }, { "request": 1, "_id": 0 }).populate({
    path: "request",
    select: "email name  img",
    model: _userUserModel2['default']
  }));
  promises.push(_userUserModel2['default'].findOne({ _id: userId }, { "pending": 1, "_id": 0 }).populate({
    path: "pending",
    select: "email name  img",
    model: _userUserModel2['default']
  }));
  _Promise.all(promises).then(function (data) {
    console.log(data[0], data[1].pending);
    res.json({ pendings: data[1].pending, requests: data[0].request });
  });
}
//# sourceMappingURL=room.controller.js.map
