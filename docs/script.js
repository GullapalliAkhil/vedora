document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll effect ──────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  // ── Mobile menu toggle ────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // ── Scroll reveal with stagger ────────────
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ── Animated counter (stats) ──────────────
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const start = performance.now();

        function easeOutExpo(t) {
          return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const value = Math.round(easeOutExpo(progress) * target);
          el.textContent = value + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => countObserver.observe(c));
  }

  // ── Smooth parallax on hero card ──────────
  const heroCard = document.querySelector('.hero-card');
  if (heroCard) {
    const heroSection = document.querySelector('.hero');
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroCard.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      heroCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
      heroCard.style.transition = 'transform .6s cubic-bezier(.4,0,.2,1)';
      setTimeout(() => { heroCard.style.transition = ''; }, 600);
    });
  }

  // ── Why-cards: 3D tilt + cursor glow ─────
  document.querySelectorAll('.why-card').forEach(card => {
    const highlight = card.querySelector('.card-highlight');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -8;
      const rotateY = ((x - cx) / cx) * 8;

      card.style.transform =
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.03)`;

      if (highlight) {
        highlight.style.left = x + 'px';
        highlight.style.top = y + 'px';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .6s cubic-bezier(.4,0,.2,1), box-shadow .5s';
      setTimeout(() => { card.style.transition = ''; }, 600);
    });
  });

  // ── Magnetic button effect ────────────────
  document.querySelectorAll('.btn-primary, .call-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translateY(-3px) translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ── Panorama auto-pan (viewBox scroll) ──
  const panoSvg = document.querySelector('.pano-track svg');
  const panoBar = document.getElementById('panoBar');
  if (panoSvg) {
    const W = 1680, VW = 560, H = 380;
    const maxX = W - VW;
    const cycleDuration = 14000;
    let startT = null, raf = null, running = false;

    function ease(t) {
      if (t < 0.3) return smoothstep(0, 0.3, t) * 0.333;
      if (t < 0.35) return 0.333;
      if (t < 0.65) return 0.333 + smoothstep(0.35, 0.65, t) * 0.334;
      if (t < 0.7) return 0.667;
      if (t < 1.0) return 0.667 + smoothstep(0.7, 1.0, t) * 0.333;
      return 1;
    }
    function smoothstep(edge0, edge1, x) {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    }

    function tick(now) {
      if (!startT) startT = now;
      const elapsed = now - startT;
      const raw = (elapsed % cycleDuration) / cycleDuration;
      const progress = ease(raw);
      const x = progress * maxX;
      panoSvg.setAttribute('viewBox', `${x} 0 ${VW} ${H}`);
      if (panoBar) panoBar.style.width = (progress * 100) + '%';
      raf = requestAnimationFrame(tick);
    }

    function start() { if (running) return; running = true; startT = null; raf = requestAnimationFrame(tick); }
    function stop() { if (!running) return; running = false; cancelAnimationFrame(raf); raf = null; }

    const panoEl = document.querySelector('.pano');
    if (panoEl) {
      new IntersectionObserver(entries => {
        entries.forEach(e => e.isIntersecting ? start() : stop());
      }, { threshold: 0.1 }).observe(panoEl);
    }
  }

  // ── Smooth page load animation ────────────
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .6s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

});
