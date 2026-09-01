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

// ---------- Starfield background ----------
(() => {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.25 + 0.05,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > canvas.height) star.y = 0;
      star.twinkle += 0.03;
      const opacity = 0.4 + Math.sin(star.twinkle) * 0.35;
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0.15, opacity)})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ---------- Game: Roket Risky ----------
(() => {
  const canvas = document.getElementById('rocketCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('rocketOverlay');
  const startBtn = document.getElementById('rocketStart');
  const boostBtn = document.getElementById('rocketBoost');
  const scoreEl = document.getElementById('rocketScore');
  const highscoreEl = document.getElementById('rocketHighscore');

  const GRAVITY = 0.35;
  const FLAP = -6.4;
  const ROCKET_X = 70;
  const ROCKET_SIZE = 26;
  const GAP_SIZE = 140;
  const OBSTACLE_WIDTH = 50;

  let rocketY = canvas.height / 2;
  let velocity = 0;
  let obstacles = [];
  let speed = 2.6;
  let score = 0;
  let running = false;
  let flame = 0;
  let rafId = null;

  const highscoreKey = 'roketRiskyHighscore';
  let highscore = Number(localStorage.getItem(highscoreKey)) || 0;
  highscoreEl.textContent = highscore;

  function reset() {
    rocketY = canvas.height / 2;
    velocity = 0;
    obstacles = [{ x: canvas.width + 60, gapY: randomGapY(), scored: false }];
    speed = 2.6;
    score = 0;
    scoreEl.textContent = '0';
  }

  function randomGapY() {
    const margin = 60;
    return margin + Math.random() * (canvas.height - margin * 2 - GAP_SIZE);
  }

  function drawBackground() {
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawRocket() {
    const x = ROCKET_X;
    const y = rocketY;

    ctx.save();
    ctx.translate(x, y);

    // Api pendorong
    flame += 0.4;
    const flameLength = 14 + Math.sin(flame) * 4;
    const flameGradient = ctx.createLinearGradient(-ROCKET_SIZE / 2 - flameLength, 0, -ROCKET_SIZE / 2, 0);
    flameGradient.addColorStop(0, 'rgba(255,209,102,0)');
    flameGradient.addColorStop(1, '#ffd166');
    ctx.fillStyle = flameGradient;
    ctx.beginPath();
    ctx.moveTo(-ROCKET_SIZE / 2, -6);
    ctx.lineTo(-ROCKET_SIZE / 2 - flameLength, 0);
    ctx.lineTo(-ROCKET_SIZE / 2, 6);
    ctx.closePath();
    ctx.fill();

    // Badan roket
    ctx.shadowColor = '#ff7a3d';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#eef1ff';
    ctx.beginPath();
    ctx.roundRect(-ROCKET_SIZE / 2, -8, ROCKET_SIZE, 16, 8);
    ctx.fill();

    // Hidung roket
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff7a3d';
    ctx.beginPath();
    ctx.moveTo(ROCKET_SIZE / 2, -8);
    ctx.lineTo(ROCKET_SIZE / 2 + 12, 0);
    ctx.lineTo(ROCKET_SIZE / 2, 8);
    ctx.closePath();
    ctx.fill();

    // Sirip
    ctx.fillStyle = '#00e5a0';
    ctx.beginPath();
    ctx.moveTo(-ROCKET_SIZE / 2, -8);
    ctx.lineTo(-ROCKET_SIZE / 2 - 8, -14);
    ctx.lineTo(-ROCKET_SIZE / 2 + 4, -8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-ROCKET_SIZE / 2, 8);
    ctx.lineTo(-ROCKET_SIZE / 2 - 8, 14);
    ctx.lineTo(-ROCKET_SIZE / 2 + 4, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawObstacle(ob) {
    ctx.fillStyle = '#3a3f57';
    ctx.strokeStyle = 'rgba(0,229,160,0.5)';
    ctx.lineWidth = 2;

    // Batu atas
    ctx.fillRect(ob.x, 0, OBSTACLE_WIDTH, ob.gapY);
    ctx.strokeRect(ob.x, 0, OBSTACLE_WIDTH, ob.gapY);

    // Batu bawah
    const bottomY = ob.gapY + GAP_SIZE;
    ctx.fillRect(ob.x, bottomY, OBSTACLE_WIDTH, canvas.height - bottomY);
    ctx.strokeRect(ob.x, bottomY, OBSTACLE_WIDTH, canvas.height - bottomY);
  }

  function checkCollision(ob) {
    const top = rocketY - ROCKET_SIZE / 2;
    const bottom = rocketY + ROCKET_SIZE / 2;
    const left = ROCKET_X - ROCKET_SIZE / 2;
    const right = ROCKET_X + ROCKET_SIZE / 2;

    const overlapsX = right > ob.x && left < ob.x + OBSTACLE_WIDTH;
    if (!overlapsX) return false;

    const hitsTop = top < ob.gapY;
    const hitsBottom = bottom > ob.gapY + GAP_SIZE;
    return hitsTop || hitsBottom;
  }

  function loop() {
    if (!running) return;

    velocity += GRAVITY;
    rocketY += velocity;

    obstacles.forEach((ob) => (ob.x -= speed));
    if (obstacles[obstacles.length - 1].x < canvas.width - 190) {
      obstacles.push({ x: canvas.width, gapY: randomGapY(), scored: false });
    }
    obstacles = obstacles.filter((ob) => ob.x + OBSTACLE_WIDTH > -10);

    obstacles.forEach((ob) => {
      if (!ob.scored && ob.x + OBSTACLE_WIDTH < ROCKET_X) {
        ob.scored = true;
        score += 1;
        scoreEl.textContent = score;
        speed += 0.08;
      }
    });

    drawBackground();
    obstacles.forEach(drawObstacle);
    drawRocket();

    const outOfBounds = rocketY - ROCKET_SIZE / 2 < 0 || rocketY + ROCKET_SIZE / 2 > canvas.height;
    const collided = obstacles.some(checkCollision);

    if (outOfBounds || collided) {
      endGame();
      return;
    }

    rafId = requestAnimationFrame(loop);
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(rafId);
    if (score > highscore) {
      highscore = score;
      localStorage.setItem(highscoreKey, String(highscore));
      highscoreEl.textContent = highscore;
    }
    overlay.hidden = false;
    overlay.querySelector('.rocket-overlay-title').textContent = 'Roket Meledak!';
    overlay.querySelector('.rocket-overlay-text').textContent = `Skor kamu: ${score}. Coba lagi?`;
    startBtn.textContent = 'Main Lagi';
  }

  function start() {
    reset();
    overlay.hidden = true;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function flap() {
    if (!running) return;
    velocity = FLAP;
  }

  startBtn.addEventListener('click', start);
  boostBtn.addEventListener('click', flap);
  canvas.addEventListener('click', flap);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    flap();
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      flap();
    }
  });

  drawBackground();
})();
