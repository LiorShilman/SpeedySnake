import { initializeLevel, gameTick, handleShootFire, handleSetDirection, getTickRate } from './gameLogic.js';

export class GameRoom {
  constructor(roomCode, io, settings = {}) {
    this.roomCode = roomCode;
    this.io = io;
    this.speed = settings.speed || 1;
    this.difficulty = settings.difficulty || 0;
    this.sockets = {}; // { 0: socket, 1: socket }
    this.state = null;
    this.tickTimer = null;
    this.idleTimeout = null;
    this.createdAt = Date.now();

    // Auto-destroy after 10 minutes idle
    this.resetIdleTimeout();
  }

  resetIdleTimeout() {
    if (this.idleTimeout) clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(() => this.destroy(), 10 * 60 * 1000);
  }

  getPlayerCount() {
    return Object.keys(this.sockets).length;
  }

  addPlayer(socket) {
    const playerId = this.sockets[0] ? 1 : 0;
    if (this.getPlayerCount() >= 2) return null;

    this.sockets[playerId] = socket;
    this.resetIdleTimeout();
    return playerId;
  }

  removePlayer(playerId) {
    delete this.sockets[playerId];
    this.stopTick();

    // Notify remaining player
    const remaining = Object.entries(this.sockets);
    if (remaining.length > 0) {
      remaining[0][1].emit('player-left', { playerId });
    }

    // If game was playing, end it
    if (this.state && this.state.gameState === 'playing') {
      const winnerId = remaining.length > 0 ? Number(remaining[0][0]) : null;
      this.state = { ...this.state, gameState: 'gameOver', winner: winnerId };
      this.broadcast('game-state', this.getClientState());
    }

    this.resetIdleTimeout();
  }

  getPlayerIdBySocket(socket) {
    for (const [id, s] of Object.entries(this.sockets)) {
      if (s.id === socket.id) return Number(id);
    }
    return null;
  }

  startGame() {
    if (this.getPlayerCount() < 2) return false;

    this.state = initializeLevel(1, this.difficulty);
    this.state.speed = this.speed;
    this.broadcast('game-state', this.getClientState());
    this.startTick();
    return true;
  }

  startLevel(levelNum) {
    this.state = initializeLevel(levelNum, this.difficulty);
    this.state.speed = this.speed;
    this.broadcast('game-state', this.getClientState());
    this.startTick();
  }

  handleInput(playerId, input) {
    if (!this.state || this.state.gameState !== 'playing') return;
    this.resetIdleTimeout();

    if (input.type === 'direction') {
      this.state = handleSetDirection(playerId, input.dir, this.state);
    } else if (input.type === 'fire') {
      this.state = handleShootFire(playerId, this.state);
      this.broadcast('game-state', this.getClientState());
    }
  }

  startTick() {
    this.stopTick();
    const loop = () => {
      if (!this.state || this.state.gameState !== 'playing') return;

      this.state = gameTick(this.state, this.speed);
      this.broadcast('game-state', this.getClientState());

      if (this.state.gameState === 'levelComplete') {
        this.stopTick();
        // Auto-start next level after 2.5s
        setTimeout(() => {
          if (this.state && this.state.gameState === 'levelComplete') {
            this.speed = this.state.speed;
            this.startLevel(this.state.level);
          }
        }, 2500);
        return;
      }

      if (this.state.gameState === 'gameOver') {
        this.stopTick();
        return;
      }

      const rate = getTickRate(this.state, this.speed);
      this.tickTimer = setTimeout(loop, rate);
    };

    const rate = getTickRate(this.state, this.speed);
    this.tickTimer = setTimeout(loop, rate);
  }

  stopTick() {
    if (this.tickTimer) {
      clearTimeout(this.tickTimer);
      this.tickTimer = null;
    }
  }

  playAgain() {
    this.startGame();
  }

  getClientState() {
    if (!this.state) return null;
    // Send everything the client needs to render
    return {
      gameState: this.state.gameState,
      board: this.state.board,
      players: this.state.players,
      food: this.state.food,
      firePickup: this.state.firePickup,
      portalA: this.state.portalA,
      portalB: this.state.portalB,
      powerupOnBoard: this.state.powerupOnBoard,
      scoreZones: this.state.scoreZones,
      particles: this.state.particles,
      screenShake: this.state.screenShake,
      risingWalls: this.state.risingWalls,
      nearMiss: this.state.nearMiss,
      nearMissTimer: this.state.nearMissTimer,
      level: this.state.level,
      speed: this.state.speed,
      winner: this.state.winner,
      bossSnake: this.state.bossSnake,
      prevBossSnake: this.state.prevBossSnake,
      bossDirection: this.state.bossDirection,
      bossActive: this.state.bossActive,
      bossAlive: this.state.bossAlive,
    };
  }

  broadcast(event, data) {
    for (const socket of Object.values(this.sockets)) {
      socket.emit(event, data);
    }
  }

  destroy() {
    this.stopTick();
    if (this.idleTimeout) clearTimeout(this.idleTimeout);
    for (const socket of Object.values(this.sockets)) {
      socket.emit('error', { message: 'Room closed' });
      socket.leave(this.roomCode);
    }
    this.sockets = {};
    this.state = null;
  }
}
