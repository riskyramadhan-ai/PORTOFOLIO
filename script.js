// Tandai JS berhasil dimuat, supaya animasi reveal di CSS aktif.
// Kalau baris ini tidak sempat jalan, konten tetap tampil normal (lihat style.css).
document.documentElement.classList.add('js-ready');

// ---------- Menu navigasi di layar kecil ----------
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- Reveal saat elemen masuk layar ----------
const revealTargets = document.querySelectorAll('.reveal, .section-title');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
}

// ---------- Nav aktif mengikuti posisi scroll ----------
const navLinks = document.querySelectorAll('#nav a[data-nav]');
const sections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  };

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => navObserver.observe(section));
}

// ---------- Game: Tebak Kata ----------
const wordEl = document.getElementById('gameWord');
const messageEl = document.getElementById('gameMessage');
const keyboardEl = document.getElementById('gameKeyboard');
const livesEl = document.getElementById('gameLives');
const restartBtn = document.getElementById('gameRestart');

if (wordEl && keyboardEl) {
  const WORDS = [
    'JAVASCRIPT', 'PYTHON', 'DATABASE', 'JARINGAN',
    'ALGORITMA', 'FRONTEND', 'BACKEND', 'KOMPUTER', 'PROGRAM'
  ];
  const MAX_LIVES = 6;
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  let currentWord = '';
  let guessed = new Set();
  let livesLeft = MAX_LIVES;

  function renderLives() {
    livesEl.innerHTML = '';
    for (let i = 0; i < MAX_LIVES; i++) {
      const dot = document.createElement('span');
      if (i >= livesLeft) dot.classList.add('used');
      livesEl.appendChild(dot);
    }
  }

  function renderWord() {
    wordEl.textContent = currentWord
      .split('')
      .map((letter) => (guessed.has(letter) ? letter : '_'))
      .join(' ');
  }

  function renderKeyboard() {
    keyboardEl.innerHTML = '';
    ALPHABET.forEach((letter) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = letter;
      btn.addEventListener('click', () => handleGuess(letter, btn));
      keyboardEl.appendChild(btn);
    });
  }

  function checkStatus() {
    const isWin = currentWord.split('').every((letter) => guessed.has(letter));
    const isLose = livesLeft <= 0;

    if (isWin) {
      messageEl.textContent = 'Mantap, tertebak semua! 🎉';
      messageEl.className = 'game-message win';
      disableKeyboard();
    } else if (isLose) {
      messageEl.textContent = `Kehabisan nyawa. Kata tadi: ${currentWord}`;
      messageEl.className = 'game-message lose';
      renderWord();
      wordEl.textContent = currentWord.split('').join(' ');
      disableKeyboard();
    }
  }

  function disableKeyboard() {
    keyboardEl.querySelectorAll('button').forEach((btn) => (btn.disabled = true));
  }

  function handleGuess(letter, btn) {
    btn.disabled = true;
    if (currentWord.includes(letter)) {
      guessed.add(letter);
      btn.classList.add('correct');
      messageEl.textContent = 'Betul! Lanjut lagi.';
      messageEl.className = 'game-message';
    } else {
      livesLeft -= 1;
      btn.classList.add('wrong');
      messageEl.textContent = 'Kurang tepat, coba huruf lain.';
      messageEl.className = 'game-message';
      renderLives();
    }
    renderWord();
    checkStatus();
  }

  function startGame() {
    currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    guessed = new Set();
    livesLeft = MAX_LIVES;
    messageEl.textContent = 'Tebak huruf pertamamu.';
    messageEl.className = 'game-message';
    renderLives();
    renderWord();
    renderKeyboard();
  }

  restartBtn.addEventListener('click', startGame);
  startGame();
}

// ---------- Tab switcher (Tebak Kata / Balap Mobil) ----------
const gameTabs = document.querySelectorAll('.game-tab');
const gamePanels = {
  panelWord: document.getElementById('panelWord'),
  panelCar: document.getElementById('panelCar'),
};

gameTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    gameTabs.forEach((t) => {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');

    Object.entries(gamePanels).forEach(([id, panel]) => {
      if (!panel) return;
      panel.hidden = id !== tab.dataset.target;
    });

    if (tab.dataset.target === 'panelCar') {
      carGame.activate();
    } else {
      carGame.deactivate();
    }
  });
});

