import { io } from 'socket.io-client';

/**
 * Single shared Socket.IO connection for the whole app.
 *
 * The server lives at the API host (without the `/v1` API path), so we derive
 * the socket origin from VITE_API_BASE_URL unless VITE_SOCKET_URL overrides it.
 */
let socket = null;

function socketUrl() {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit) return explicit;
  const base = import.meta.env.VITE_API_BASE_URL;
  try {
    return new URL(base).origin;
  } catch {
    return base;
  }
}

export function getSocket() {
  return socket;
}

/**
 * Connect (or reuse) the shared socket, authenticating with the given token.
 * Safe to call repeatedly — it updates the auth token and ensures the socket
 * is connected.
 */
export function connectSocket(token) {
  if (!token) return null;

  if (socket) {
    // Refresh the token in case the session changed, then ensure we're live.
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(socketUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
