import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GameRoom } from './gameRoom.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  path: '/SpeedySnake/socket.io',
});

// Serve static build in production
app.use(express.static(join(__dirname, '..', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

// Room management
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ234568'; // no I,O,0,1,7,9 for readability
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (rooms.has(code));
  return code;
}

function cleanupRoom(code) {
  const room = rooms.get(code);
  if (room) {
    room.destroy();
    rooms.delete(code);
    console.log(`Room ${code} destroyed. Active rooms: ${rooms.size}`);
  }
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  let currentRoom = null;
  let currentPlayerId = null;

  socket.on('create-room', ({ speed, difficulty }) => {
    // Leave any existing room
    if (currentRoom) {
      currentRoom.removePlayer(currentPlayerId);
      if (currentRoom.getPlayerCount() === 0) cleanupRoom(currentRoom.roomCode);
    }

    const code = generateRoomCode();
    const room = new GameRoom(code, io, { speed: speed || 1, difficulty: difficulty || 0 });
    rooms.set(code, room);

    const playerId = room.addPlayer(socket);
    currentRoom = room;
    currentPlayerId = playerId;
    socket.join(code);

    socket.emit('room-created', { roomCode: code, playerId });
    console.log(`Room ${code} created by ${socket.id}. Active rooms: ${rooms.size}`);
  });

  socket.on('join-room', ({ roomCode }) => {
    const code = roomCode.toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    if (room.getPlayerCount() >= 2) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    // Leave any existing room
    if (currentRoom) {
      currentRoom.removePlayer(currentPlayerId);
      if (currentRoom.getPlayerCount() === 0) cleanupRoom(currentRoom.roomCode);
    }

    const playerId = room.addPlayer(socket);
    currentRoom = room;
    currentPlayerId = playerId;
    socket.join(code);

    socket.emit('room-joined', { roomCode: code, playerId });

    // Notify the other player
    const otherPlayerId = playerId === 0 ? 1 : 0;
    if (room.sockets[otherPlayerId]) {
      room.sockets[otherPlayerId].emit('player-joined', { playerId });
    }

    console.log(`Player ${socket.id} joined room ${code} as P${playerId + 1}`);
  });

  socket.on('start-game', () => {
    if (!currentRoom) return;
    if (currentPlayerId !== 0) {
      socket.emit('error', { message: 'Only the room creator can start' });
      return;
    }
    currentRoom.startGame();
  });

  socket.on('input', (input) => {
    if (!currentRoom || currentPlayerId === null) return;
    currentRoom.handleInput(currentPlayerId, input);
  });

  socket.on('play-again', () => {
    if (!currentRoom) return;
    if (currentRoom.getPlayerCount() === 2) {
      currentRoom.playAgain();
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (currentRoom) {
      currentRoom.removePlayer(currentPlayerId);
      if (currentRoom.getPlayerCount() === 0) {
        cleanupRoom(currentRoom.roomCode);
      }
    }
  });
});

const PORT = process.env.PORT || 28500;
httpServer.listen(PORT, () => {
  console.log(`Speedy Snake server running on port ${PORT}`);
});
