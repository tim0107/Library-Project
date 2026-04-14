let io = null;
const userSocketMap = {};

function initSocket(serverIo) {
  io = serverIo;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSocket, getIO, userSocketMap };
