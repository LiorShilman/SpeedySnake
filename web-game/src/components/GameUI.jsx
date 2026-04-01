import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore, LEVEL_THEMES } from '../store/gameStore';
import { LEVEL_INFO, SPEED_LEVELS } from '../data/levels';
import {
  playEatSound, playFirePickupSound, playFireShootSound,
  playDeathSound, playLevelUpSound, playMenuSound, playComboSound,
  playPortalSound, playShieldSound, playPowerupSound,
  startMusic, stopMusic,
} from './SoundManager';

function MainMenu() {
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const startGame = useGameStore(s => s.startGame);
  const setDifficulty = useGameStore(s => s.setDifficulty);
  const setSpeed = useGameStore(s => s.setSpeed);
  const highScore = useGameStore(s => s.highScore);
  const leaderboard = useGameStore(s => s.leaderboard);

  const handleStart = () => {
    playMenuSound();
    setDifficulty(selectedDifficulty);
    setSpeed(selectedSpeed);
    startGame();
  };

  const difficulties = ['Beginner', 'Intermediate', 'Expert'];

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

            {highScore > 0 && (
              <div className="high-score-display">HIGH SCORE: {highScore}</div>
            )}

            <button className="start-btn" onClick={handleStart}>START GAME</button>

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
  const score = useGameStore(s => s.score);
  const level = useGameStore(s => s.level);
  const speed = useGameStore(s => s.speed);
  const foodEaten = useGameStore(s => s.foodEaten);
  const hasFire = useGameStore(s => s.hasFire);
  const hasShield = useGameStore(s => s.hasShield);
  const shieldHits = useGameStore(s => s.shieldHits);
  const hasMagnet = useGameStore(s => s.hasMagnet);
  const magnetTimer = useGameStore(s => s.magnetTimer);
  const isSlowMo = useGameStore(s => s.isSlowMo);
  const slowMoTimer = useGameStore(s => s.slowMoTimer);
  const highScore = useGameStore(s => s.highScore);
  const bossActive = useGameStore(s => s.bossActive);
  const nearMiss = useGameStore(s => s.nearMiss);
  const currentLevelInfo = LEVEL_INFO[level - 1];
  const theme = LEVEL_THEMES[(level - 1) % 6];

  const foodRemaining = currentLevelInfo ? currentLevelInfo.maxFood - foodEaten : 0;

  return (
    <div className="hud">
      <div className="hud-left">
        <div className="hud-item score">
          <span className="hud-label">SCORE</span>
          <span className="hud-value">{score}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">HIGH</span>
          <span className="hud-value hud-high">{Math.max(score, highScore)}</span>
        </div>
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
          <span className="hud-value">{foodRemaining}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">SPEED</span>
          <span className="hud-value">{speed}</span>
        </div>
        {/* Power-up indicators */}
        <div className="powerup-indicators">
          {hasFire && <div className="powerup-badge fire-badge">FIRE</div>}
          {hasShield && <div className="powerup-badge shield-badge">SHIELD x{shieldHits}</div>}
          {hasMagnet && <div className="powerup-badge magnet-badge">MAGNET {magnetTimer}</div>}
          {isSlowMo && <div className="powerup-badge slowmo-badge">SLOW-MO {slowMoTimer}</div>}
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
  const score = useGameStore(s => s.score);
  const highScore = useGameStore(s => s.highScore);
  const level = useGameStore(s => s.level);
  const startGame = useGameStore(s => s.startGame);
  const returnToMenu = useGameStore(s => s.returnToMenu);
  const leaderboard = useGameStore(s => s.leaderboard);
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="gameover-overlay">
      <div className="gameover-container">
        {isNewHighScore && <div className="new-highscore">NEW HIGH SCORE!</div>}
        <div className="gameover-title">GAME OVER</div>
        <div className="gameover-stats">
          <div className="stat-row"><span>Score</span><span>{score}</span></div>
          <div className="stat-row"><span>Level Reached</span><span>{level}</span></div>
          <div className="stat-row"><span>Best Score</span><span>{highScore}</span></div>
        </div>
        <div className="gameover-buttons">
          <button className="start-btn" onClick={() => { playMenuSound(); startGame(); }}>PLAY AGAIN</button>
          <button className="menu-btn" onClick={() => { playMenuSound(); returnToMenu(); }}>MENU</button>
        </div>
      </div>
    </div>
  );
}

