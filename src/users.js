const Users = function(io, sockets) {

  const userConnection = id => {
    io.sockets.emit("users:connection", id)
  }

  const userDisconnection = id => {
    io.sockets.emit("users:disconnection", id)
  }

  return {
    userConnection,
    userDisconnection,
  }
}

module.exports = Users
