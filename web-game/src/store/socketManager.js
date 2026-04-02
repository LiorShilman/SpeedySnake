import { io } from 'socket.io-client';
import { useGameStore } from './gameStore';

let socket = null;

export function connectToServer() {
  if (socket && socket.connected) return;

  // In dev, Vite proxy handles /socket.io -> localhost:3001
  // In prod, same origin serves both
  const url = import.meta.env.DEV ? 'http://localhost:3001' : undefined;
  socket = io(url, { transports: ['websocket', 'polling'] });

  socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
    useGameStore.setState({ connected: true });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    useGameStore.setState({ connected: false });
  });

  socket.on('room-created', ({ roomCode, playerId }) => {
    useGameStore.setState({
      roomCode,
      myPlayerId: playerId,
      gameState: 'lobby',
      lobbyStatus: 'waiting',
    });
  });

  socket.on('room-joined', ({ roomCode, playerId }) => {
    useGameStore.setState({
      roomCode,
      myPlayerId: playerId,
      gameState: 'lobby',
      lobbyStatus: 'joined',
    });
  });

  socket.on('player-joined', () => {
    useGameStore.setState({ opponentConnected: true });
  });

  socket.on('player-left', () => {
    useGameStore.setState({ opponentConnected: false });
  });

  socket.on('game-state', (serverState) => {
    // Push server state into the store with local tickTimestamp for interpolation
    useGameStore.setState({
      ...serverState,
      tickTimestamp: performance.now(),
    });
  });

  socket.on('error', ({ message }) => {
    useGameStore.setState({ onlineError: message });
    // Clear error after 3s
    setTimeout(() => useGameStore.setState({ onlineError: null }), 3000);
  });
}

export function disconnectFromServer() {
  if (socket) {
    socket.disconnect();
    socket = null;
    useGameStore.setState({ connected: false, roomCode: null, myPlayerId: null });
  }
}

export function createRoom(speed, difficulty) {
  if (!socket) connectToServer();
  socket.emit('create-room', { speed, difficulty });
}

export function joinRoom(roomCode) {
  if (!socket) connectToServer();
  socket.emit('join-room', { roomCode });
}

export function sendInput(input) {
  if (socket && socket.connected) {
    socket.emit('input', input);
  }
}

export function sendStartGame() {
  if (socket) socket.emit('start-game');
}

export function sendPlayAgain() {
  if (socket) socket.emit('play-again');
}
