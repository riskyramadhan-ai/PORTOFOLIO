// Tandai bahwa JS berhasil dimuat, supaya animasi reveal di CSS aktif.
// Kalau baris ini tidak sempat jalan (script gagal load), konten tetap tampil normal.
document.documentElement.classList.add('js-ready');

// Toggle menu navigasi di layar kecil
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });
}

// Animasi reveal saat elemen masuk ke layar
const revealTargets = document.querySelectorAll('.reveal, .section-title, .project-card');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
}
