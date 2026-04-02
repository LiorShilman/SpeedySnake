import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore, LEVEL_THEMES } from '../store/gameStore';
import { LEVEL_INFO, SPEED_LEVELS } from '../data/levels';
import {
  playEatSound, playFirePickupSound, playFireShootSound,
  playDeathSound, playLevelUpSound, playMenuSound,
  playPortalSound, playShieldSound, playPowerupSound,
  startMusic, stopMusic,
} from './SoundManager';
import {
  connectToServer, createRoom, joinRoom, sendInput,
  sendStartGame, sendPlayAgain, disconnectFromServer,
} from '../store/socketManager';
import type { GameMode } from '../types';

// ===== ONLINE LOBBY =====
function OnlineLobby() {
  const [joinCode, setJoinCode] = useState('');
  const [connecting, setConnecting] = useState(false);
  const roomCode = useGameStore(s => s.roomCode);
  const lobbyStatus = useGameStore(s => s.lobbyStatus);
  const opponentConnected = useGameStore(s => s.opponentConnected);
  const onlineError = useGameStore(s => s.onlineError);
  const myPlayerId = useGameStore(s => s.myPlayerId);
  const returnToMenu = useGameStore(s => s.returnToMenu);

  const handleCreate = async () => {
    setConnecting(true);
    const state = useGameStore.getState();
    await createRoom(state.speed, state.difficulty);
    setConnecting(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setConnecting(true);
    await joinRoom(joinCode);
    setConnecting(false);
  };

  const handleStart = () => {
    sendStartGame();
  };

  const handleBack = () => {
    disconnectFromServer();
    returnToMenu();
  };

  return (
    <div className="menu-overlay">
      <div className="menu-container">
        <div className="menu-title">
          <span className="title-snake">ONLINE</span>
          <span className="title-3d">GAME</span>
        </div>

        {onlineError && (
          <div style={{ color: '#ff4444', marginBottom: 15, fontWeight: 'bold' }}>{onlineError}</div>
        )}

        {connecting && (
          <div style={{ color: '#ffaa00', marginTop: 20 }}>Connecting...</div>
        )}

        {!roomCode && !lobbyStatus && !connecting && (
          <>
            <button className="start-btn" onClick={handleCreate}>CREATE GAME</button>
            <div style={{ margin: '20px 0', color: '#888', letterSpacing: 2 }}>OR</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                maxLength={4}
                className="room-code-input"
              />
              <button className="menu-btn" onClick={handleJoin}>JOIN</button>
            </div>
            <button className="menu-btn" style={{ marginTop: 20 }} onClick={handleBack}>BACK</button>
          </>
        )}

        {roomCode && lobbyStatus === 'waiting' && (
          <>
            <div className="room-code-display">
              <div style={{ color: '#888', fontSize: 14, letterSpacing: 2 }}>ROOM CODE</div>
              <div style={{ fontSize: 48, fontFamily: "'Courier New', monospace", fontWeight: 900, color: '#44ff88', letterSpacing: 12 }}>
                {roomCode}
              </div>
              <div style={{ color: '#666', fontSize: 12, marginTop: 5 }}>Share this code with your friend</div>
            </div>
            {!opponentConnected ? (
              <div style={{ color: '#ffaa00', marginTop: 20, animation: 'pulse 1.5s infinite' }}>
                Waiting for opponent...
              </div>
            ) : (
              <>
                <div style={{ color: '#44ff88', marginTop: 20 }}>Opponent connected!</div>
                {myPlayerId === 0 && (
                  <button className="start-btn" style={{ marginTop: 15 }} onClick={handleStart}>START GAME</button>
                )}
              </>
            )}
            <button className="menu-btn" style={{ marginTop: 20 }} onClick={handleBack}>CANCEL</button>
          </>
        )}

        {roomCode && lobbyStatus === 'joined' && (
          <>
            <div style={{ color: '#44ff88', fontSize: 18, marginBottom: 10 }}>
              Joined room {roomCode}
            </div>
            <div style={{ color: '#ffaa00' }}>
              Waiting for host to start...
            </div>
            <div style={{ color: '#888', marginTop: 10, fontSize: 14 }}>
              You are Player {(myPlayerId || 0) + 1}
            </div>
            <button className="menu-btn" style={{ marginTop: 20 }} onClick={handleBack}>LEAVE</button>
          </>
        )}
      </div>
    </div>
  );
}

// ===== MAIN MENU =====
function MainMenu() {
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState(0);
  const [selectedMode, setSelectedMode] = useState<GameMode>('single');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const startGame = useGameStore(s => s.startGame);
  const setDifficulty = useGameStore(s => s.setDifficulty);
  const setSpeed = useGameStore(s => s.setSpeed);
  const setMode = useGameStore(s => s.setMode);
  const highScore = useGameStore(s => s.highScore);
  const leaderboard = useGameStore(s => s.leaderboard);

  const handleStart = () => {
    playMenuSound();
    setDifficulty(selectedDifficulty);
    setSpeed(selectedSpeed);
    setMode(selectedMode);
    if (selectedMode === 'online') {
      useGameStore.setState({ gameState: 'lobby', mode: 'online', roomCode: null, lobbyStatus: null, opponentConnected: false });
      return;
    }
    startGame();
  };

  const difficulties = ['Beginner', 'Intermediate', 'Expert'];
  const modes: { key: GameMode; label: string }[] = [
    { key: 'single', label: 'SOLO' },
    { key: 'versus', label: '2P LOCAL' },
    { key: 'online', label: 'ONLINE' },
  ];

  return (
    <div className="menu-overlay">
      <div className="menu-container">
        <div className="menu-title">
          <span className="title-snake">SPEEDY</span>
          <span className="title-3d">SNAKE</span>
          <span className="title-sub">3D</span>
        </div>

        {!showLeaderboard ? (
          <>
            <div className="menu-options">
              <div className="option-group">
                <label>MODE</label>
                <div className="option-buttons">
                  {modes.map((m) => (
                    <button
                      key={m.key}
                      className={`option-btn ${selectedMode === m.key ? 'active' : ''}`}
                      onClick={() => { setSelectedMode(m.key); playMenuSound(); }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label>DIFFICULTY</label>
                <div className="option-buttons">
                  {difficulties.map((d, i) => (
                    <button
                      key={d}
                      className={`option-btn ${selectedDifficulty === i ? 'active' : ''}`}
                      onClick={() => { setSelectedDifficulty(i); playMenuSound(); }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label>SPEED</label>
                <div className="speed-slider">
                  <input
                    type="range" min="1" max="6" value={selectedSpeed}
                    onChange={(e) => { setSelectedSpeed(parseInt(e.target.value)); playMenuSound(); }}
                  />
                  <span className="speed-value">{selectedSpeed} / 6</span>
                </div>
              </div>
            </div>

            {selectedMode === 'versus' && (
              <div className="controls-info" style={{ marginBottom: 10 }}>
                <div className="control-item"><kbd>P1</kbd> Arrows + Ctrl</div>
                <div className="control-item"><kbd>P2</kbd> WASD + Shift</div>
              </div>
            )}

            {highScore > 0 && (
              <div className="high-score-display">HIGH SCORE: {highScore}</div>
            )}

            <button className="start-btn" onClick={handleStart}>
              {selectedMode === 'online' ? 'FIND GAME' : 'START GAME'}
            </button>

            {leaderboard.length > 0 && (
              <button className="menu-btn" style={{ marginTop: 15 }} onClick={() => setShowLeaderboard(true)}>
                LEADERBOARD
              </button>
            )}

            <div className="controls-info">
              <div className="control-item"><kbd>ARROWS</kbd> Move</div>
              <div className="control-item"><kbd>CTRL</kbd> Fire</div>
              <div className="control-item"><kbd>SPACE</kbd> Pause</div>
            </div>

            <div className="features-info">
              Portals | Power-ups | Boss Battles | Score Zones
            </div>
          </>
        ) : (
          <div className="leaderboard">
            <h3 className="lb-title">LEADERBOARD</h3>
            <div className="lb-list">
              {leaderboard.map((entry, i) => (
                <div key={i} className="lb-row">
                  <span className="lb-rank">#{i + 1}</span>
                  <span className="lb-name">{entry.name || 'Anonymous'}</span>
                  <span className="lb-score">{entry.score}</span>
                  <span className="lb-level">L{entry.level}</span>
                </div>
              ))}
            </div>
            <button className="menu-btn" onClick={() => setShowLeaderboard(false)}>BACK</button>
          </div>
        )}
      </div>
    </div>
  );
}

function HUD() {
  const players = useGameStore(s => s.players);
  const mode = useGameStore(s => s.mode);
  const myPlayerId = useGameStore(s => s.myPlayerId);
  const level = useGameStore(s => s.level);
  const speed = useGameStore(s => s.speed);
  const highScore = useGameStore(s => s.highScore);
  const bossActive = useGameStore(s => s.bossActive);
  const nearMiss = useGameStore(s => s.nearMiss);

  const isMulti = mode === 'versus' || mode === 'online';
  const p1 = players[0];
  const p2 = players[1];
  const currentLevelInfo = LEVEL_INFO[level - 1];
  const p1Score = p1 ? p1.score : 0;
  const p1FoodRemaining = p1 && currentLevelInfo ? currentLevelInfo.maxFood - p1.foodEaten : 0;

  const p1Label = mode === 'online' ? (myPlayerId === 0 ? 'YOU' : 'OPP') : (isMulti ? 'P1' : 'SCORE');
  const p2Label = mode === 'online' ? (myPlayerId === 1 ? 'YOU' : 'OPP') : 'P2';

  return (
    <div className="hud">
      <div className="hud-left">
        <div className="hud-item score">
          <span className="hud-label">{p1Label}</span>
          <span className="hud-value" style={isMulti ? { color: '#44ff88' } : {}}>{p1Score}</span>
        </div>
        {mode === 'single' && (
          <div className="hud-item">
            <span className="hud-label">HIGH</span>
            <span className="hud-value hud-high">{Math.max(p1Score, highScore)}</span>
          </div>
        )}
        {isMulti && p2 && (
          <div className="hud-item score">
            <span className="hud-label">{p2Label}</span>
            <span className="hud-value" style={{ color: '#8888ff' }}>{p2.score}</span>
          </div>
        )}
      </div>
      <div className="hud-center">
        <div className="hud-item level">
          <span className="hud-label">LEVEL</span>
          <span className="hud-value">{level}</span>
        </div>
        {bossActive && <div className="boss-warning">BOSS!</div>}
      </div>
      <div className="hud-right">
        <div className="hud-item">
          <span className="hud-label">FOOD LEFT</span>
          <span className="hud-value">{p1FoodRemaining}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">SPEED</span>
          <span className="hud-value">{speed}</span>
        </div>
        <div className="powerup-indicators">
          {p1 && p1.scoreMultiplier > 1 && <div className="powerup-badge score-badge">{isMulti ? 'P1 ' : ''}x{p1.scoreMultiplier} SCORE</div>}
          {p1 && p1.hasFire && <div className="powerup-badge fire-badge">{isMulti ? 'P1 ' : ''}FIRE</div>}
          {p1 && p1.hasShield && <div className="powerup-badge shield-badge">{isMulti ? 'P1 ' : ''}SHIELD x{p1.shieldHits}</div>}
          {p1 && p1.hasMagnet && <div className="powerup-badge magnet-badge">{isMulti ? 'P1 ' : ''}MAGNET {p1.magnetTimer}</div>}
          {p1 && p1.isSlowMo && <div className="powerup-badge slowmo-badge">{isMulti ? 'P1 ' : ''}SLOW-MO {p1.slowMoTimer}</div>}
          {isMulti && p2 && p2.alive && (
            <>
              {p2.scoreMultiplier > 1 && <div className="powerup-badge score-badge" style={{ borderColor: '#8888ff' }}>P2 x{p2.scoreMultiplier} SCORE</div>}
              {p2.hasFire && <div className="powerup-badge fire-badge" style={{ borderColor: '#8888ff' }}>P2 FIRE</div>}
              {p2.hasShield && <div className="powerup-badge shield-badge" style={{ borderColor: '#8888ff' }}>P2 SHIELD x{p2.shieldHits}</div>}
              {p2.hasMagnet && <div className="powerup-badge magnet-badge" style={{ borderColor: '#8888ff' }}>P2 MAGNET {p2.magnetTimer}</div>}
              {p2.isSlowMo && <div className="powerup-badge slowmo-badge" style={{ borderColor: '#8888ff' }}>P2 SLOW-MO {p2.slowMoTimer}</div>}
            </>
          )}
        </div>
      </div>
      {nearMiss && <div className="near-miss-flash">NEAR MISS!</div>}
    </div>
  );
}

function PauseOverlay() {
  return (
    <div className="pause-overlay">
      <div className="pause-text">PAUSED</div>
      <div className="pause-sub">Press SPACE to resume</div>
    </div>
  );
}

function GameOverOverlay() {
  const players = useGameStore(s => s.players);
  const mode = useGameStore(s => s.mode);
  const winner = useGameStore(s => s.winner);
  const highScore = useGameStore(s => s.highScore);
  const level = useGameStore(s => s.level);
  const startGame = useGameStore(s => s.startGame);
  const returnToMenu = useGameStore(s => s.returnToMenu);
  const myPlayerId = useGameStore(s => s.myPlayerId);

  const isMulti = mode === 'versus' || mode === 'online';
  const p1 = players[0];
  const p2 = players[1];
  const p1Score = p1 ? p1.score : 0;
  const p2Score = p2 ? p2.score : 0;
  const bestScore = Math.max(p1Score, p2Score);
  const isNewHighScore = bestScore >= highScore && bestScore > 0;

  const handlePlayAgain = () => {
    playMenuSound();
    if (mode === 'online') {
      sendPlayAgain();
    } else {
      startGame();
    }
  };

  const handleMenu = () => {
    playMenuSound();
    if (mode === 'online') disconnectFromServer();
    returnToMenu();
  };

  let winnerText: string | null = null;
  if (isMulti && winner !== null) {
    if (mode === 'online') {
      winnerText = winner === myPlayerId ? 'YOU WIN!' : 'YOU LOSE!';
    } else {
      winnerText = `PLAYER ${winner + 1} WINS!`;
    }
  }

  return (
    <div className="gameover-overlay">
      <div className="gameover-container">
        {isNewHighScore && <div className="new-highscore">NEW HIGH SCORE!</div>}

        {isMulti && winnerText && (
          <div className="winner-banner" style={{ color: (mode === 'online' ? winner === myPlayerId : winner === 0) ? '#44ff88' : '#ff4488' }}>
            {winnerText}
          </div>
        )}
        {isMulti && winner === null && (
          <div className="winner-banner" style={{ color: '#ffcc00' }}>DRAW!</div>
        )}

        <div className="gameover-title">GAME OVER</div>
        <div className="gameover-stats">
          {mode === 'single' ? (
            <>
              <div className="stat-row"><span>Score</span><span>{p1Score}</span></div>
              <div className="stat-row"><span>Level Reached</span><span>{level}</span></div>
              <div className="stat-row"><span>Best Score</span><span>{highScore}</span></div>
            </>
          ) : (
            <>
              <div className="stat-row"><span style={{ color: '#44ff88' }}>{mode === 'online' && myPlayerId === 0 ? 'You' : 'P1'}</span><span>{p1Score}</span></div>
              <div className="stat-row"><span style={{ color: '#8888ff' }}>{mode === 'online' && myPlayerId === 1 ? 'You' : 'P2'}</span><span>{p2Score}</span></div>
              <div className="stat-row"><span>Level Reached</span><span>{level}</span></div>
            </>
          )}
        </div>
        <div className="gameover-buttons">
          <button className="start-btn" onClick={handlePlayAgain}>PLAY AGAIN</button>
          <button className="menu-btn" onClick={handleMenu}>MENU</button>
        </div>
      </div>
    </div>
  );
}

function LevelCompleteOverlay() {
  const level = useGameStore(s => s.level);
  const players = useGameStore(s => s.players);
  const mode = useGameStore(s => s.mode);
  const startLevel = useGameStore(s => s.startLevel);

  const p1Score = players[0] ? players[0].score : 0;
  const p2Score = players[1] ? players[1].score : 0;
  const isMulti = mode === 'versus' || mode === 'online';

  useEffect(() => {
    playLevelUpSound();
    if (mode !== 'online') {
      const timer = setTimeout(() => {
        startLevel(level);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [level, startLevel, mode]);

  return (
    <div className="level-complete-overlay">
      <div className="level-complete-container">
        <div className="level-complete-title">LEVEL COMPLETE!</div>
        <div className="level-complete-score">
          {!isMulti ? (
            `Score: ${p1Score}`
          ) : (
            <>P1: {p1Score} | P2: {p2Score}</>
          )}
        </div>
        <div className="level-complete-next">
          Next: Level {level}
        </div>
      </div>
    </div>
  );
}

export default function GameUI() {
  const gameState = useGameStore(s => s.gameState);
  const mode = useGameStore(s => s.mode);
  const tick = useGameStore(s => s.tick);
  const setDirection = useGameStore(s => s.setDirection);
  const togglePause = useGameStore(s => s.togglePause);
  const shootFire = useGameStore(s => s.shootFire);
  const getTickRate = useGameStore(s => s.getTickRate);
  const level = useGameStore(s => s.level);
  const speed = useGameStore(s => s.speed);

  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      const currPlayers = state.players;
      const prevPlayers = prevState.players;
      for (const pid of Object.keys(currPlayers)) {
        const cp = currPlayers[Number(pid)];
        const pp = prevPlayers[Number(pid)];
        if (!pp) continue;
        if (cp.foodEaten > pp.foodEaten) playEatSound();
        if (cp.hasFire && !pp.hasFire) playFirePickupSound();
        if (!cp.hasFire && pp.hasFire && state.gameState === 'playing') playFireShootSound();
        if (cp.hasShield && !pp.hasShield) playPowerupSound();
        if (cp.hasMagnet && !pp.hasMagnet) playPowerupSound();
        if (cp.isSlowMo && !pp.isSlowMo) playPowerupSound();
        if (cp.shieldHits < pp.shieldHits && pp.shieldHits > 0) playShieldSound();
        if (cp.snake.length > 0 && pp.snake.length > 0) {
          const h = cp.snake[cp.snake.length - 1];
          const ph = pp.snake[pp.snake.length - 1];
          if (Math.abs(h.x - ph.x) > 2 || Math.abs(h.y - ph.y) > 2) playPortalSound();
        }
        if (!cp.alive && pp.alive) playDeathSound();
      }
      if (state.gameState === 'gameOver' && prevState.gameState !== 'gameOver') playDeathSound();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      startMusic(level, speed);
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [gameState, level, speed]);

  const tickRef = useRef(tick);
  const getTickRateRef = useRef(getTickRate);
  useEffect(() => {
    tickRef.current = tick;
    getTickRateRef.current = getTickRate;
  }, [tick, getTickRate]);

  useEffect(() => {
    if (gameState !== 'playing' || mode === 'online') return;
    let timerId: ReturnType<typeof setTimeout>;
    const loop = () => {
      tickRef.current();
      timerId = setTimeout(loop, getTickRateRef.current());
    };
    timerId = setTimeout(loop, getTickRateRef.current());
    return () => clearTimeout(timerId);
  }, [gameState, mode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't intercept keys when typing in an input field
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

    const isOnline = useGameStore.getState().mode === 'online';

    if (isOnline) {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          e.preventDefault(); sendInput({ type: 'direction', dir: { x: 0, y: -1 } }); break;
        case 'ArrowDown': case 's': case 'S':
          e.preventDefault(); sendInput({ type: 'direction', dir: { x: 0, y: 1 } }); break;
        case 'ArrowLeft': case 'a': case 'A':
          e.preventDefault(); sendInput({ type: 'direction', dir: { x: -1, y: 0 } }); break;
        case 'ArrowRight': case 'd': case 'D':
          e.preventDefault(); sendInput({ type: 'direction', dir: { x: 1, y: 0 } }); break;
        case 'Control': case 'Shift':
          e.preventDefault(); sendInput({ type: 'fire' }); break;
        case ' ':
          e.preventDefault(); break;
      }
    } else {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault(); setDirection(0, { x: 0, y: -1 }); break;
        case 'ArrowDown':
          e.preventDefault(); setDirection(0, { x: 0, y: 1 }); break;
        case 'ArrowLeft':
          e.preventDefault(); setDirection(0, { x: -1, y: 0 }); break;
        case 'ArrowRight':
          e.preventDefault(); setDirection(0, { x: 1, y: 0 }); break;
        case 'Control':
          e.preventDefault(); shootFire(0); break;
        case 'w': case 'W':
          e.preventDefault(); setDirection(1, { x: 0, y: -1 }); break;
        case 's': case 'S':
          e.preventDefault(); setDirection(1, { x: 0, y: 1 }); break;
        case 'a': case 'A':
          e.preventDefault(); setDirection(1, { x: -1, y: 0 }); break;
        case 'd': case 'D':
          e.preventDefault(); setDirection(1, { x: 1, y: 0 }); break;
        case 'Shift':
          e.preventDefault(); shootFire(1); break;
        case ' ':
          e.preventDefault(); togglePause(); break;
      }
    }
  }, [setDirection, shootFire, togglePause]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const touchDir = (dir: { x: number; y: number }) => {
    if (mode === 'online') {
      sendInput({ type: 'direction', dir });
    } else {
      setDirection(0, dir);
    }
  };
  const touchFire = () => {
    if (mode === 'online') {
      sendInput({ type: 'fire' });
    } else {
      shootFire(0);
    }
  };

  return (
    <>
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'lobby' && <OnlineLobby />}
      {(gameState === 'playing' || gameState === 'paused') && <HUD />}
      {gameState === 'paused' && <PauseOverlay />}
      {gameState === 'gameOver' && <GameOverOverlay />}
      {gameState === 'levelComplete' && <LevelCompleteOverlay />}

      {(gameState === 'playing') && (
        <div className="touch-controls">
          <button className="touch-btn touch-up" onTouchStart={() => touchDir({ x: 0, y: -1 })}>^</button>
          <button className="touch-btn touch-left" onTouchStart={() => touchDir({ x: -1, y: 0 })}>&lt;</button>
          <button className="touch-btn touch-right" onTouchStart={() => touchDir({ x: 1, y: 0 })}>&gt;</button>
          <button className="touch-btn touch-down" onTouchStart={() => touchDir({ x: 0, y: 1 })}>v</button>
          <button className="touch-btn touch-fire" onTouchStart={() => touchFire()}>FIRE</button>
        </div>
      )}
    </>
  );
}
