export interface Point {
  x: number;
  y: number;
}

export interface Player {
  snake: Point[];
  prevSnake: Point[];
  direction: Point;
  nextDirection: Point;
  score: number;
  foodEaten: number;
  hasFire: boolean;
  hasShield: boolean;
  shieldHits: number;
  hasMagnet: boolean;
  magnetTimer: number;
  isSlowMo: boolean;
  slowMoTimer: number;
  scoreMultiplier: number;
  alive: boolean;
  trail: TrailPoint[];
  colorHue: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  life: number;
  id: number;
}

export interface Particle {
  x: number;
  y: number;
  type: string;
  life: number;
  id: number;
  text?: string;
}

export interface RisingWall {
  x: number;
  y: number;
  progress: number;
  id: number;
}

export interface Powerup {
  type: number;
  pos: Point;
}

export interface LeaderboardEntry {
  score: number;
  level: number;
  date: number;
  name?: string;
}

export interface LevelTheme {
  primary: string;
  secondary: string;
  bg: string;
  wallColor: string;
  wallEmissive: string;
  name: string;
}

export interface LevelInfo {
  level: number;
  head: Point;
  tail: Point;
  direction: Point;
  maxFood: number;
  scorePerFood: number;
  foodToFire: number;
  p2head: Point;
  p2tail: Point;
  p2direction: Point;
}

export type GameMode = 'single' | 'versus' | 'online';
export type GameState = 'menu' | 'lobby' | 'playing' | 'paused' | 'gameOver' | 'levelComplete';
export type LobbyStatus = 'waiting' | 'joined' | null;
