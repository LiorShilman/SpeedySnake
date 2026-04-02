import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BOARD_WIDTH, BOARD_HEIGHT, SPEED_LEVELS } from '../data/levels';
import { useGameStore, CELL, LEVEL_THEMES, PLAYER_HUES } from '../store/gameStore';
import type { Point, Player, Particle, RisingWall, Powerup } from '../types';

const CELL_SIZE = 1;
const WALL_HEIGHT = 1.2;
const BOARD_OFFSET_X = -BOARD_WIDTH / 2;
const BOARD_OFFSET_Z = -BOARD_HEIGHT / 2;

function toWorld(x: number, y: number): [number, number, number] {
  return [x * CELL_SIZE + BOARD_OFFSET_X + 0.5, 0, y * CELL_SIZE + BOARD_OFFSET_Z + 0.5];
}

// ===== WALLS =====
function Walls({ board, level }: { board: number[][]; level: number }) {
  const theme = LEVEL_THEMES[(level - 1) % 6];

  const wallPositions = useMemo(() => {
    if (!board) return [];
    const positions: { x: number; y: number; wx: [number, number, number] }[] = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x] === 1) {
          positions.push({ x, y, wx: toWorld(x, y) });
        }
      }
    }
    return positions;
  }, [board]);

  const geometry = useMemo(() => new THREE.BoxGeometry(CELL_SIZE * 0.95, WALL_HEIGHT, CELL_SIZE * 0.95), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: theme.wallColor,
    emissive: theme.wallEmissive,
    emissiveIntensity: 0.7,
    metalness: 0.6,
    roughness: 0.3,
  }), [theme]);

  const borderMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: theme.wallColor,
    emissive: theme.wallEmissive,
    emissiveIntensity: 0.4,
    metalness: 0.7,
    roughness: 0.25,
  }), [theme]);

  return (
    <group>
      {wallPositions.map(({ x, y, wx }) => {
        const isBorder = x === 0 || x === BOARD_WIDTH - 1 || y === 0 || y === BOARD_HEIGHT - 1;
        return (
          <mesh
            key={`${x}-${y}`}
            position={[wx[0], WALL_HEIGHT / 2, wx[2]]}
            geometry={geometry}
            material={isBorder ? borderMaterial : material}
            castShadow
            receiveShadow
          />
        );
      })}
    </group>
  );
}

