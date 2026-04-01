// Web Audio API sound effects + procedural background music
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

function playTone(freq, duration, type = 'square', volume = 0.15) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playEatSound() {
  playTone(600, 0.1, 'square', 0.12);
  setTimeout(() => playTone(800, 0.1, 'square', 0.1), 50);
  setTimeout(() => playTone(1000, 0.15, 'sine', 0.08), 100);
}

export function playFirePickupSound() {
  playTone(300, 0.15, 'sawtooth', 0.12);
  setTimeout(() => playTone(500, 0.15, 'sawtooth', 0.1), 80);
  setTimeout(() => playTone(800, 0.2, 'sawtooth', 0.08), 160);
}

export function playFireShootSound() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const bufferSize = audioCtx.sampleRate * 0.3;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
  playTone(100, 0.3, 'sawtooth', 0.15);
}

export function playDeathSound() {
  playTone(400, 0.15, 'square', 0.15);
  setTimeout(() => playTone(300, 0.15, 'square', 0.12), 100);
  setTimeout(() => playTone(200, 0.2, 'square', 0.1), 200);
  setTimeout(() => playTone(100, 0.4, 'sawtooth', 0.12), 300);
}

export function playLevelUpSound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.12), i * 120);
  });
}

export function playMenuSound() {
  playTone(440, 0.08, 'sine', 0.08);
}

export function playComboSound(combo) {
  const base = 600 + combo * 100;
  playTone(base, 0.12, 'sine', 0.1);
  setTimeout(() => playTone(base * 1.5, 0.15, 'sine', 0.08), 60);
}

export function playPortalSound() {
  playTone(200, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(600, 0.15, 'sine', 0.1), 50);
  setTimeout(() => playTone(1200, 0.2, 'sine', 0.08), 100);
}

export function playShieldSound() {
  playTone(800, 0.1, 'triangle', 0.1);
  setTimeout(() => playTone(1200, 0.15, 'triangle', 0.08), 50);
}

export function playPowerupSound() {
  playTone(440, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(660, 0.1, 'sine', 0.1), 80);
  setTimeout(() => playTone(880, 0.15, 'sine', 0.08), 160);
  setTimeout(() => playTone(1100, 0.2, 'sine', 0.06), 240);
}

// ===== PROCEDURAL BACKGROUND MUSIC =====
// Generates an evolving bass + arpeggio pattern that changes with speed/level

const SCALES = {
  1: [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94], // C minor
  2: [146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63], // D minor
  3: [164.81, 185.00, 196.00, 220.00, 246.94, 261.63, 293.66], // E minor
  4: [174.61, 196.00, 220.00, 233.08, 261.63, 293.66, 329.63], // F minor
  5: [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 349.23], // G minor
  6: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00], // A minor
};

let musicInterval = null;
let musicGain = null;
let musicStep = 0;

export function startMusic(level = 1, speed = 1) {
  if (!audioCtx) return;
  stopMusic();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  musicGain = audioCtx.createGain();
  musicGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
  musicGain.connect(audioCtx.destination);

  const scale = SCALES[level] || SCALES[1];
  const bpm = 100 + speed * 20; // faster speed = faster music
  const interval = (60 / bpm) * 1000 / 2; // 8th notes

  musicStep = 0;

  musicInterval = setInterval(() => {
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const step = musicStep % 16;
    musicStep++;

    // Bass on beats 0, 4, 8, 12
    if (step % 4 === 0) {
      const bassNote = scale[0] / 2;
      const osc = audioCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassNote, audioCtx.currentTime);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.08, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(g);
      g.connect(musicGain);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }

    // Arpeggio pattern
    const noteIdx = [0, 2, 4, 2, 3, 5, 4, 1][step % 8];
    const freq = scale[noteIdx];

    const osc = audioCtx.createOscillator();
    osc.type = step % 2 === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.04, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(g);
    g.connect(musicGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);

    // Hi-hat on every other step
    if (step % 2 === 1) {
      const bufferSize = audioCtx.sampleRate * 0.03;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buffer;
      const hg = audioCtx.createGain();
      hg.gain.setValueAtTime(0.02, audioCtx.currentTime);
      hg.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      // High-pass filter for hi-hat
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(8000, audioCtx.currentTime);
      src.connect(filter);
      filter.connect(hg);
      hg.connect(musicGain);
      src.start();
    }
  }, interval);
}

export function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  if (musicGain) {
    try { musicGain.disconnect(); } catch (e) {}
    musicGain = null;
  }
}

export function updateMusicTempo(speed) {
  // Will be called when speed changes to restart music with new tempo
  const state = typeof window !== 'undefined' && window.__gameLevel;
  if (musicInterval) {
    startMusic(state || 1, speed);
  }
}