function LevelCompleteOverlay() {
  const level = useGameStore(s => s.level);
  const score = useGameStore(s => s.score);
  const startLevel = useGameStore(s => s.startLevel);
  const bossActive = level === 3 || level === 6;

  useEffect(() => {
    playLevelUpSound();
    const timer = setTimeout(() => {
      startLevel(level);
    }, 2500);
    return () => clearTimeout(timer);
  }, [level, startLevel]);

  return (
    <div className="level-complete-overlay">
      <div className="level-complete-container">
        <div className="level-complete-title">LEVEL COMPLETE!</div>
        <div className="level-complete-score">Score: {score}</div>
        <div className="level-complete-next">
          {bossActive ? 'BOSS LEVEL INCOMING!' : `Next: Level ${level}`}
        </div>
      </div>
    </div>
  );
}

export default function GameUI() {
  const gameState = useGameStore(s => s.gameState);
  const tick = useGameStore(s => s.tick);
  const setDirection = useGameStore(s => s.setDirection);
  const togglePause = useGameStore(s => s.togglePause);
  const shootFire = useGameStore(s => s.shootFire);
  const getTickRate = useGameStore(s => s.getTickRate);
  const level = useGameStore(s => s.level);
  const speed = useGameStore(s => s.speed);

  // Sound effects based on state changes
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      if (state.foodEaten > prevState.foodEaten) {
        if (state.comboCount > 1) playComboSound(state.comboCount);
        else playEatSound();
      }
      if (state.hasFire && !prevState.hasFire) playFirePickupSound();
      if (!state.hasFire && prevState.hasFire && state.gameState === 'playing') playFireShootSound();
      if (state.gameState === 'gameOver' && prevState.gameState !== 'gameOver') playDeathSound();
      if (state.hasShield && !prevState.hasShield) playPowerupSound();
      if (state.hasMagnet && !prevState.hasMagnet) playPowerupSound();
      if (state.isSlowMo && !prevState.isSlowMo) playPowerupSound();
      if (state.shieldHits < prevState.shieldHits && prevState.shieldHits > 0) playShieldSound();
      // Portal sound: detect teleportation (head position jumped)
      if (state.snake.length > 0 && prevState.snake.length > 0) {
        const h = state.snake[state.snake.length - 1];
        const ph = prevState.snake[prevState.snake.length - 1];
        if (Math.abs(h.x - ph.x) > 2 || Math.abs(h.y - ph.y) > 2) {
          playPortalSound();
        }
      }
    });
    return unsubscribe;
  }, []);

  // Music control
  useEffect(() => {
    if (gameState === 'playing') {
      startMusic(level, speed);
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [gameState, level, speed]);

  // Game loop with dynamic tick rate
  const tickRef = useRef(tick);
  tickRef.current = tick;
  const getTickRateRef = useRef(getTickRate);
  getTickRateRef.current = getTickRate;

  useEffect(() => {
    if (gameState !== 'playing') return;
    let timerId;
    const loop = () => {
      tickRef.current();
      timerId = setTimeout(loop, getTickRateRef.current());
    };
    timerId = setTimeout(loop, getTickRateRef.current());
    return () => clearTimeout(timerId);
  }, [gameState]);

  // Keyboard input
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W':
        e.preventDefault(); setDirection({ x: 0, y: -1 }); break;
      case 'ArrowDown': case 's': case 'S':
        e.preventDefault(); setDirection({ x: 0, y: 1 }); break;
      case 'ArrowLeft': case 'a': case 'A':
        e.preventDefault(); setDirection({ x: -1, y: 0 }); break;
      case 'ArrowRight': case 'd': case 'D':
        e.preventDefault(); setDirection({ x: 1, y: 0 }); break;
      case 'Control':
        e.preventDefault(); shootFire(); break;
      case ' ':
        e.preventDefault(); togglePause(); break;
    }
  }, [setDirection, shootFire, togglePause]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {gameState === 'menu' && <MainMenu />}
      {(gameState === 'playing' || gameState === 'paused') && <HUD />}
      {gameState === 'paused' && <PauseOverlay />}
      {gameState === 'gameOver' && <GameOverOverlay />}
      {gameState === 'levelComplete' && <LevelCompleteOverlay />}

      {(gameState === 'playing') && (
        <div className="touch-controls">
          <button className="touch-btn touch-up" onTouchStart={() => setDirection({ x: 0, y: -1 })}>^</button>
          <button className="touch-btn touch-left" onTouchStart={() => setDirection({ x: -1, y: 0 })}>&lt;</button>
          <button className="touch-btn touch-right" onTouchStart={() => setDirection({ x: 1, y: 0 })}>&gt;</button>
          <button className="touch-btn touch-down" onTouchStart={() => setDirection({ x: 0, y: 1 })}>v</button>
          <button className="touch-btn touch-fire" onTouchStart={() => shootFire()}>FIRE</button>
        </div>
      )}
    </>
  );
}
