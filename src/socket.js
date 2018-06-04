const {
  isFunction,
  forIn,
  find,
  values,
  keys,
  compact,
  filter,
} = require("lodash")
const SignalSockets = require("signal-master/sockets")
const colors = require("colors")

const Users = require("./users")

const Sockets = function(server, config) {
  const MAX_MEMBERS_ROOM = 4

  var io = SignalSockets(server, config)


  const sockets = new Map()
  const userIds = new Set()
  const users = new Map()
  const rooms = new Map()
  const roomIds = new Set()

  const userApi = Users(io, sockets)

  const getAvailableRoomIdsToJoin = () => {
    let _roomIds = []
    for (let room of rooms.values()) {
      if (room.members.size < MAX_MEMBERS_ROOM) {
        _roomIds.push(room.id)
      }
    }
    return _roomIds
  }

  const getNewRoom = () => {
    let r, _found
    while (!_found) {
      r = RS.generate({
        length: 3,
        charset: "alphabetic",
      })
      _found = !roomIds.has(r)
    }
    return r
  }

  const getRoomByMemberSocket = socketId => {
    for (let room of rooms.values()) {
      if (room.members.get(socketId)) return room
    }
    return null
  }

  const createRoom = ({ socketId, roomId, desktop }) => {
    const member = { id: socketId, desktop: desktop }
    const exitsingRoom = getRoomByMemberSocket(socketId)
    if (exitsingRoom) {
      leaveRoom({ socketId, roomId: exitsingRoom.id })
      console.log(colors.yellow(`Left ${exitsingRoom.id}`))
    }
    if (rooms.has(roomId)) {
      rooms.get(roomId).members.set(socketId, member)
    } else {
      rooms.set(roomId, {
        id: roomId,
        members: new Map(),
      })
      rooms.get(roomId).members.set(socketId, member)

      console.log(colors.green(`Broadcast room:get ${roomId}`))
    }
    console.log(
      `members in romm ${roomId}: ${rooms.get(roomId).members.size}`
    )
    console.log(rooms.values())
    io.sockets.emit("rooms:get", getAvailableRoomIdsToJoin())
  }

  const leaveRoom = ({ socketId, roomId }) => {
    if (rooms.has(roomId)) {
      let room = rooms.get(roomId)
      room.members.delete(socketId)
      console.log(
        colors.green(
          `member ${socketId} has left room ${roomId}. members left: ${
            room.members.size
          }`
        )
      )
      destroyRoomIfNoMembers({ room, roomId })
      io.sockets.emit("rooms:get", getAvailableRoomIdsToJoin())
    } else {
      console.log(`trying to leaveRoom ${roomId} but it doesnt exist`)
    }
  }

  const destroyRoomIfNoMembers = ({ room, roomId }) => {
    if (!room.members) return
    if (!room.members.size) {
      room.members.clear()
      room.members = null
      rooms.delete(roomId)
      console.log(`room destroyed: ${roomId}`)
    }
  }

  const orderGeolocations = function*(map) {
    yield* [...map.entries()].sort((a, b) => a[1] - b[1])
  }

  io.on("connection", function(socket) {
    sockets.set(socket.id, socket)
    users.set(socket.id, {
      id: socket.id,
    })
    userIds.add(socket.id)
    console.log(colors.green(`Connection id ${socket.id}`))
    socket.emit("handshake", { id: socket.id })

    socket.on("disconnect", function() {
      users.delete(socket.id)
      sockets.delete(socket.id)
      for (let room of rooms.values()) {
        leaveRoom({ socketId: socket.id, roomId: room.id })
        destroyRoomIfNoMembers({ room, roomId: room.id })
      }

      userIds.delete(socket.id)
      userApi.userDisconnection(socket.id)

      console.log(colors.green(`Room remaining: ${rooms.size}`))
      forIn(socket._events, (val, key) => {
        if (isFunction(val)) {
          socket.removeListener(key, val)
          val = null
        }
      })
      console.log(colors.red(`Disconnected id ${socket.id}`))
      console.log(colors.yellow(`Users remaining ${userIds.size}`))
    })

    socket.on("handshake", data => socket.emit("user:id", sockets.id))

    socket.on("users:get:id", () => {
      socket.emit("users:get:id", Array.from(sockets.keys()))
    })

    socket.on("room:create", ({ roomId, desktop }) => {
      createRoom({ socketId: socket.id, roomId, desktop })
    })
    //******

    //******

    socket.on("room:leave", function({ roomId }) {
      leaveRoom({ socketId: socket.id, roomId })
    })
    //******

    socket.on("rooms:get", function() {
      socket.emit("rooms:get", getAvailableRoomIdsToJoin())
    })

    socket.on("rooms:canJoin", function({ roomId, desktop }) {
      socket.emit("rooms:canJoin", {
        canJoin: true,
        members: rooms.get(roomId).members.size,
      })
    })

    userApi.userConnection(socket.id)

  })
}

module.exports = Sockets
