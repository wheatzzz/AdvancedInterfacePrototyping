// ── Fairy wand cursor ──
// Main star: locked exactly to mouse — no lag.
// Trail stars: a chain of N points that each follow the one ahead,
// creating a comet-tail / fairy-wand effect behind the cursor.

const TRAIL_COUNT = 7;        // number of trailing stars
const TRAIL_LERP  = 0.18;     // how tightly each trails the one ahead (lower = longer tail)
const GLYPH_MAIN  = '✦';
const GLYPH_TRAIL = ['✦','✧','✦','✧','·','·','.'];

// Inject CSS
const s = document.createElement('style');
s.textContent = `
  .c-main, .c-trail {
    position: fixed;
    pointer-events: none;
    transform: translate(-50%, -50%);
    line-height: 1;
    will-change: left, top;
    user-select: none;
  }
  .c-main {
    z-index: 9999;
    font-size: 20px;
    color: #F0C040;
    filter: drop-shadow(0 0 7px rgba(240,192,64,0.8));
    transition: font-size 0.12s cubic-bezier(0.22,1,0.36,1),
                filter 0.12s;
  }
  .c-trail {
    z-index: 9998;
    color: #F0C040;
  }
`;
document.head.appendChild(s);

// Create main star — positioned directly on mouse
const main = document.createElement('div');
main.className = 'c-main';
main.textContent = GLYPH_MAIN;
document.body.appendChild(main);

// Create trail chain — each one follows the previous
const trail = [];
for (let i = 0; i < TRAIL_COUNT; i++) {
  const el = document.createElement('div');
  el.className = 'c-trail';
  el.textContent = GLYPH_TRAIL[i];
  // Size and opacity taper off down the tail
  const t = (i + 1) / TRAIL_COUNT;          // 0 → 1 along tail
  el.style.fontSize  = (14 - i * 1.5) + 'px';
  el.style.opacity   = (0.75 - t * 0.62).toFixed(2);
  document.body.appendChild(el);
  trail.push({ el, x: 0, y: 0 });
}

// Track real mouse — no lag
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Animate: main star snaps to mouse, each trail point lerps toward the one ahead
function tick() {
  // Main star — instant
  main.style.left = mouseX + 'px';
  main.style.top  = mouseY + 'px';

  // First trail point follows mouse with lerp
  trail[0].x += (mouseX - trail[0].x) * TRAIL_LERP;
  trail[0].y += (mouseY - trail[0].y) * TRAIL_LERP;

  // Each subsequent point follows the one before it
  for (let i = 1; i < TRAIL_COUNT; i++) {
    trail[i].x += (trail[i-1].x - trail[i].x) * TRAIL_LERP;
    trail[i].y += (trail[i-1].y - trail[i].y) * TRAIL_LERP;
  }

  // Apply positions
  for (const t of trail) {
    t.el.style.left = t.x + 'px';
    t.el.style.top  = t.y + 'px';
  }

  requestAnimationFrame(tick);
}
tick();

// Grow on hover
document.addEventListener('mouseover', e => {
  if (e.target.closest('a, button')) {
    main.style.fontSize = '28px';
    main.style.filter = 'drop-shadow(0 0 14px rgba(240,192,64,1))';
  } else {
    main.style.fontSize = '20px';
    main.style.filter = 'drop-shadow(0 0 7px rgba(240,192,64,0.8))';
  }
});

// ── Nav scroll ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Active nav ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => sectionObserver.observe(s));

// ── Smooth scroll ──
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 72,
          behavior: 'smooth'
        });
      }
    }
  });
});

// ── Scroll reveal ──
const revealEls = document.querySelectorAll(
  '.about-layout, .theme-pill, .contribution-row, .image-pair, .project-figure, .reflection-card, .plain-card, .future-role-block, .ai-tools-row, .reflection-two-col'
);
revealEls.forEach(el => el.classList.add('scroll-reveal'));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const siblings = [...entry.target.parentElement.querySelectorAll('.scroll-reveal')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ── Page load ──
document.body.style.opacity = '0';
window.addEventListener('load', () => {
  document.body.style.transition = 'opacity 0.5s ease';
  document.body.style.opacity = '1';
});

// ── AI Carousel ──
const track   = document.getElementById('carouselTrack');
const dots    = document.querySelectorAll('.dot');
const thumb   = document.getElementById('spectrumThumb');
const wrap    = document.querySelector('.carousel-track-wrap');

const THUMB_POS  = ['4%', '50%', '96%'];
const THUMB_COLS = ['#55C2C3', '#F0C040', '#e07a7a'];
const TOTAL = 3;
let current = 0;
let isAnimating = false;

function goTo(idx) {
  if (isAnimating) return;
  current = (idx + TOTAL) % TOTAL;
  isAnimating = true;
  track.style.transform = `translateX(-${current * 100}%)`;
  setTimeout(() => isAnimating = false, 520);

  dots.forEach((d, i) => d.classList.toggle('active', i === current));
  thumb.style.left        = THUMB_POS[current];
  thumb.style.borderColor = THUMB_COLS[current];
}

// Dot clicks
dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.idx)));

// ── Two-finger trackpad swipe (wheel event with deltaX) ──
let wheelAccum = 0;
let wheelTimer = null;
wrap.addEventListener('wheel', e => {
  // Only intercept horizontal scroll
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
  e.preventDefault();

  wheelAccum += e.deltaX;
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => {
    if (wheelAccum > 40)       goTo(current + 1);
    else if (wheelAccum < -40) goTo(current - 1);
    wheelAccum = 0;
  }, 80);
}, { passive: false });

// ── Touch swipe (mobile) ──
let touchStartX = 0;
wrap.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
wrap.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (dx < -40)      goTo(current + 1);
  else if (dx > 40)  goTo(current - 1);
}, { passive: true });

// ── Keyboard fallback ──
wrap.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  goTo(current - 1);
  if (e.key === 'ArrowRight') goTo(current + 1);
});

// Init
goTo(0);