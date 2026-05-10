let _io = null;

const socketUtil = {
  /**
   * Initialise with the Socket.io server instance.
   * Called once from src/index.js after server starts.
   */
  init(io) {
    _io = io;
    console.log('🔌 Socket.io utility initialised');
  },

  /**
   * Get the Socket.io instance.
   * Returns null if not yet initialised.
   */
  get io() {
    return _io;
  },

  /**
   * Emit an event to all connected clients.
   */
  emit(event, data) {
    if (!_io) {
      console.warn(`Socket not initialised. Cannot emit "${event}"`);
      return;
    }
    _io.emit(event, data);
  },

  /**
   * Emit an event to a specific room.
   */
  emitToRoom(room, event, data) {
    if (!_io) return;
    _io.to(room).emit(event, data);
  },
};

module.exports = socketUtil;
