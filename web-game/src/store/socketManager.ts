import { io, Socket } from 'socket.io-client';
import { useGameStore } from './gameStore';

let socket: Socket | null = null;
let connectPromise: Promise<void> | null = null;

export function connectToServer(): Promise<void> {
  if (socket && socket.connected) return Promise.resolve();
  if (connectPromise) return connectPromise;

  connectPromise = new Promise<void>((resolve) => {
    const host = import.meta.env.DEV
      ? 'http://localhost:28500'
      : `${window.location.protocol}//${window.location.hostname}:28500`;
    socket = io(host, {
      path: '/SpeedySnake/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to server:', socket!.id);
      useGameStore.setState({ connected: true });
      resolve();
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      useGameStore.setState({ connected: false });
      connectPromise = null;
    });

    socket.on('room-created', ({ roomCode, playerId }: { roomCode: string; playerId: number }) => {
      useGameStore.setState({
        roomCode,
        myPlayerId: playerId,
        gameState: 'lobby',
        lobbyStatus: 'waiting',
      });
    });

    socket.on('room-joined', ({ roomCode, playerId }: { roomCode: string; playerId: number }) => {
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

    socket.on('game-state', (serverState: Record<string, unknown>) => {
      useGameStore.setState({
        ...serverState,
        tickTimestamp: performance.now(),
      });
    });

    socket.on('error', ({ message }: { message: string }) => {
      useGameStore.setState({ onlineError: message });
      setTimeout(() => useGameStore.setState({ onlineError: null }), 3000);
    });
  });

  return connectPromise;
}

export function disconnectFromServer() {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectPromise = null;
    useGameStore.setState({ connected: false, roomCode: null, myPlayerId: null });
  }
}

export async function createRoom(speed: number, difficulty: number) {
  await connectToServer();
  socket!.emit('create-room', { speed, difficulty });
}

export async function joinRoom(roomCode: string) {
  await connectToServer();
  socket!.emit('join-room', { roomCode });
}

export function sendInput(input: { type: string; dir?: { x: number; y: number } }) {
  if (socket && socket.connected) {
    socket.emit('input', input);
  }
}

export function sendStartGame() {
  if (socket && socket.connected) socket.emit('start-game');
}

export function sendPlayAgain() {
  if (socket && socket.connected) socket.emit('play-again');
}
