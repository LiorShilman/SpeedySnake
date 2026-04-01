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

export { CELL };

const DIR = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Level color themes
export const LEVEL_THEMES = [
  { primary: '#4466ff', secondary: '#00ff88', bg: '#050510', wallColor: '#2244aa', wallEmissive: '#3355ff', name: 'Neon Blue' },
  { primary: '#ff44aa', secondary: '#ffaa00', bg: '#0a0508', wallColor: '#882244', wallEmissive: '#cc3366', name: 'Cyber Pink' },
  { primary: '#00ffcc', secondary: '#44ff44', bg: '#020a08', wallColor: '#116655', wallEmissive: '#22ccaa', name: 'Matrix Green' },
  { primary: '#ff6600', secondary: '#ffcc00', bg: '#0a0500', wallColor: '#884400', wallEmissive: '#cc6600', name: 'Lava' },
  { primary: '#aa44ff', secondary: '#ff44ff', bg: '#08020a', wallColor: '#552288', wallEmissive: '#8844cc', name: 'Void Purple' },
  { primary: '#ff2244', secondary: '#ff8844', bg: '#0a0202', wallColor: '#881122', wallEmissive: '#cc2244', name: 'Inferno' },
];

function deepCopyBoard(level) {
  return level.map(row => [...row]);
}