// ===== RISING WALLS (animated) =====
function RisingWalls({ risingWalls, level }: { risingWalls: RisingWall[]; level: number }) {
  const theme = LEVEL_THEMES[(level - 1) % 6];
  return (
    <group>
      {risingWalls.map((w) => {
        const [wx, , wz] = toWorld(w.x, w.y);
        const h = WALL_HEIGHT * w.progress;
        return (
          <mesh key={w.id} position={[wx, h / 2, wz]} scale={[0.95, w.progress, 0.95]} castShadow>
            <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]} />
            <meshStandardMaterial
              color={theme.wallColor}
              emissive={theme.wallEmissive}
              emissiveIntensity={1.5 * (1 - w.progress)}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ===== NEON TRAIL =====
function Trail({ trail, level }: { trail: { x: number; y: number; life: number; id: number }[]; level: number }) {
  const theme = LEVEL_THEMES[(level - 1) % 6];
  return (
    <group>
      {trail.map((t) => {
        const [wx, , wz] = toWorld(t.x, t.y);
        return (
          <mesh key={t.id} position={[wx, 0.05, wz]}>
            <boxGeometry args={[CELL_SIZE * 0.7 * t.life, 0.05, CELL_SIZE * 0.7 * t.life]} />
            <meshStandardMaterial
              color={theme.secondary}
              emissive={theme.secondary}
              emissiveIntensity={2 * t.life}
              transparent
              opacity={t.life * 0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ===== SNAKE SEGMENT (multiplayer-aware) =====
interface SnakeSegmentProps {
  index: number;
  snakeLength: number;
  direction: Point;
  hasFire: boolean;
  hasShield: boolean;
  level: number;
  playerId: number;
  colorHue: number;
}

function SnakeSegment({ index, snakeLength, direction, hasFire, hasShield, level, playerId, colorHue }: SnakeSegmentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);
  const isHead = index === snakeLength - 1;
  const isTail = index === 0;
  const t = index / snakeLength;
  const scale = isHead ? 1.1 : isTail ? 0.6 : 0.7 + t * 0.25;

  const hue = colorHue + t * 0.15;
  const color = useMemo(() => new THREE.Color().setHSL(hue, 0.9, isHead ? 0.55 : 0.4 + t * 0.15), [hue, isHead, t]);
  const emissiveColor = useMemo(() => new THREE.Color().setHSL(hue, 1, 0.3), [hue]);

  useFrame(() => {
    if (!groupRef.current) return;
    time.current += 0.016;

    const state = useGameStore.getState();
    const player = state.players[playerId];
    if (!player) return;
    const { snake, prevSnake } = player;
    const tickRate = SPEED_LEVELS[state.speed - 1] || 300;

    if (!snake[index]) return;

    const curr = snake[index];
    const offset = snake.length - prevSnake.length;
    const prevIdx = index - offset;
    const prev = prevIdx >= 0 && prevIdx < prevSnake.length ? prevSnake[prevIdx] : curr;

    const elapsed = performance.now() - state.tickTimestamp;
    const lerp = Math.min(elapsed / tickRate, 1);

    const px = prev.x + (curr.x - prev.x) * lerp;
    const py = prev.y + (curr.y - prev.y) * lerp;

    const [wx, , wz] = toWorld(px, py);
    const heightOffset = isHead ? 0.45 : 0.25 + Math.sin(time.current * 3 + index * 0.5) * 0.05;

    groupRef.current.position.set(wx, heightOffset, wz);
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        {isHead ? (
          <sphereGeometry args={[CELL_SIZE * scale * 0.48, 16, 16]} />
        ) : (
          <sphereGeometry args={[CELL_SIZE * scale * 0.42, 10, 10]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={isHead ? 0.6 : 0.3}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      {isHead && (
        <>
          <mesh position={[direction.x * 0.2 + direction.y * 0.15, 0.15, direction.y * 0.2 + direction.x * 0.15]} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[direction.x * 0.2 - direction.y * 0.15, 0.15, direction.y * 0.2 - direction.x * 0.15]} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[direction.x * 0.28 + direction.y * 0.15, 0.15, direction.y * 0.28 + direction.x * 0.15]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[direction.x * 0.28 - direction.y * 0.15, 0.15, direction.y * 0.28 - direction.x * 0.15]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          {hasFire && (
            <mesh>
              <sphereGeometry args={[0.65, 16, 16]} />
              <meshStandardMaterial color="#ff4400" emissive="#ff6600" emissiveIntensity={1.5} transparent opacity={0.3} />
            </mesh>
          )}
          {hasShield && (
            <mesh>
              <sphereGeometry args={[0.7, 16, 16]} />
              <meshStandardMaterial color="#00aaff" emissive="#0088ff" emissiveIntensity={1.0} transparent opacity={0.2} wireframe />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

function PlayerSnake({ playerId, player, level }: { playerId: number; player: Player; level: number }) {
  if (!player || !player.alive || !player.snake || player.snake.length === 0) return null;
  return (
    <group>
      {player.snake.map((_, i) => (
        <SnakeSegment
          key={i}
          index={i}
          snakeLength={player.snake.length}
          direction={player.direction}
          hasFire={player.hasFire}
          hasShield={player.hasShield}
          level={level}
          playerId={playerId}
          colorHue={player.colorHue}
        />
      ))}
    </group>
  );
}

// ===== BOSS SNAKE =====
function BossSnakeSegment({ index, bossSnake, bossDirection }: { index: number; bossSnake: Point[]; bossDirection: Point }) {
  const groupRef = useRef<THREE.Group>(null);
  const isHead = index === bossSnake.length - 1;
  const t = index / bossSnake.length;
  const scale = isHead ? 1.2 : 0.6 + t * 0.3;

  useFrame(() => {
    if (!groupRef.current) return;
    const state = useGameStore.getState();
    const { bossSnake: bs, prevBossSnake, tickTimestamp } = state;
    const tickRate = SPEED_LEVELS[state.speed - 1] || 300;
    if (!bs[index]) return;

    const curr = bs[index];
    const offset = bs.length - prevBossSnake.length;
    const prevIdx = index - offset;
    const prev = prevIdx >= 0 && prevIdx < prevBossSnake.length ? prevBossSnake[prevIdx] : curr;

    const elapsed = performance.now() - tickTimestamp;
    const lerp = Math.min(elapsed / tickRate, 1);
    const px = prev.x + (curr.x - prev.x) * lerp;
    const py = prev.y + (curr.y - prev.y) * lerp;
    const [wx, , wz] = toWorld(px, py);

    groupRef.current.position.set(wx, isHead ? 0.5 : 0.3, wz);
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <sphereGeometry args={[CELL_SIZE * scale * 0.45, isHead ? 16 : 10, isHead ? 16 : 10]} />
        <meshStandardMaterial
          color={isHead ? '#ff1111' : '#cc0000'}
          emissive="#ff0000"
          emissiveIntensity={isHead ? 1.0 : 0.4}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
      {isHead && (
        <>
          <mesh position={[bossDirection.x * 0.2 + bossDirection.y * 0.15, 0.15, bossDirection.y * 0.2 + bossDirection.x * 0.15]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={1} />
          </mesh>
          <mesh position={[bossDirection.x * 0.2 - bossDirection.y * 0.15, 0.15, bossDirection.y * 0.2 - bossDirection.x * 0.15]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={1} />
          </mesh>
          <pointLight color="#ff0000" intensity={2} distance={5} />
        </>
      )}
    </group>
  );
}

function BossSnake({ bossSnake, bossDirection, bossActive, bossAlive }: { bossSnake: Point[]; bossDirection: Point; bossActive: boolean; bossAlive: boolean }) {
  if (!bossActive || !bossAlive || bossSnake.length === 0) return null;
  return (
    <group>
      {bossSnake.map((_, i) => (
        <BossSnakeSegment key={i} index={i} bossSnake={bossSnake} bossDirection={bossDirection} />
      ))}
    </group>
  );
}

// ===== FOOD =====
function Food({ position }: { position: Point | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
    if (glowRef.current) glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.2);
  });

  if (!position) return null;
  const [wx, , wz] = toWorld(position.x, position.y);

  return (
    <group position={[wx, 0, wz]}>
      <mesh ref={meshRef} castShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff4400" emissiveIntensity={0.8} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff8800" emissiveIntensity={0.5} transparent opacity={0.15} />
      </mesh>
      <pointLight color="#ff6600" intensity={2} distance={4} position={[0, 0.5, 0]} />
    </group>
  );
}

// ===== FIRE PICKUP =====
function FirePickup({ position }: { position: Point | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 4;
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    meshRef.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * 2.5) * 0.2;
  });

  if (!position) return null;
  const [wx, , wz] = toWorld(position.x, position.y);

  return (
    <group position={[wx, 0, wz]}>
      <mesh ref={meshRef} castShadow>
        <coneGeometry args={[0.25, 0.5, 6]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff2200" emissiveIntensity={1.2} metalness={0.6} roughness={0.2} />
      </mesh>
      <pointLight color="#ff2200" intensity={3} distance={5} position={[0, 0.6, 0]} />
    </group>
  );
}

// ===== PORTALS =====
function Portal({ position, color }: { position: Point | null; color: string; label?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 3;
      meshRef.current.rotation.x = state.clock.elapsedTime * 1.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 2;
      ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.15);
    }
  });

  if (!position) return null;
  const [wx, , wz] = toWorld(position.x, position.y);

  return (
    <group position={[wx, 0.5, wz]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.35, 0.08, 8, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.2, 0.4, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color={color} intensity={3} distance={4} />
    </group>
  );
}

// ===== POWER-UP ON BOARD =====
function PowerupPickup({ powerup }: { powerup: Powerup | null }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    meshRef.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
  });

  if (!powerup) return null;
  const [wx, , wz] = toWorld(powerup.pos.x, powerup.pos.y);

  const configs: Record<number, { color: string; emissive: string; shape: string }> = {
    [CELL.SHIELD]: { color: '#00aaff', emissive: '#0088ff', shape: 'octahedron' },
    [CELL.MAGNET]: { color: '#ff00ff', emissive: '#cc00cc', shape: 'torus' },
    [CELL.SLOWMO]: { color: '#00ffaa', emissive: '#00cc88', shape: 'icosahedron' },
  };

  const cfg = configs[powerup.type] || configs[CELL.SHIELD];

  return (
    <group position={[wx, 0, wz]}>
      <mesh ref={meshRef} castShadow>
        {cfg.shape === 'octahedron' && <octahedronGeometry args={[0.3, 0]} />}
        {cfg.shape === 'torus' && <torusGeometry args={[0.25, 0.08, 8, 16]} />}
        {cfg.shape === 'icosahedron' && <icosahedronGeometry args={[0.3, 0]} />}
        <meshStandardMaterial color={cfg.color} emissive={cfg.emissive} emissiveIntensity={1.2} metalness={0.5} roughness={0.2} />
      </mesh>
      <pointLight color={cfg.color} intensity={2} distance={4} position={[0, 0.6, 0]} />
    </group>
  );
}

// ===== SCORE ZONES =====
function ScoreZones({ scoreZones }: { scoreZones: Point[] }) {
  const time = useRef(0);
  useFrame((_, delta) => { time.current += delta; });

  return (
    <group>
      {scoreZones.map((z, i) => {
        const [wx, , wz] = toWorld(z.x, z.y);
        const pulse = 0.8 + Math.sin(time.current * 3 + i) * 0.2;
        return (
          <mesh key={i} position={[wx, 0.02, wz]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.45 * pulse, 6]} />
            <meshStandardMaterial
              color="#ffcc00"
              emissive="#ffaa00"
              emissiveIntensity={1.5 * pulse}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ===== PARTICLES =====
function Particles({ particles }: { particles: Particle[] }) {
  return (
    <group>
      {particles.map((p) => {
        const [wx, , wz] = toWorld(p.x, p.y);
        const s = p.life;

        if (p.type === 'explosion') {
          return (
            <mesh key={p.id} position={[wx, p.life * 2, wz]} scale={s * 1.5}>
              <icosahedronGeometry args={[0.3, 0]} />
              <meshStandardMaterial color="#ff4400" emissive="#ff6600" emissiveIntensity={2 * p.life} transparent opacity={p.life} />
            </mesh>
          );
        }
        if (p.type === 'eat') {
          return (
            <mesh key={p.id} position={[wx, 1 + (1 - p.life) * 2, wz]} scale={s}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff44" emissiveIntensity={2 * p.life} transparent opacity={p.life} />
            </mesh>
          );
        }
        if (p.type === 'fire' || p.type === 'fireBeam') {
          return (
            <mesh key={p.id} position={[wx, 0.5 + (1 - p.life) * 1.5, wz]} scale={s * (p.type === 'fireBeam' ? 0.5 : 1.2)}>
              <octahedronGeometry args={[0.25, 0]} />
              <meshStandardMaterial color="#ff2200" emissive="#ff4400" emissiveIntensity={3 * p.life} transparent opacity={p.life} />
            </mesh>
          );
        }
        if (p.type === 'portal') {
          return (
            <mesh key={p.id} position={[wx, 0.5 + (1 - p.life), wz]} scale={s * 2}>
              <torusGeometry args={[0.3, 0.05, 8, 16]} />
              <meshStandardMaterial color="#aa44ff" emissive="#8800ff" emissiveIntensity={3 * p.life} transparent opacity={p.life} />
            </mesh>
          );
        }
        if (p.type === 'shieldBreak') {
          return (
            <mesh key={p.id} position={[wx, 0.5 + (1 - p.life), wz]} scale={s * 2.5}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#00aaff" emissive="#0088ff" emissiveIntensity={2 * p.life} transparent opacity={p.life * 0.6} wireframe />
            </mesh>
          );
        }
        if (p.type === 'scoreZone') {
          return (
            <mesh key={p.id} position={[wx, (1 - p.life) * 3, wz]} scale={s * 1.5}>
              <sphereGeometry args={[0.15, 6, 6]} />
              <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={3 * p.life} transparent opacity={p.life} />
            </mesh>
          );
        }
        return (
          <mesh key={p.id} position={[wx, 0.5 + (1 - p.life), wz]} scale={s * 0.8}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#4488ff" emissive="#2244ff" emissiveIntensity={p.life} transparent opacity={p.life * 0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

// ===== GROUND =====
function Ground({ level }: { level: number }) {
  const theme = LEVEL_THEMES[(level - 1) % 6];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[BOARD_WIDTH + 2, BOARD_HEIGHT + 2]} />
        <meshStandardMaterial color={theme.bg} metalness={0.9} roughness={0.3} />
      </mesh>
      <gridHelper
        args={[Math.max(BOARD_WIDTH, BOARD_HEIGHT) + 2, Math.max(BOARD_WIDTH, BOARD_HEIGHT) + 2, '#111133', '#0a0a22']}
        position={[0, 0.01, 0]}
      />
    </group>
  );
}

// ===== MAIN GAMEBOARD =====
export default function GameBoard() {
  const groupRef = useRef<THREE.Group>(null);
  const board = useGameStore(s => s.board);
  const players = useGameStore(s => s.players);
  const food = useGameStore(s => s.food);
  const firePickup = useGameStore(s => s.firePickup);
  const particles = useGameStore(s => s.particles);
  const screenShake = useGameStore(s => s.screenShake);
  const level = useGameStore(s => s.level);
  const portalA = useGameStore(s => s.portalA);
  const portalB = useGameStore(s => s.portalB);
  const powerupOnBoard = useGameStore(s => s.powerupOnBoard);
  const scoreZones = useGameStore(s => s.scoreZones);
  const risingWalls = useGameStore(s => s.risingWalls);
  const bossSnake = useGameStore(s => s.bossSnake);
  const bossDirection = useGameStore(s => s.bossDirection);
  const bossActive = useGameStore(s => s.bossActive);
  const bossAlive = useGameStore(s => s.bossAlive);

  const allTrails = useMemo(() => {
    const trails: { x: number; y: number; life: number; id: number }[] = [];
    for (const p of Object.values(players)) {
      if (p.trail) trails.push(...p.trail);
    }
    return trails;
  }, [players]);

  useFrame(() => {
    if (groupRef.current && screenShake > 0) {
      groupRef.current.position.x = (Math.random() - 0.5) * screenShake * 0.3;
      groupRef.current.position.z = (Math.random() - 0.5) * screenShake * 0.3;
    } else if (groupRef.current) {
      groupRef.current.position.x = 0;
      groupRef.current.position.z = 0;
    }
  });

  const currentLevel = level || 1;

  if (!board) return <Ground level={currentLevel} />;

  return (
    <group ref={groupRef}>
      <Ground level={currentLevel} />
      <Trail trail={allTrails} level={currentLevel} />
      <Walls board={board} level={currentLevel} />
      <RisingWalls risingWalls={risingWalls} level={currentLevel} />

      {Object.entries(players).map(([id, player]) => (
        <PlayerSnake key={id} playerId={Number(id)} player={player} level={currentLevel} />
      ))}

      <BossSnake bossSnake={bossSnake} bossDirection={bossDirection} bossActive={bossActive} bossAlive={bossAlive} />
      <Food position={food} />
      <FirePickup position={firePickup} />
      <Portal position={portalA} color="#8844ff" label="A" />
      <Portal position={portalB} color="#44ff88" label="B" />
      <PowerupPickup powerup={powerupOnBoard} />
      <ScoreZones scoreZones={scoreZones} />
      <Particles particles={particles} />
    </group>
  );
}
