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