function getRandomEmptyCell(board, excludeSnake = []) {
  const empty = [];
  const snakeSet = new Set(excludeSnake.map(s => `${s.x},${s.y}`));
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

function createInitialSnake(info) {
  const segments = [];
  const headX = info.head.x;
  const tailX = info.tail.x;
  const y = info.head.y;
  for (let x = tailX; x <= headX; x++) {
    segments.push({ x, y });
  }
  return segments;
}

// Distance between two points on the grid
function dist(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export const useGameStore = create((set, get) => ({
  // Game state
  gameState: 'menu',
  board: null,
  snake: [],
  prevSnake: [],
  tickTimestamp: 0,
  direction: { ...DIR.RIGHT },
  nextDirection: { ...DIR.RIGHT },
  food: null,
  firePickup: null,
  hasFire: false,

  // Portals
  portalA: null,
  portalB: null,

  // Power-ups
  hasShield: false,
  shieldHits: 0,
  hasMagnet: false,
  magnetTimer: 0,
  isSlowMo: false,
  slowMoTimer: 0,
  powerupOnBoard: null, // { type, pos }

  // Score zones
  scoreZones: [],

  // Boss
  bossSnake: [],
  prevBossSnake: [],
  bossDirection: { ...DIR.LEFT },
  bossActive: false,
  bossAlive: false,

  // Trail
  trail: [], // { x, y, life, color }

  // Stats
  score: 0,
  level: 1,
  speed: 1,
  difficulty: 0,
  foodEaten: 0,
  highScore: parseInt(localStorage.getItem('snakeHighScore') || '0'),

  // Visual effects
  particles: [],
  screenShake: 0,
  comboCount: 0,
  lastEatTime: 0,
  nearMiss: false,
  nearMissTimer: 0,

  // Level transition
  showLevelBanner: false,

  // Animated walls (walls that are still "rising")
  risingWalls: [], // { x, y, progress (0->1), id }

  // Leaderboard
  leaderboard: JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]'),

  // Replay
  replayData: [],
  isRecording: false,
  bestReplay: JSON.parse(localStorage.getItem('snakeBestReplay') || 'null'),

  setDifficulty: (d) => set({ difficulty: d }),
  setSpeed: (s) => set({ speed: s }),

  startGame: () => {
    const state = get();
    const levelIdx = 0;
    const info = LEVEL_INFO[levelIdx];
    const board = deepCopyBoard(LEVELS[levelIdx]);
    const snake = createInitialSnake(info);

    snake.forEach((seg, i) => {
      board[seg.y][seg.x] = i === snake.length - 1 ? 100 : 50;
    });

    const foodPos = getRandomEmptyCell(board, snake);
    if (foodPos) board[foodPos.y][foodPos.x] = CELL.FOOD;

    // Place portals on levels >= 2
    let portalA = null, portalB = null;

    // Place score zones
    const scoreZones = [];
    for (let i = 0; i < 2; i++) {
      const pos = getRandomEmptyCell(board, snake);
      if (pos) {
        board[pos.y][pos.x] = CELL.SCORE_ZONE;
        scoreZones.push(pos);
      }
    }

    set({
      gameState: 'playing',
      board,
      snake,
      prevSnake: snake.map(s => ({ ...s })),
      tickTimestamp: performance.now(),
      direction: { ...DIR.RIGHT },
      nextDirection: { ...DIR.RIGHT },
      food: foodPos,
      firePickup: null,
      hasFire: false,
      portalA, portalB,
      hasShield: false, shieldHits: 0,
      hasMagnet: false, magnetTimer: 0,
      isSlowMo: false, slowMoTimer: 0,
      powerupOnBoard: null,
      scoreZones,
      bossSnake: [], prevBossSnake: [],
      bossDirection: { ...DIR.LEFT },
      bossActive: false, bossAlive: false,
      trail: [],
      score: 0,
      level: 1,
      foodEaten: 0,
      particles: [],
      screenShake: 0,
      comboCount: 0,
      showLevelBanner: false,
      risingWalls: [],
      nearMiss: false, nearMissTimer: 0,
      replayData: [],
      isRecording: true,
    });
  },

  startLevel: (levelNum) => {
    const state = get();
    const levelIdx = levelNum - 1;
    const info = LEVEL_INFO[levelIdx];
    const board = deepCopyBoard(LEVELS[levelIdx]);
    const snake = createInitialSnake(info);

    snake.forEach((seg, i) => {
      board[seg.y][seg.x] = i === snake.length - 1 ? 100 : 50;
    });

    const foodPos = getRandomEmptyCell(board, snake);
    if (foodPos) board[foodPos.y][foodPos.x] = CELL.FOOD;

    // Portals on levels >= 2
    let portalA = null, portalB = null;
    if (levelNum >= 2) {
      portalA = getRandomEmptyCell(board, snake);
      if (portalA) {
        board[portalA.y][portalA.x] = CELL.PORTAL_A;
        portalB = getRandomEmptyCell(board, snake);
        if (portalB) board[portalB.y][portalB.x] = CELL.PORTAL_B;
      }
    }

    // Score zones
    const scoreZones = [];
    const numZones = Math.min(levelNum, 4);
    for (let i = 0; i < numZones; i++) {
      const pos = getRandomEmptyCell(board, snake);
      if (pos) {
        board[pos.y][pos.x] = CELL.SCORE_ZONE;
        scoreZones.push(pos);
      }
    }

    // Boss on levels 3, 6
    let bossSnake = [];
    let bossActive = false;
    let bossAlive = false;
    if (levelNum === 3 || levelNum === 6) {
      const bossHead = { x: 15, y: 2 };
      bossSnake = [];
      for (let bx = bossHead.x + 5; bx >= bossHead.x; bx--) {
        bossSnake.push({ x: bx, y: bossHead.y });
      }
      bossActive = true;
      bossAlive = true;
    }

    set({
      gameState: 'playing',
      board,
      snake,
      prevSnake: snake.map(s => ({ ...s })),
      tickTimestamp: performance.now(),
      direction: { ...DIR.RIGHT },
      nextDirection: { ...DIR.RIGHT },
      food: foodPos,
      firePickup: null,
      hasFire: false,
      portalA, portalB,
      hasShield: false, shieldHits: 0,
      hasMagnet: false, magnetTimer: 0,
      isSlowMo: false, slowMoTimer: 0,
      powerupOnBoard: null,
      scoreZones,
      bossSnake,
      prevBossSnake: bossSnake.map(s => ({ ...s })),
      bossDirection: { ...DIR.LEFT },
      bossActive, bossAlive,
      trail: [],
      foodEaten: 0,
      particles: [],
      screenShake: 0,
      showLevelBanner: false,
      risingWalls: [],
      nearMiss: false, nearMissTimer: 0,
    });
  },

  setDirection: (dir) => {
    const state = get();
    if (state.gameState !== 'playing') return;
    if (state.direction.x + dir.x === 0 && state.direction.y + dir.y === 0) return;
    set({ nextDirection: { ...dir } });
  },

  togglePause: () => {
    const state = get();
    if (state.gameState === 'playing') set({ gameState: 'paused' });
    else if (state.gameState === 'paused') set({ gameState: 'playing' });
  },

  shootFire: () => {
    const state = get();
    if (!state.hasFire || state.gameState !== 'playing') return;

    const head = state.snake[state.snake.length - 1];
    const dir = state.direction;
    const board = state.board.map(r => [...r]);
    const destroyedWalls = [];

    let px = head.x + dir.x;
    let py = head.y + dir.y;

    while (px >= 0 && px < BOARD_WIDTH && py >= 0 && py < BOARD_HEIGHT) {
      if (board[py][px] === CELL.WALL) {
        board[py][px] = CELL.BLANK;
        destroyedWalls.push({ x: px, y: py });
      } else if (board[py][px] === CELL.FOOD) {
        board[py][px] = CELL.BLANK;
        const newFood = getRandomEmptyCell(board, state.snake);
        if (newFood) board[newFood.y][newFood.x] = CELL.FOOD;
        set(s => ({ score: s.score + LEVEL_INFO[s.level - 1].scorePerFood, food: newFood }));
      }
      px += dir.x;
      py += dir.y;
    }

    const newParticles = destroyedWalls.map(w => ({
      x: w.x, y: w.y, type: 'explosion', life: 1.0, id: Math.random(),
    }));

    // Fire trail particles along the beam
    let tx = head.x + dir.x, ty = head.y + dir.y;
    while (tx >= 0 && tx < BOARD_WIDTH && ty >= 0 && ty < BOARD_HEIGHT) {
      newParticles.push({ x: tx, y: ty, type: 'fireBeam', life: 0.8, id: Math.random() });
      tx += dir.x;
      ty += dir.y;
    }

    set({
      hasFire: false,
      board,
      particles: [...state.particles, ...newParticles],
      screenShake: 0.5,
    });
  },

  // Boss AI movement
  moveBoss: () => {
    const state = get();
    if (!state.bossActive || !state.bossAlive || !state.food) return;

    const { bossSnake, food, board } = state;
    if (bossSnake.length === 0) return;

    const bossHead = bossSnake[bossSnake.length - 1];

    // Simple AI: move toward food, avoid walls
    const possibleDirs = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT];
    let bestDir = state.bossDirection;
    let bestDist = Infinity;

    for (const d of possibleDirs) {
      // Don't reverse
      if (d.x + state.bossDirection.x === 0 && d.y + state.bossDirection.y === 0) continue;
      const nx = bossHead.x + d.x;
      const ny = bossHead.y + d.y;
      if (nx < 0 || nx >= BOARD_WIDTH || ny < 0 || ny >= BOARD_HEIGHT) continue;
      const cell = board[ny][nx];
      if (cell === CELL.WALL || cell === 50 || cell === 100) continue;
      // Check self collision
      if (bossSnake.some(s => s.x === nx && s.y === ny)) continue;
      const d2 = dist({ x: nx, y: ny }, food);
      if (d2 < bestDist) {
        bestDist = d2;
        bestDir = d;
      }
    }

    const newBossHead = { x: bossHead.x + bestDir.x, y: bossHead.y + bestDir.y };

    // Check if boss ate food
    let ateFood = false;
    if (state.food && newBossHead.x === state.food.x && newBossHead.y === state.food.y) {
      ateFood = true;
    }

    const newBossSnake = [...bossSnake, newBossHead];
    if (!ateFood) {
      newBossSnake.shift();
    }

    set({
      prevBossSnake: bossSnake.map(s => ({ ...s })),
      bossSnake: newBossSnake,
      bossDirection: bestDir,
    });

    // If boss ate food, respawn it
    if (ateFood) {
      const newBoard = state.board.map(r => [...r]);
      const newFood = getRandomEmptyCell(newBoard, [...state.snake, ...newBossSnake]);
      if (newFood) newBoard[newFood.y][newFood.x] = CELL.FOOD;
      set({ board: newBoard, food: newFood });
    }
  },

  tick: () => {
    const state = get();
    if (state.gameState !== 'playing') return;

    const { snake, board: oldBoard, level, foodEaten, speed, difficulty } = state;
    const dir = state.nextDirection;
    const info = LEVEL_INFO[level - 1];
    const board = oldBoard.map(r => [...r]);

    const head = snake[snake.length - 1];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };

    // Record for replay
    if (state.isRecording) {
      state.replayData.push({
        snake: snake.map(s => ({ ...s })),
        dir: { ...dir },
        score: state.score,
        level,
      });
    }

    // Boundary check
    if (newHead.x < 0 || newHead.x >= BOARD_WIDTH || newHead.y < 0 || newHead.y >= BOARD_HEIGHT) {
      return get().handleDeath();
    }

    let cellVal = board[newHead.y][newHead.x];

    // Portal teleportation
    if (cellVal === CELL.PORTAL_A && state.portalB) {
      newHead.x = state.portalB.x;
      newHead.y = state.portalB.y;
      cellVal = CELL.BLANK;
      set(s => ({ particles: [...s.particles, { x: state.portalA.x, y: state.portalA.y, type: 'portal', life: 1, id: Math.random() }] }));
    } else if (cellVal === CELL.PORTAL_B && state.portalA) {
      newHead.x = state.portalA.x;
      newHead.y = state.portalA.y;
      cellVal = CELL.BLANK;
      set(s => ({ particles: [...s.particles, { x: state.portalB.x, y: state.portalB.y, type: 'portal', life: 1, id: Math.random() }] }));
    }

    // Hit wall or self
    if (cellVal === CELL.WALL || cellVal === 50 || cellVal === 100) {
      if (state.hasShield && state.shieldHits > 0) {
        // Shield absorbs hit - bounce back
        const newShieldHits = state.shieldHits - 1;
        set({
          hasShield: newShieldHits > 0,
          shieldHits: newShieldHits,
          screenShake: 0.3,
          particles: [...state.particles, { x: head.x, y: head.y, type: 'shieldBreak', life: 1, id: Math.random() }],
        });
        return;
      }
      return get().handleDeath();
    }

    // Near-miss detection (check adjacent cells for walls/self)
    let nearMiss = false;
    for (const d of [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT]) {
      if (d.x === -dir.x && d.y === -dir.y) continue; // skip behind
      const nx = newHead.x + d.x;
      const ny = newHead.y + d.y;
      if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < BOARD_HEIGHT) {
        const adj = board[ny][nx];
        if (adj === CELL.WALL || adj === 50) {
          nearMiss = true;
          break;
        }
      }
    }

    let ateFood = false;
    let ateFire = false;
    let newScore = state.score;
    let newFoodEaten = foodEaten;
    let newFood = state.food;
    let newFirePickup = state.firePickup;
    let newHasFire = state.hasFire;
    let newParticles = [...state.particles];
    let newHasShield = state.hasShield;
    let newShieldHits = state.shieldHits;
    let newHasMagnet = state.hasMagnet;
    let newMagnetTimer = state.magnetTimer;
    let newIsSlowMo = state.isSlowMo;
    let newSlowMoTimer = state.slowMoTimer;
    let newPowerup = state.powerupOnBoard;
    let newRisingWalls = state.risingWalls;
    let scoreMultiplier = 1;

    // Check score zone
    if (cellVal === CELL.SCORE_ZONE) {
      scoreMultiplier = 2;
      newParticles.push({ x: newHead.x, y: newHead.y, type: 'scoreZone', life: 1, id: Math.random() });
    }

    // Decay powerup timers
    if (newMagnetTimer > 0) {
      newMagnetTimer--;
      if (newMagnetTimer <= 0) newHasMagnet = false;
    }
    if (newSlowMoTimer > 0) {
      newSlowMoTimer--;
      if (newSlowMoTimer <= 0) newIsSlowMo = false;
    }

    // Magnet effect: if food is within 5 cells, move it 1 step toward head
    if (newHasMagnet && newFood) {
      const d = dist(newHead, newFood);
      if (d <= 6 && d > 1) {
        const dx = Math.sign(newHead.x - newFood.x);
        const dy = Math.sign(newHead.y - newFood.y);
        const targetX = newFood.x + dx;
        const targetY = newFood.y + dy;
        if (targetX >= 0 && targetX < BOARD_WIDTH && targetY >= 0 && targetY < BOARD_HEIGHT) {
          if (board[targetY][targetX] === CELL.BLANK || board[targetY][targetX] === CELL.SCORE_ZONE) {
            board[newFood.y][newFood.x] = CELL.BLANK;
            board[targetY][targetX] = CELL.FOOD;
            newFood = { x: targetX, y: targetY };
          }
        }
      }
    }

    // Pick up power-ups
    if (cellVal === CELL.SHIELD) {
      newHasShield = true;
      newShieldHits = 2;
      newPowerup = null;
      newParticles.push({ x: newHead.x, y: newHead.y, type: 'shieldPickup', life: 1, id: Math.random() });
    }
    if (cellVal === CELL.MAGNET) {
      newHasMagnet = true;
      newMagnetTimer = 30; // 30 ticks
      newPowerup = null;
      newParticles.push({ x: newHead.x, y: newHead.y, type: 'magnetPickup', life: 1, id: Math.random() });
    }
    if (cellVal === CELL.SLOWMO) {
      newIsSlowMo = true;
      newSlowMoTimer = 20; // 20 ticks
      newPowerup = null;
      newParticles.push({ x: newHead.x, y: newHead.y, type: 'slowmoPickup', life: 1, id: Math.random() });
    }

    if (cellVal === CELL.FOOD) {
      ateFood = true;
      newScore += info.scorePerFood * scoreMultiplier;
      newFoodEaten += 1;

      const now = Date.now();
      const combo = (now - state.lastEatTime < 3000) ? state.comboCount + 1 : 1;
      if (combo > 1) newScore += combo * 2 * scoreMultiplier;

      newParticles.push({
        x: newHead.x, y: newHead.y, type: 'eat', life: 1.0, id: Math.random(),
        text: scoreMultiplier > 1 ? `x2! +${info.scorePerFood * 2}` : combo > 1 ? `x${combo}!` : `+${info.scorePerFood}`,
      });

      if (newFoodEaten >= info.maxFood) {
        const nextLevel = (level % 6) + 1;
        const nextSpeed = nextLevel === 1 ? Math.min(speed + 1, 6) : speed;
        set({
          gameState: 'levelComplete',
          score: newScore,
          foodEaten: newFoodEaten,
          level: nextLevel,
          speed: nextSpeed,
          showLevelBanner: true,
          particles: newParticles,
          comboCount: combo,
          lastEatTime: now,
        });
        return;
      }

      const tempBoard = board.map(r => [...r]);
      tempBoard[newHead.y][newHead.x] = 100;
      newFood = getRandomEmptyCell(tempBoard, snake);
      if (newFood) board[newFood.y][newFood.x] = CELL.FOOD;

      // Maybe spawn fire pickup
      if (newFoodEaten % info.foodToFire === 0 && !state.firePickup && !state.hasFire) {
        if (difficulty > 0 || level >= 3) {
          const firePos = getRandomEmptyCell(board, snake);
          if (firePos) {
            board[firePos.y][firePos.x] = CELL.FIRE;
            newFirePickup = firePos;
          }
        }
      }

      // Maybe spawn power-up
      if (newFoodEaten % 7 === 0 && !newPowerup) {
        const types = [CELL.SHIELD, CELL.MAGNET, CELL.SLOWMO];
        const type = types[Math.floor(Math.random() * types.length)];
        const pos = getRandomEmptyCell(board, snake);
        if (pos) {
          board[pos.y][pos.x] = type;
          newPowerup = { type, pos };
        }
      }

      // Random wall with rising animation
      if (difficulty > 0 && newFoodEaten % 5 === 0) {
        const wallPos = getRandomEmptyCell(board, snake);
        if (wallPos) {
          board[wallPos.y][wallPos.x] = CELL.WALL;
          newRisingWalls = [...state.risingWalls, { x: wallPos.x, y: wallPos.y, progress: 0, id: Math.random() }];
        }
      }

      set({ comboCount: combo, lastEatTime: now });
    }

    if (cellVal === CELL.FIRE) {
      ateFire = true;
      newHasFire = true;
      newFirePickup = null;
      newParticles.push({ x: newHead.x, y: newHead.y, type: 'fire', life: 1.0, id: Math.random() });
    }

    // Move snake
    const newSnake = [...snake, newHead];
    if (!ateFood && !ateFire) {
      const tail = newSnake.shift();
      board[tail.y][tail.x] = CELL.BLANK;
    }

    board[head.y][head.x] = 50;
    board[newHead.y][newHead.x] = 100;

    // Update trail
    const newTrail = [
      { x: head.x, y: head.y, life: 1.0, id: Math.random() },
      ...state.trail.map(t => ({ ...t, life: t.life - 0.06 })).filter(t => t.life > 0),
    ];

    // Decay particles
    newParticles = newParticles
      .map(p => ({ ...p, life: p.life - 0.05 }))
      .filter(p => p.life > 0);

    // Update rising walls
    newRisingWalls = newRisingWalls
      .map(w => ({ ...w, progress: Math.min(1, w.progress + 0.1) }))
      .filter(w => w.progress < 1);

    const newShake = Math.max(0, state.screenShake - 0.1);

    // Move boss
    if (state.bossActive && state.bossAlive) {
      get().moveBoss();
    }

    set({
      prevSnake: snake.map(s => ({ ...s })),
      tickTimestamp: performance.now(),
      snake: newSnake,
      board,
      direction: dir,
      nextDirection: dir,
      score: newScore,
      foodEaten: newFoodEaten,
      food: newFood,
      firePickup: newFirePickup,
      hasFire: newHasFire,
      hasShield: newHasShield,
      shieldHits: newShieldHits,
      hasMagnet: newHasMagnet,
      magnetTimer: newMagnetTimer,
      isSlowMo: newIsSlowMo,
      slowMoTimer: newSlowMoTimer,
      powerupOnBoard: newPowerup,
      trail: newTrail,
      particles: newParticles,
      screenShake: newShake,
      risingWalls: newRisingWalls,
      nearMiss,
      nearMissTimer: nearMiss ? 15 : Math.max(0, state.nearMissTimer - 1),
    });
  },

  handleDeath: () => {
    const state = get();
    const hs = Math.max(state.score, state.highScore);
    localStorage.setItem('snakeHighScore', hs.toString());

    // Save replay if best score
    if (state.score >= state.highScore && state.replayData.length > 0) {
      const replay = state.replayData.slice(-500); // last 500 ticks
      localStorage.setItem('snakeBestReplay', JSON.stringify(replay));
      set({ bestReplay: replay });
    }

    // Update leaderboard
    const lb = [...state.leaderboard, { score: state.score, level: state.level, date: Date.now() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    localStorage.setItem('snakeLeaderboard', JSON.stringify(lb));

    set({
      gameState: 'gameOver',
      highScore: hs,
      screenShake: 1.0,
      leaderboard: lb,
      isRecording: false,
    });
  },

  saveLeaderboardEntry: (name) => {
    const state = get();
    const lb = state.leaderboard.map((entry, i) => {
      if (i === 0 && !entry.name && entry.score === state.score) {
        return { ...entry, name };
      }
      return entry;
    });
    localStorage.setItem('snakeLeaderboard', JSON.stringify(lb));
    set({ leaderboard: lb });
  },

  getTickRate: () => {
    const state = get();
    const base = SPEED_LEVELS[state.speed - 1] || 300;
    if (state.isSlowMo) return base * 1.8; // Slow-mo makes game 1.8x slower
    if (state.nearMissTimer > 0) return base * 1.3; // slight slow near walls
    return base;
  },

  returnToMenu: () => {
    set({ gameState: 'menu' });
  },
}));
