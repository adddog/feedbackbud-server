const User = function(socket, sockets) {
  socket.on('user:message', function(action) {
    const { type, fromId, cbEvent, payload } = action
    const target = sockets.get(payload.id)

    if (!target) return

    const event = cbEvent
      ? cbEvent
      : payload.cbEvent
        ? payload.cbEvent
        : 'user:message:request'

    switch (type) {
      case 'SOCKET_REQ_PARTNER_CONFIRM': {
        return target.emit('user:message:request', {
          ...payload,
          type,
          fromId,
          cbEvent,
        })
      }
      case 'SOCKET_MSG_SEND_NO_REPLY': {
        return target.emit(event, { ...payload, type, fromId, cbEvent })
      }
    }
  })

  function destroy() {}

  return {
    destroy,
  }
}

module.exports = User
