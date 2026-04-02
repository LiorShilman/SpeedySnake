// Pure game logic extracted from gameStore.js - runs on the server
// No Zustand, no browser APIs - just pure functions

import { LEVELS, LEVEL_INFO, BOARD_WIDTH, BOARD_HEIGHT, SPEED_LEVELS } from './levels.js';

const CELL = {
  BLANK: 0, WALL: 1, FOOD: 9, FIRE: 5,
  PORTAL_A: 7, PORTAL_B: 8,
  SHIELD: 11, MAGNET: 12, SLOWMO: 13, SCORE_ZONE: 14,
};

const PLAYER_BODY = [50, 51];
const PLAYER_HEAD = [100, 101];
const ALL_SNAKE_CELLS = new Set([50, 51, 100, 101]);
const PLAYER_HUES = [0.33, 0.7];

const DIR = {
  UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 },
};

function deepCopyBoard(level) {
  return level.map(row => [...row]);
}

function getRandomEmptyCell(board, excludeSnakes = []) {
  const snakeSet = new Set();
  for (const snake of excludeSnakes) {
    for (const s of snake) snakeSet.add(`${s.x},${s.y}`);
  }
  const empty = [];
  for (let y = 1; y < BOARD_HEIGHT - 1; y++) {
    for (let x = 1; x < BOARD_WIDTH - 1; x++) {
      if (board[y][x] === CELL.BLANK && !snakeSet.has(`${x},${y}`)) {
        empty.push({ x, y });
      }
    }
  }
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

function createSnake(head, tail, direction) {
  const segments = [];
  if (direction.x !== 0) {
    const step = Math.sign(head.x - tail.x);
    for (let x = tail.x; x !== head.x + step; x += step) {
      segments.push({ x, y: head.y });
    }
  } else {
    const step = Math.sign(head.y - tail.y);
    for (let y = tail.y; y !== head.y + step; y += step) {
      segments.push({ x: head.x, y });
    }
  }
  return segments;
}

function dist(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function createPlayer(snake, direction, hue) {
  return {
    snake,
    prevSnake: snake.map(s => ({ ...s })),
    direction: { ...direction },
    nextDirection: { ...direction },
    score: 0,
    foodEaten: 0,
    hasFire: false,
    hasShield: false,
    shieldHits: 0,
    hasMagnet: false,
    magnetTimer: 0,
    isSlowMo: false,
    slowMoTimer: 0,
    scoreMultiplier: 1,
    alive: true,
    trail: [],
    colorHue: hue,
  };
}

function getAllSnakes(players) {
  return Object.values(players).filter(p => p.alive).map(p => p.snake);
}

export function initializeLevel(levelNum, difficulty) {
  const levelIdx = levelNum - 1;
  const info = LEVEL_INFO[levelIdx];
  const board = deepCopyBoard(LEVELS[levelIdx]);

  const snake1 = createSnake(info.head, info.tail, info.direction);
  snake1.forEach((seg, i) => {
    board[seg.y][seg.x] = i === snake1.length - 1 ? PLAYER_HEAD[0] : PLAYER_BODY[0];
  });

  const snake2 = createSnake(info.p2head, info.p2tail, info.p2direction);
  snake2.forEach((seg, i) => {
    board[seg.y][seg.x] = i === snake2.length - 1 ? PLAYER_HEAD[1] : PLAYER_BODY[1];
  });

  const players = {
    0: createPlayer(snake1, info.direction, PLAYER_HUES[0]),
    1: createPlayer(snake2, info.p2direction, PLAYER_HUES[1]),
  };

  const allSnakes = getAllSnakes(players);
  const foodPos = getRandomEmptyCell(board, allSnakes);
  if (foodPos) board[foodPos.y][foodPos.x] = CELL.FOOD;

  let portalA = null, portalB = null;
  if (levelNum >= 2) {
    portalA = getRandomEmptyCell(board, allSnakes);
    if (portalA) {
      board[portalA.y][portalA.x] = CELL.PORTAL_A;
      portalB = getRandomEmptyCell(board, allSnakes);
      if (portalB) board[portalB.y][portalB.x] = CELL.PORTAL_B;
    }
  }

  const scoreZones = [];
  const numZones = Math.min(levelNum, 4);
  for (let i = 0; i < numZones; i++) {
    const pos = getRandomEmptyCell(board, allSnakes);
    if (pos) {
      board[pos.y][pos.x] = CELL.SCORE_ZONE;
      scoreZones.push(pos);
    }
  }

  return {
    gameState: 'playing',
    board,
    food: foodPos,
    firePickup: null,
    portalA, portalB,
    powerupOnBoard: null,
    scoreZones,
    players,
    level: levelNum,
    difficulty,
    particles: [],
    screenShake: 0,
    risingWalls: [],
    nearMiss: false,
    nearMissTimer: 0,
    winner: null,
    // No boss in online mode
    bossSnake: [], prevBossSnake: [],
    bossDirection: { ...DIR.LEFT },
    bossActive: false, bossAlive: false,
  };
}

function tickPlayer(playerId, board, sharedState, player, state) {
  if (!player || !player.alive) return null;

  const dir = player.nextDirection;
  const info = LEVEL_INFO[state.level - 1];
  const { snake } = player;
  const head = snake[snake.length - 1];
  let newHead = { x: head.x + dir.x, y: head.y + dir.y };

  if (newHead.x < 0 || newHead.x >= BOARD_WIDTH || newHead.y < 0 || newHead.y >= BOARD_HEIGHT) {
    return { died: true, playerId };
  }

  let cellVal = board[newHead.y][newHead.x];

  if (cellVal === CELL.PORTAL_A && state.portalB) {
    newHead = { x: state.portalB.x, y: state.portalB.y };
    cellVal = CELL.BLANK;
    sharedState.particles.push({ x: state.portalA.x, y: state.portalA.y, type: 'portal', life: 1, id: Math.random() });
  } else if (cellVal === CELL.PORTAL_B && state.portalA) {
    newHead = { x: state.portalA.x, y: state.portalA.y };
    cellVal = CELL.BLANK;
    sharedState.particles.push({ x: state.portalB.x, y: state.portalB.y, type: 'portal', life: 1, id: Math.random() });
  }

  if (cellVal === CELL.WALL || ALL_SNAKE_CELLS.has(cellVal)) {
    if (player.hasShield && player.shieldHits > 0) {
      const newHits = player.shieldHits - 1;
      sharedState.particles.push({ x: head.x, y: head.y, type: 'shieldBreak', life: 1, id: Math.random() });
      return { shieldUsed: true, playerId, newHits };
    }
    return { died: true, playerId };
  }

  let nearMiss = false;
  for (const d of [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT]) {
    if (d.x === -dir.x && d.y === -dir.y) continue;
    const nx = newHead.x + d.x, ny = newHead.y + d.y;
    if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < BOARD_HEIGHT) {
      const adj = board[ny][nx];
      if (adj === CELL.WALL || ALL_SNAKE_CELLS.has(adj)) { nearMiss = true; break; }
    }
  }

  let ateFood = false, ateFire = false;
  let scoreAdd = 0;
  let newFoodEaten = player.foodEaten;
  let newHasFire = player.hasFire;
  let newHasShield = player.hasShield;
  let newShieldHits = player.shieldHits;
  let newHasMagnet = player.hasMagnet;
  let newMagnetTimer = player.magnetTimer;
  let newIsSlowMo = player.isSlowMo;
  let newSlowMoTimer = player.slowMoTimer;
  let newScoreMultiplier = player.scoreMultiplier;
  let growFromZone = false;

  if (cellVal === CELL.SCORE_ZONE) {
    newScoreMultiplier *= 2;
    growFromZone = true;
    sharedState.particles.push({ x: newHead.x, y: newHead.y, type: 'scoreZone', life: 1, id: Math.random() });
  }

  const scoreMultiplier = newScoreMultiplier;

  if (newMagnetTimer > 0) { newMagnetTimer--; if (newMagnetTimer <= 0) newHasMagnet = false; }
  if (newSlowMoTimer > 0) { newSlowMoTimer--; if (newSlowMoTimer <= 0) newIsSlowMo = false; }

  if (newHasMagnet && sharedState.food) {
    const d = dist(newHead, sharedState.food);
    if (d <= 6 && d > 1) {
      const dx = Math.sign(newHead.x - sharedState.food.x);
      const dy = Math.sign(newHead.y - sharedState.food.y);
      const tx = sharedState.food.x + dx, ty = sharedState.food.y + dy;
      if (tx >= 0 && tx < BOARD_WIDTH && ty >= 0 && ty < BOARD_HEIGHT) {
        if (board[ty][tx] === CELL.BLANK || board[ty][tx] === CELL.SCORE_ZONE) {
          board[sharedState.food.y][sharedState.food.x] = CELL.BLANK;
          board[ty][tx] = CELL.FOOD;
          sharedState.food = { x: tx, y: ty };
        }
      }
    }
  }

  if (cellVal === CELL.SHIELD) {
    newHasShield = true; newShieldHits = 2; sharedState.powerupOnBoard = null;
    sharedState.particles.push({ x: newHead.x, y: newHead.y, type: 'shieldPickup', life: 1, id: Math.random() });
  }
  if (cellVal === CELL.MAGNET) {
    newHasMagnet = true; newMagnetTimer = 30; sharedState.powerupOnBoard = null;
    sharedState.particles.push({ x: newHead.x, y: newHead.y, type: 'magnetPickup', life: 1, id: Math.random() });
  }
  if (cellVal === CELL.SLOWMO) {
    newIsSlowMo = true; newSlowMoTimer = 20; sharedState.powerupOnBoard = null;
    sharedState.particles.push({ x: newHead.x, y: newHead.y, type: 'slowmoPickup', life: 1, id: Math.random() });
  }

  if (cellVal === CELL.FOOD) {
    ateFood = true;
    scoreAdd = info.scorePerFood * scoreMultiplier;
    newFoodEaten += 1;

    const now = Date.now();
    const combo = (now - (sharedState.lastEatTime || 0) < 3000) ? (sharedState.comboCount || 0) + 1 : 1;
    if (combo > 1) scoreAdd += combo * 2 * scoreMultiplier;
    sharedState.comboCount = combo;
    sharedState.lastEatTime = now;

    sharedState.particles.push({
      x: newHead.x, y: newHead.y, type: 'eat', life: 1.0, id: Math.random(),
    });

    if (newFoodEaten >= info.maxFood) {
      sharedState.levelComplete = true;
    }

    const allSnakes = getAllSnakes(state.players);
    board[newHead.y][newHead.x] = CELL.BLANK;
    const newFood = getRandomEmptyCell(board, allSnakes);
    if (newFood) board[newFood.y][newFood.x] = CELL.FOOD;
    sharedState.food = newFood;

    if (newFoodEaten % info.foodToFire === 0 && !sharedState.firePickup && !player.hasFire) {
      if (state.difficulty > 0 || state.level >= 3) {
        const firePos = getRandomEmptyCell(board, allSnakes);
        if (firePos) {
          board[firePos.y][firePos.x] = CELL.FIRE;
          sharedState.firePickup = firePos;
        }
      }
    }

    if (newFoodEaten % 7 === 0 && !sharedState.powerupOnBoard) {
      const types = [CELL.SHIELD, CELL.MAGNET, CELL.SLOWMO];
      const type = types[Math.floor(Math.random() * types.length)];
      const pos = getRandomEmptyCell(board, allSnakes);
      if (pos) {
        board[pos.y][pos.x] = type;
        sharedState.powerupOnBoard = { type, pos };
      }
    }

    if (state.difficulty > 0 && newFoodEaten % 5 === 0) {
      const wallPos = getRandomEmptyCell(board, allSnakes);
      if (wallPos) {
        board[wallPos.y][wallPos.x] = CELL.WALL;
        sharedState.risingWalls.push({ x: wallPos.x, y: wallPos.y, progress: 0, id: Math.random() });
      }
    }
  }

  if (cellVal === CELL.FIRE) {
    ateFire = true;
    newHasFire = true;
    sharedState.firePickup = null;
    sharedState.particles.push({ x: newHead.x, y: newHead.y, type: 'fire', life: 1.0, id: Math.random() });
  }

  const bodyCode = PLAYER_BODY[playerId];
  const headCode = PLAYER_HEAD[playerId];
  const newSnake = [...snake, newHead];
  if (!ateFood && !ateFire && !growFromZone) {
    const tail = newSnake.shift();
    board[tail.y][tail.x] = CELL.BLANK;
  }
  board[head.y][head.x] = bodyCode;
  board[newHead.y][newHead.x] = headCode;

  const newTrail = [
    { x: head.x, y: head.y, life: 1.0, id: Math.random() },
    ...player.trail.map(t => ({ ...t, life: t.life - 0.06 })).filter(t => t.life > 0),
  ];

  return {
    playerId,
    died: false,
    nearMiss,
    updatedPlayer: {
      ...player,
      prevSnake: snake.map(s => ({ ...s })),
      snake: newSnake,
      direction: dir,
      nextDirection: dir,
      score: player.score + scoreAdd,
      foodEaten: newFoodEaten,
      hasFire: newHasFire,
      hasShield: newHasShield,
      shieldHits: newShieldHits,
      hasMagnet: newHasMagnet,
      magnetTimer: newMagnetTimer,
      isSlowMo: newIsSlowMo,
      slowMoTimer: newSlowMoTimer,
      scoreMultiplier: newScoreMultiplier,
      trail: newTrail,
    },
  };
}

function shootFirePure(playerId, state) {
  const player = state.players[playerId];
  if (!player || !player.hasFire || !player.alive) return null;

  const head = player.snake[player.snake.length - 1];
  const dir = player.direction;
  const board = state.board.map(r => [...r]);
  const newParticles = [...state.particles];
  let food = state.food;

  let px = head.x + dir.x, py = head.y + dir.y;
  while (px >= 0 && px < BOARD_WIDTH && py >= 0 && py < BOARD_HEIGHT) {
    if (board[py][px] === CELL.WALL) {
      board[py][px] = CELL.BLANK;
      newParticles.push({ x: px, y: py, type: 'explosion', life: 1.0, id: Math.random() });
    } else if (board[py][px] === CELL.FOOD) {
      board[py][px] = CELL.BLANK;
      const allSnakes = getAllSnakes(state.players);
      const newFood = getRandomEmptyCell(board, allSnakes);
      if (newFood) board[newFood.y][newFood.x] = CELL.FOOD;
      food = newFood;
    }
    newParticles.push({ x: px, y: py, type: 'fireBeam', life: 0.8, id: Math.random() });
    px += dir.x;
    py += dir.y;
  }

  return {
    board,
    food,
    particles: newParticles,
    screenShake: 0.5,
    playerUpdate: { hasFire: false },
  };
}

export function gameTick(state, speed) {
  if (state.gameState !== 'playing') return state;

  const board = state.board.map(r => [...r]);
  const sharedState = {
    particles: [...state.particles],
    food: state.food,
    firePickup: state.firePickup,
    powerupOnBoard: state.powerupOnBoard,
    risingWalls: [...state.risingWalls],
    comboCount: 0,
    lastEatTime: 0,
    levelComplete: false,
  };

  const newPlayers = { ...state.players };
  let anyNearMiss = false;
  const deadPlayers = [];

  const playerIds = Object.keys(newPlayers).map(Number);
  for (let i = playerIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
  }

  for (const pid of playerIds) {
    if (!newPlayers[pid].alive) continue;

    const result = tickPlayer(pid, board, sharedState, newPlayers[pid], state);
    if (!result) continue;

    if (result.died) {
      deadPlayers.push(pid);
      for (const seg of newPlayers[pid].snake) {
        if (board[seg.y] && board[seg.y][seg.x] !== undefined) {
          const val = board[seg.y][seg.x];
          if (val === PLAYER_BODY[pid] || val === PLAYER_HEAD[pid]) {
            board[seg.y][seg.x] = CELL.BLANK;
          }
        }
      }
      newPlayers[pid] = { ...newPlayers[pid], alive: false };
      sharedState.particles.push(
        ...newPlayers[pid].snake.map(s => ({ x: s.x, y: s.y, type: 'explosion', life: 1, id: Math.random() }))
      );
    } else if (result.shieldUsed) {
      newPlayers[pid] = {
        ...newPlayers[pid],
        hasShield: result.newHits > 0,
        shieldHits: result.newHits,
      };
    } else {
      newPlayers[pid] = result.updatedPlayer;
      if (result.nearMiss) anyNearMiss = true;
    }
  }

  // Level complete
  if (sharedState.levelComplete) {
    const nextLevel = (state.level % 6) + 1;
    const nextSpeed = nextLevel === 1 ? Math.min(speed + 1, 6) : speed;
    return {
      ...state,
      gameState: 'levelComplete',
      players: newPlayers,
      level: nextLevel,
      speed: nextSpeed,
      particles: sharedState.particles,
      board,
    };
  }

  // Game over checks
  const alivePlayers = Object.entries(newPlayers).filter(([_, p]) => p.alive);
  if (alivePlayers.length === 0) {
    return { ...state, gameState: 'gameOver', players: newPlayers, winner: null, screenShake: 1.0, board };
  }
  if (deadPlayers.length > 0 && alivePlayers.length <= 1) {
    const winnerId = alivePlayers.length === 1 ? Number(alivePlayers[0][0]) : null;
    return { ...state, gameState: 'gameOver', players: newPlayers, winner: winnerId, screenShake: 1.0, board };
  }

  // Decay particles
  sharedState.particles = sharedState.particles
    .map(p => ({ ...p, life: p.life - 0.05 }))
    .filter(p => p.life > 0);

  sharedState.risingWalls = sharedState.risingWalls
    .map(w => ({ ...w, progress: Math.min(1, w.progress + 0.1) }))
    .filter(w => w.progress < 1);

  const newShake = Math.max(0, state.screenShake - 0.1);

  return {
    ...state,
    players: newPlayers,
    board,
    food: sharedState.food,
    firePickup: sharedState.firePickup,
    powerupOnBoard: sharedState.powerupOnBoard,
    particles: sharedState.particles,
    screenShake: deadPlayers.length > 0 ? 1.0 : newShake,
    risingWalls: sharedState.risingWalls,
    nearMiss: anyNearMiss,
    nearMissTimer: anyNearMiss ? 15 : Math.max(0, state.nearMissTimer - 1),
  };
}

export function handleShootFire(playerId, state) {
  const result = shootFirePure(playerId, state);
  if (!result) return state;
  return {
    ...state,
    board: result.board,
    food: result.food,
    particles: result.particles,
    screenShake: result.screenShake,
    players: {
      ...state.players,
      [playerId]: { ...state.players[playerId], ...result.playerUpdate },
    },
  };
}

export function handleSetDirection(playerId, dir, state) {
  const player = state.players[playerId];
  if (!player || !player.alive) return state;
  if (player.direction.x + dir.x === 0 && player.direction.y + dir.y === 0) return state;
  return {
    ...state,
    players: {
      ...state.players,
      [playerId]: { ...player, nextDirection: { ...dir } },
    },
  };
}

export function getTickRate(state, speed) {
  const base = SPEED_LEVELS[speed - 1] || 300;
  const anySlowMo = Object.values(state.players).some(p => p.alive && p.isSlowMo);
  if (anySlowMo) return base * 1.8;
  if (state.nearMissTimer > 0) return base * 1.3;
  return base;
}

export { SPEED_LEVELS };