// ---------- Game: Balap Mobil ----------
const carGame = (() => {
  const canvas = document.getElementById('carCanvas');
  if (!canvas) return { activate() {}, deactivate() {} };

  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('carOverlay');
  const startBtn = document.getElementById('carStart');
  const leftBtn = document.getElementById('carLeft');
  const rightBtn = document.getElementById('carRight');
  const scoreEl = document.getElementById('carScore');
  const highscoreEl = document.getElementById('carHighscore');

  const LANE_COUNT = 3;
  const LANE_WIDTH = canvas.width / LANE_COUNT;
  const CAR_WIDTH = 46;
  const CAR_HEIGHT = 70;

  let lane = 1;
  let obstacles = [];
  let speed = 3.2;
  let spawnTimer = 0;
  let score = 0;
  let running = false;
  let active = false;
  let rafId = null;

  const highscoreKey = 'balapMobilHighscore';
  let highscore = Number(localStorage.getItem(highscoreKey)) || 0;
  highscoreEl.textContent = highscore;

  function laneX(l) {
    return l * LANE_WIDTH + LANE_WIDTH / 2 - CAR_WIDTH / 2;
  }

  function reset() {
    lane = 1;
    obstacles = [];
    speed = 3.2;
    spawnTimer = 0;
    score = 0;
    scoreEl.textContent = '0';
  }

  function spawnObstacle() {
    const obstacleLane = Math.floor(Math.random() * LANE_COUNT);
    obstacles.push({ lane: obstacleLane, y: -CAR_HEIGHT, color: pickColor() });
  }

  function pickColor() {
    const colors = ['#ff4fd8', '#33e6ff', '#7c5cff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function drawRoad() {
    ctx.fillStyle = '#08080f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.setLineDash([16, 14]);
    ctx.lineWidth = 2;
    for (let i = 1; i < LANE_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_WIDTH, 0);
      ctx.lineTo(i * LANE_WIDTH, canvas.height);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function drawCar(x, y, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, CAR_WIDTH, CAR_HEIGHT, 10);
    ctx.fill();
    ctx.restore();
  }

  function checkCollision(playerY) {
    return obstacles.some((ob) => {
      if (ob.lane !== lane) return false;
      return ob.y < playerY + CAR_HEIGHT && ob.y + CAR_HEIGHT > playerY;
    });
  }

  function loop() {
    if (!running) return;

    spawnTimer += 1;
    const spawnRate = Math.max(28, 55 - Math.floor(score / 8));
    if (spawnTimer > spawnRate) {
      spawnObstacle();
      spawnTimer = 0;
    }

    obstacles.forEach((ob) => (ob.y += speed));
    obstacles = obstacles.filter((ob) => ob.y < canvas.height + CAR_HEIGHT);

    speed += 0.0025;
    score += 1;
    scoreEl.textContent = Math.floor(score / 5);

    const playerY = canvas.height - CAR_HEIGHT - 16;

    drawRoad();
    obstacles.forEach((ob) => drawCar(laneX(ob.lane), ob.y, ob.color));
    drawCar(laneX(lane), playerY, '#33e6ff');

    if (checkCollision(playerY)) {
      endGame();
      return;
    }

    rafId = requestAnimationFrame(loop);
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(rafId);
    const finalScore = Math.floor(score / 5);
    if (finalScore > highscore) {
      highscore = finalScore;
      localStorage.setItem(highscoreKey, String(highscore));
      highscoreEl.textContent = highscore;
    }
    overlay.hidden = false;
    overlay.querySelector('.car-overlay-title').textContent = 'Game Over';
    overlay.querySelector('.car-overlay-text').textContent = `Skor kamu: ${finalScore}. Coba lagi?`;
    startBtn.textContent = 'Main Lagi';
  }

  function start() {
    reset();
    overlay.hidden = true;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function moveLane(direction) {
    if (!running) return;
    lane = Math.min(LANE_COUNT - 1, Math.max(0, lane + direction));
  }

  startBtn.addEventListener('click', start);
  leftBtn.addEventListener('click', () => moveLane(-1));
  rightBtn.addEventListener('click', () => moveLane(1));

  window.addEventListener('keydown', (e) => {
    if (!active) return;
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') moveLane(-1);
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') moveLane(1);
  });

  drawRoad();

  return {
    activate() { active = true; },
    deactivate() {
      active = false;
      running = false;
      cancelAnimationFrame(rafId);
    },
  };
})();
