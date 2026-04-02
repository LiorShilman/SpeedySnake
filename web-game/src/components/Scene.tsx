import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GameBoard from './GameBoard';
import { useGameStore, LEVEL_THEMES } from '../store/gameStore';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../data/levels';

const BOARD_OFFSET_X = -BOARD_WIDTH / 2;
const BOARD_OFFSET_Z = -BOARD_HEIGHT / 2;

function toWorld(x: number, y: number): [number, number, number] {
  return [x + BOARD_OFFSET_X + 0.5, 0, y + BOARD_OFFSET_Z + 0.5];
}

function DynamicCamera() {
  const controlsRef = useRef<any>(null);
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!controlsRef.current) return;
    const state = useGameStore.getState();
    const { players, gameState, mode } = state;

    if (gameState === 'playing') {
      if (mode === 'versus') {
        targetPos.current.lerp(new THREE.Vector3(0, 0, 0), 0.05);
      } else {
        const p1 = players[0];
        if (p1 && p1.alive && p1.snake.length > 0) {
          const head = p1.snake[p1.snake.length - 1];
          const [wx, , wz] = toWorld(head.x, head.y);
          targetPos.current.lerp(new THREE.Vector3(wx * 0.3, 0, wz * 0.3), 0.03);
        }
      }
      controlsRef.current.target.copy(targetPos.current);
    } else {
      targetPos.current.lerp(new THREE.Vector3(0, 0, 0), 0.05);
      controlsRef.current.target.copy(targetPos.current);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={10}
      maxDistance={45}
      minPolarAngle={0.3}
      maxPolarAngle={Math.PI / 2.2}
      target={[0, 0, 0]}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

function LevelLights() {
  const lightRef1 = useRef<THREE.PointLight>(null);
  const lightRef2 = useRef<THREE.PointLight>(null);
  const lightRef3 = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const state = useGameStore.getState();
    const theme = LEVEL_THEMES[(state.level - 1) % 6];
    if (lightRef1.current) {
      lightRef1.current.color.lerp(new THREE.Color(theme.primary), 0.02);
    }
    if (lightRef2.current) {
      lightRef2.current.color.lerp(new THREE.Color(theme.secondary), 0.02);
    }
    if (lightRef3.current) {
      const intensity = state.nearMissTimer > 0 ? 1.5 : 0.5;
      lightRef3.current.intensity += (intensity - lightRef3.current.intensity) * 0.1;
    }
  });

  return (
    <>
      <pointLight ref={lightRef1} position={[0, 12, 0]} intensity={1.0} color="#4466ff" />
      <pointLight ref={lightRef2} position={[-15, 8, -10]} intensity={0.5} color="#ff4466" />
      <pointLight ref={lightRef3} position={[15, 8, 10]} intensity={0.5} color="#44ff66" />
    </>
  );
}

function SceneContent() {
  return (
    <>
      <color attach="background" args={['#050510']} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 25, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.4} />
      <LevelLights />

      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} />
      <fog attach="fog" args={['#050510', 30, 60]} />

      <GameBoard />
      <DynamicCamera />
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 25, 18], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#050510' }}
    >
      <SceneContent />
    </Canvas>
  );
}
