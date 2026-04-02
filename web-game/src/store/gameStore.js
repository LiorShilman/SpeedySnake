import { create } from 'zustand';
import { LEVELS, LEVEL_INFO, BOARD_WIDTH, BOARD_HEIGHT, SPEED_LEVELS } from '../data/levels';

const CELL = {
  BLANK: 0,
  WALL: 1,
  FOOD: 9,
  FIRE: 5,
  PORTAL_A: 7,
  PORTAL_B: 8,
  SHIELD: 11,
  MAGNET: 12,
  SLOWMO: 13,
  SCORE_ZONE: 14,
};

// Board cell encoding per player
const PLAYER_BODY = [50, 51];  // P1=50, P2=51
const PLAYER_HEAD = [100, 101]; // P1=100, P2=101
const ALL_SNAKE_CELLS = new Set([50, 51, 100, 101]);

export { CELL };

const DIR = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const LEVEL_THEMES = [
  { primary: '#4466ff', secondary: '#00ff88', bg: '#050510', wallColor: '#2244aa', wallEmissive: '#3355ff', name: 'Neon Blue' },
  { primary: '#ff44aa', secondary: '#ffaa00', bg: '#0a0508', wallColor: '#882244', wallEmissive: '#cc3366', name: 'Cyber Pink' },
  { primary: '#00ffcc', secondary: '#44ff44', bg: '#020a08', wallColor: '#116655', wallEmissive: '#22ccaa', name: 'Matrix Green' },
  { primary: '#ff6600', secondary: '#ffcc00', bg: '#0a0500', wallColor: '#884400', wallEmissive: '#cc6600', name: 'Lava' },
  { primary: '#aa44ff', secondary: '#ff44ff', bg: '#08020a', wallColor: '#552288', wallEmissive: '#8844cc', name: 'Void Purple' },
  { primary: '#ff2244', secondary: '#ff8844', bg: '#0a0202', wallColor: '#881122', wallEmissive: '#cc2244', name: 'Inferno' },
];

// Player color hues
const PLAYER_HUES = [0.33, 0.7]; // P1 green, P2 blue-purple
export { PLAYER_HUES };

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

export const useGameStore = create((set, get) => ({
  // Mode
  mode: 'single', // 'single' | 'versus' | 'online'

  // Game state
  gameState: 'menu', // 'menu' | 'lobby' | 'playing' | 'paused' | 'gameOver' | 'levelComplete'
  board: null,
  tickTimestamp: 0,
  food: null,
  firePickup: null,
  portalA: null,
  portalB: null,
  powerupOnBoard: null,
  scoreZones: [],

  // Players map
  players: {},

  // Boss
  bossSnake: [],
  prevBossSnake: [],
  bossDirection: { ...DIR.LEFT },
  bossActive: false,
  bossAlive: false,

  // Stats
  level: 1,
  speed: 1,
  difficulty: 0,
  highScore: parseInt(localStorage.getItem('snakeHighScore') || '0'),

  // Visual effects
  particles: [],
  screenShake: 0,
  risingWalls: [],
  nearMiss: false,
  nearMissTimer: 0,

  // Level transition
  showLevelBanner: false,

  // Leaderboard / Replay
  leaderboard: JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]'),
  replayData: [],
  isRecording: false,
  bestReplay: JSON.parse(localStorage.getItem('snakeBestReplay') || 'null'),

  // Winner (for versus/online)
  winner: null,

  // Online multiplayer
  roomCode: null,
  myPlayerId: null,
  connected: false,
  opponentConnected: false,
  lobbyStatus: null, // 'waiting' | 'joined'
  onlineError: null,

  setDifficulty: (d) => set({ difficulty: d }),
  setSpeed: (s) => set({ speed: s }),
  setMode: (m) => set({ mode: m }),

  startGame: () => {
    const state = get();
    const levelIdx = 0;
    const info = LEVEL_INFO[levelIdx];
    const board = deepCopyBoard(LEVELS[levelIdx]);

    // Create P1
    const snake1 = createSnake(info.head, info.tail, info.direction);
    snake1.forEach((seg, i) => {
      board[seg.y][seg.x] = i === snake1.length - 1 ? PLAYER_HEAD[0] : PLAYER_BODY[0];
    });

    const players = {
      0: createPlayer(snake1, info.direction, PLAYER_HUES[0]),
    };

    // Create P2 in versus mode
    if (state.mode === 'versus') {
      const snake2 = createSnake(info.p2head, info.p2tail, info.p2direction);
      snake2.forEach((seg, i) => {
        board[seg.y][seg.x] = i === snake2.length - 1 ? PLAYER_HEAD[1] : PLAYER_BODY[1];
      });
      players[1] = createPlayer(snake2, info.p2direction, PLAYER_HUES[1]);
    }

    const allSnakes = getAllSnakes(players);
    const foodPos = getRandomEmptyCell(board, allSnakes);
    if (foodPos) board[foodPos.y][foodPos.x] = CELL.FOOD;

    const scoreZones = [];
    for (let i = 0; i < 2; i++) {
      const pos = getRandomEmptyCell(board, allSnakes);
      if (pos) {
        board[pos.y][pos.x] = CELL.SCORE_ZONE;
        scoreZones.push(pos);
      }
    }

    set({
      gameState: 'playing',
      board,
      tickTimestamp: performance.now(),
      food: foodPos,
      firePickup: null,
      portalA: null, portalB: null,
      powerupOnBoard: null,
      scoreZones,
      players,
      bossSnake: [], prevBossSnake: [],
      bossDirection: { ...DIR.LEFT },
      bossActive: false, bossAlive: false,
      level: 1,
      particles: [],
      screenShake: 0,
      risingWalls: [],
      nearMiss: false, nearMissTimer: 0,
      showLevelBanner: false,
      winner: null,
      replayData: [],
      isRecording: true,
    });
  },

  startLevel: (levelNum) => {
    const state = get();
    const levelIdx = levelNum - 1;
    const info = LEVEL_INFO[levelIdx];
    const board = deepCopyBoard(LEVELS[levelIdx]);

    const snake1 = createSnake(info.head, info.tail, info.direction);
    snake1.forEach((seg, i) => {
      board[seg.y][seg.x] = i === snake1.length - 1 ? PLAYER_HEAD[0] : PLAYER_BODY[0];
    });

    const players = {
      0: createPlayer(snake1, info.direction, PLAYER_HUES[0]),
    };

    if (state.mode === 'versus') {
      const snake2 = createSnake(info.p2head, info.p2tail, info.p2direction);
      snake2.forEach((seg, i) => {
        board[seg.y][seg.x] = i === snake2.length - 1 ? PLAYER_HEAD[1] : PLAYER_BODY[1];
      });
      players[1] = createPlayer(snake2, info.p2direction, PLAYER_HUES[1]);
    }

    const allSnakes = getAllSnakes(players);
    const foodPos = getRandomEmptyCell(board, allSnakes);
    if (foodPos) board[foodPos.y][foodPos.x] = CELL.FOOD;

    // Portals on levels >= 2
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

    // Boss on levels 3, 6 (only in single player)
    let bossSnake = [];
    let bossActive = false, bossAlive = false;
    if (state.mode === 'single' && (levelNum === 3 || levelNum === 6)) {
      const bossHead = { x: 15, y: 2 };
      for (let bx = bossHead.x + 5; bx >= bossHead.x; bx--) {
        bossSnake.push({ x: bx, y: bossHead.y });
      }
      bossActive = true;
      bossAlive = true;
    }

    set({
      gameState: 'playing',
      board,
      tickTimestamp: performance.now(),
      food: foodPos,
      firePickup: null,
      portalA, portalB,
      powerupOnBoard: null,
      scoreZones,
      players,
      bossSnake,
      prevBossSnake: bossSnake.map(s => ({ ...s })),
      bossDirection: { ...DIR.LEFT },
      bossActive, bossAlive,
      particles: [],
      screenShake: 0,
      risingWalls: [],
      nearMiss: false, nearMissTimer: 0,
      showLevelBanner: false,
      winner: null,
    });
  },

  setDirection: (playerId, dir) => {
    const state = get();
    if (state.gameState !== 'playing') return;
    const player = state.players[playerId];
    if (!player || !player.alive) return;
    if (player.direction.x + dir.x === 0 && player.direction.y + dir.y === 0) return;
    set({
      players: {
        ...state.players,
        [playerId]: { ...player, nextDirection: { ...dir } },
      },
    });
  },

  togglePause: () => {
    const state = get();
    if (state.gameState === 'playing') set({ gameState: 'paused' });
    else if (state.gameState === 'paused') set({ gameState: 'playing' });
  },

  shootFire: (playerId) => {
    const state = get();
    if (state.gameState !== 'playing') return;
    const player = state.players[playerId];
    if (!player || !player.hasFire || !player.alive) return;

    const head = player.snake[player.snake.length - 1];
    const dir = player.direction;
    const board = state.board.map(r => [...r]);
    const destroyedWalls = [];
    const newParticles = [...state.particles];

    let px = head.x + dir.x, py = head.y + dir.y;
    while (px >= 0 && px < BOARD_WIDTH && py >= 0 && py < BOARD_HEIGHT) {
      if (board[py][px] === CELL.WALL) {
        board[py][px] = CELL.BLANK;
        destroyedWalls.push({ x: px, y: py });
      } else if (board[py][px] === CELL.FOOD) {
        board[py][px] = CELL.BLANK;
        const allSnakes = getAllSnakes(state.players);
        const newFood = getRandomEmptyCell(board, allSnakes);
        if (newFood) board[newFood.y][newFood.x] = CELL.FOOD;
        const updatedPlayer = { ...player, score: player.score + LEVEL_INFO[state.level - 1].scorePerFood };
        set(s => ({
          food: newFood,
          players: { ...s.players, [playerId]: { ...s.players[playerId], score: updatedPlayer.score } },
        }));
      }
      newParticles.push({ x: px, y: py, type: 'fireBeam', life: 0.8, id: Math.random() });
      px += dir.x;
      py += dir.y;
    }

    destroyedWalls.forEach(w => {
      newParticles.push({ x: w.x, y: w.y, type: 'explosion', life: 1.0, id: Math.random() });
    });

    set({
      board,
      particles: newParticles,
      screenShake: 0.5,
      players: {
        ...state.players,
        [playerId]: { ...state.players[playerId], hasFire: false },
      },
    });
  },

  moveBoss: () => {
    const state = get();
    if (!state.bossActive || !state.bossAlive || !state.food) return;
    const { bossSnake, food, board } = state;
    if (bossSnake.length === 0) return;

    const bossHead = bossSnake[bossSnake.length - 1];
    const possibleDirs = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT];
    let bestDir = state.bossDirection;
    let bestDist = Infinity;

    for (const d of possibleDirs) {
      if (d.x + state.bossDirection.x === 0 && d.y + state.bossDirection.y === 0) continue;
      const nx = bossHead.x + d.x, ny = bossHead.y + d.y;
      if (nx < 0 || nx >= BOARD_WIDTH || ny < 0 || ny >= BOARD_HEIGHT) continue;
      const cell = board[ny][nx];
      if (cell === CELL.WALL || ALL_SNAKE_CELLS.has(cell)) continue;
      if (bossSnake.some(s => s.x === nx && s.y === ny)) continue;
      const d2 = dist({ x: nx, y: ny }, food);
      if (d2 < bestDist) { bestDist = d2; bestDir = d; }
    }

    const newBossHead = { x: bossHead.x + bestDir.x, y: bossHead.y + bestDir.y };
    let ateFood = state.food && newBossHead.x === state.food.x && newBossHead.y === state.food.y;

    const newBossSnake = [...bossSnake, newBossHead];
    if (!ateFood) newBossSnake.shift();

    set({
      prevBossSnake: bossSnake.map(s => ({ ...s })),
      bossSnake: newBossSnake,
      bossDirection: bestDir,
    });

    if (ateFood) {
      const newBoard = state.board.map(r => [...r]);
      const allSnakes = getAllSnakes(state.players);
      const newFood = getRandomEmptyCell(newBoard, [...allSnakes, newBossSnake]);
      if (newFood) newBoard[newFood.y][newFood.x] = CELL.FOOD;
      set({ board: newBoard, food: newFood });
    }
  },

  // Process one player's movement for a tick
  tickPlayer: (playerId, board, sharedState) => {
    const state = get();
    const player = state.players[playerId];
    if (!player || !player.alive) return null;

    const dir = player.nextDirection;
    const info = LEVEL_INFO[state.level - 1];
    const { snake } = player;
    const head = snake[snake.length - 1];
    let newHead = { x: head.x + dir.x, y: head.y + dir.y };

    // Boundary
    if (newHead.x < 0 || newHead.x >= BOARD_WIDTH || newHead.y < 0 || newHead.y >= BOARD_HEIGHT) {
      return { died: true, playerId };
    }

    let cellVal = board[newHead.y][newHead.x];

    // Portal teleportation
    if (cellVal === CELL.PORTAL_A && state.portalB) {
      newHead = { x: state.portalB.x, y: state.portalB.y };
      cellVal = CELL.BLANK;
      sharedState.particles.push({ x: state.portalA.x, y: state.portalA.y, type: 'portal', life: 1, id: Math.random() });
    } else if (cellVal === CELL.PORTAL_B && state.portalA) {
      newHead = { x: state.portalA.x, y: state.portalA.y };
      cellVal = CELL.BLANK;
      sharedState.particles.push({ x: state.portalB.x, y: state.portalB.y, type: 'portal', life: 1, id: Math.random() });
    }

    // Collision with wall or any snake
    if (cellVal === CELL.WALL || ALL_SNAKE_CELLS.has(cellVal)) {
      if (player.hasShield && player.shieldHits > 0) {
        const newHits = player.shieldHits - 1;
        sharedState.particles.push({ x: head.x, y: head.y, type: 'shieldBreak', life: 1, id: Math.random() });
        return { shieldUsed: true, playerId, newHits };
      }
      return { died: true, playerId };
    }

    // Near-miss detection
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

    // Score zone: permanently doubles multiplier, but adds length as cost
    if (cellVal === CELL.SCORE_ZONE) {
      newScoreMultiplier *= 2;
      growFromZone = true;
      sharedState.particles.push({ x: newHead.x, y: newHead.y, type: 'scoreZone', life: 1, id: Math.random() });
    }

    const scoreMultiplier = newScoreMultiplier;

    // Decay timers
    if (newMagnetTimer > 0) { newMagnetTimer--; if (newMagnetTimer <= 0) newHasMagnet = false; }
    if (newSlowMoTimer > 0) { newSlowMoTimer--; if (newSlowMoTimer <= 0) newIsSlowMo = false; }

    // Magnet
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

    // Power-up pickups
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
        text: scoreMultiplier > 1 ? `x2! +${info.scorePerFood * 2}` : combo > 1 ? `x${combo}!` : `+${info.scorePerFood}`,
      });

      // Check level complete
      if (newFoodEaten >= info.maxFood) {
        sharedState.levelComplete = true;
        sharedState.levelCompletePlayerId = playerId;
      }

      // Respawn food
      const allSnakes = [];
      for (const p of Object.values(state.players)) {
        if (p.alive) allSnakes.push(p.snake);
      }
      board[newHead.y][newHead.x] = CELL.BLANK; // clear food before finding new spot
      const newFood = getRandomEmptyCell(board, allSnakes);
      if (newFood) board[newFood.y][newFood.x] = CELL.FOOD;
      sharedState.food = newFood;

      // Maybe spawn fire
      if (newFoodEaten % info.foodToFire === 0 && !sharedState.firePickup && !player.hasFire) {
        if (state.difficulty > 0 || state.level >= 3) {
          const firePos = getRandomEmptyCell(board, allSnakes);
          if (firePos) {
            board[firePos.y][firePos.x] = CELL.FIRE;
            sharedState.firePickup = firePos;
          }
        }
      }

      // Maybe spawn power-up
      if (newFoodEaten % 7 === 0 && !sharedState.powerupOnBoard) {
        const types = [CELL.SHIELD, CELL.MAGNET, CELL.SLOWMO];
        const type = types[Math.floor(Math.random() * types.length)];
        const pos = getRandomEmptyCell(board, allSnakes);
        if (pos) {
          board[pos.y][pos.x] = type;
          sharedState.powerupOnBoard = { type, pos };
        }
      }

      // Random wall
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

    // Move snake
    const bodyCode = PLAYER_BODY[playerId];
    const headCode = PLAYER_HEAD[playerId];
    const newSnake = [...snake, newHead];
    if (!ateFood && !ateFire && !growFromZone) {
      const tail = newSnake.shift();
      board[tail.y][tail.x] = CELL.BLANK;
    }
    board[head.y][head.x] = bodyCode;
    board[newHead.y][newHead.x] = headCode;

    // Trail
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
  },

  tick: () => {
    const state = get();
    if (state.gameState !== 'playing') return;

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
      levelCompletePlayerId: null,
    };

    const newPlayers = { ...state.players };
    let anyNearMiss = false;
    const deadPlayers = [];

    // Process each alive player
    const playerIds = Object.keys(newPlayers).map(Number);
    // Shuffle order for fairness
    for (let i = playerIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
    }

    for (const pid of playerIds) {
      if (!newPlayers[pid].alive) continue;

      const result = get().tickPlayer(pid, board, sharedState);
      if (!result) continue;

      if (result.died) {
        deadPlayers.push(pid);
        // Clear snake from board
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

    // Check level complete
    if (sharedState.levelComplete) {
      const nextLevel = (state.level % 6) + 1;
      const nextSpeed = nextLevel === 1 ? Math.min(state.speed + 1, 6) : state.speed;
      set({
        gameState: 'levelComplete',
        players: newPlayers,
        level: nextLevel,
        speed: nextSpeed,
        showLevelBanner: true,
        particles: sharedState.particles,
        board,
      });
      return;
    }

    // Check game over
    const alivePlayers = Object.entries(newPlayers).filter(([_, p]) => p.alive);
    if (alivePlayers.length === 0) {
      // All dead
      return get().handleGameOver(newPlayers);
    }
    if (state.mode === 'versus' && deadPlayers.length > 0 && alivePlayers.length <= 1) {
      // In versus, when only 1 left, they win
      const winnerId = alivePlayers.length === 1 ? Number(alivePlayers[0][0]) : null;
      return get().handleGameOver(newPlayers, winnerId);
    }

    // Decay particles
    sharedState.particles = sharedState.particles
      .map(p => ({ ...p, life: p.life - 0.05 }))
      .filter(p => p.life > 0);

    // Update rising walls
    sharedState.risingWalls = sharedState.risingWalls
      .map(w => ({ ...w, progress: Math.min(1, w.progress + 0.1) }))
      .filter(w => w.progress < 1);

    const newShake = Math.max(0, state.screenShake - 0.1);

    // Boss
    if (state.bossActive && state.bossAlive) {
      get().moveBoss();
    }

    set({
      players: newPlayers,
      tickTimestamp: performance.now(),
      board,
      food: sharedState.food,
      firePickup: sharedState.firePickup,
      powerupOnBoard: sharedState.powerupOnBoard,
      particles: sharedState.particles,
      screenShake: deadPlayers.length > 0 ? 1.0 : newShake,
      risingWalls: sharedState.risingWalls,
      nearMiss: anyNearMiss,
      nearMissTimer: anyNearMiss ? 15 : Math.max(0, state.nearMissTimer - 1),
    });
  },

  handleGameOver: (players, winnerId = null) => {
    const state = get();
    // Best score from all players
    const scores = Object.values(players).map(p => p.score);
    const bestScore = Math.max(...scores);
    const hs = Math.max(bestScore, state.highScore);
    localStorage.setItem('snakeHighScore', hs.toString());

    const lb = [...state.leaderboard, { score: bestScore, level: state.level, date: Date.now() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    localStorage.setItem('snakeLeaderboard', JSON.stringify(lb));

    set({
      gameState: 'gameOver',
      highScore: hs,
      screenShake: 1.0,
      leaderboard: lb,
      isRecording: false,
      players,
      winner: winnerId,
    });
  },

  getTickRate: () => {
    const state = get();
    const base = SPEED_LEVELS[state.speed - 1] || 300;
    // If any alive player has slow-mo, slow the game
    const anySlowMo = Object.values(state.players).some(p => p.alive && p.isSlowMo);
    if (anySlowMo) return base * 1.8;
    if (state.nearMissTimer > 0) return base * 1.3;
    return base;
  },

  returnToMenu: () => {
    set({ gameState: 'menu' });
  },
}));
