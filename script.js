document.addEventListener('DOMContentLoaded', function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ============================ BOOT SEQUENCE ============================ */
  (function boot() {
    const boot = document.getElementById('boot');
    if (!boot) return;
    const lines = boot.querySelectorAll('.boot-line');
    const bar = boot.querySelector('.boot-bar i');

    function finish() {
      boot.classList.add('hidden');
      document.body.style.overflow = '';
      setTimeout(() => boot.remove(), 700);
    }

    if (prefersReduced) { finish(); return; }

    document.body.style.overflow = 'hidden';
    let delay = 120;
    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('show'), delay);
      delay += 160 + Math.random() * 120;
    });
    setTimeout(() => { if (bar) bar.style.width = '100%'; }, 100);
    setTimeout(finish, delay + 500);

    boot.addEventListener('click', finish);
    document.addEventListener('keydown', function skip(e) {
      finish();
      document.removeEventListener('keydown', skip);
    }, { once: true });
  })();

  /* ============================ CUSTOM CURSOR ============================ */
  if (isFinePointer && !prefersReduced) {
    document.body.classList.add('has-custom-cursor');
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mousedown', () => ring.classList.add('clicking'));
    document.addEventListener('mouseup', () => ring.classList.remove('clicking'));

    const hoverables = 'a, button, .btn, .btn-small, .skill-tag, input, .theme-toggle, .project-card, .contact-item, .certification-item';
    document.querySelectorAll(hoverables).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
  }

  /* ============================ NAV / HEADER ============================ */
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => nav.classList.toggle('active'));
    document.querySelectorAll('.nav-link').forEach(link =>
      link.addEventListener('click', () => nav.classList.remove('active'))
    );
  }

  /* Measure real header + ticker height so nothing overlaps, at any font/zoom/screen size */
  function positionChrome() {
    const headerEl = document.querySelector('header');
    const tickerEl = document.querySelector('.ticker');
    const heroEl = document.querySelector('.hero');
    const navEl = document.querySelector('#navbar');
    if (!headerEl || !tickerEl || !heroEl) return;
    const headerH = headerEl.getBoundingClientRect().height;
    tickerEl.style.top = headerH + 'px';
    const tickerH = tickerEl.getBoundingClientRect().height;
    heroEl.style.paddingTop = (headerH + tickerH + 48) + 'px';
    if (navEl) navEl.style.top = headerH + 'px';
  }
  positionChrome();
  window.addEventListener('resize', positionChrome);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(positionChrome);
  }
  setTimeout(positionChrome, 400);

  const header = document.querySelector('header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
    });
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + current));
  });

  /* ============================ REVEAL ON SCROLL ============================ */
  const revealTargets = document.querySelectorAll(
    '.timeline-item, .project-card, .certification-item, .contact-item, .skill-category'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => revealObserver.observe(el));

  /* ============================ THEME TOGGLE ============================ */
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const body = document.body;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.setAttribute('data-theme', savedTheme);
  if (themeIcon) themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      if (themeIcon) themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
  }

  /* ============================ LIVE CLOCK IN TICKER ============================ */
  const clockEls = [document.getElementById('ist-clock'), document.getElementById('ist-clock-2')].filter(Boolean);
  if (clockEls.length) {
    function updateClock() {
      const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const hh = String(ist.getHours()).padStart(2, '0');
      const mm = String(ist.getMinutes()).padStart(2, '0');
      const ss = String(ist.getSeconds()).padStart(2, '0');
      const text = `${hh}:${mm}:${ss} IST · HYDERABAD, IN`;
      clockEls.forEach(el => el.textContent = text);
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ============================ HERO GRID CANVAS ============================ */
  const canvas = document.getElementById('grid-canvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    let w, h, mouseX = -9999, mouseY = -9999;
    const spacing = 42;

    function resize() {
      const hero = canvas.closest('.hero');
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    canvas.closest('.hero').addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    canvas.closest('.hero').addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

    const isLight = () => document.body.getAttribute('data-theme') === 'light';

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const color = isLight() ? '5,5,5' : '255,255,255';
      for (let x = 0; x <= w; x += spacing) {
        for (let y = 0; y <= h; y += spacing) {
          const dx = x - mouseX, dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / 180);
          const r = 1 + influence * 2.4;
          const alpha = 0.12 + influence * 0.55;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color},${alpha})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ============================ TILT ON PROJECT CARDS ============================ */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${py * -5}deg) rotateY(${px * 5}deg) translateZ(0)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ============================ TERMINAL ============================ */
  (function terminal() {
    const body = document.getElementById('terminal-body');
    const input = document.getElementById('terminal-input');
    if (!body || !input) return;

    const responses = {
      help: "AVAILABLE COMMANDS: whoami · projects · experience · skills · education · contact · resume · sudo hire me · clear",
      whoami: "Manas Gunti — B.Tech IT student (VIT), currently Technical Analyst @ ION Group, Cleared Derivatives division. AI/ML enthusiast who ended up on a trading floor.",
      projects: 'Scroll to <a href="#projects">#projects</a> or run: cat AnemiaSense.py, cat sleep-analysis.ipynb, cat LexiFlow.js',
      experience: 'Currently: Technical Analyst @ ION Group (Jan 2026–Present). Before that: Intern @ Schneider Electric, AI/ML Intern @ FinMitr. Full log at <a href="#experience">#experience</a>.',
      skills: "Python · Java · C/C++ · SQL · JS · TensorFlow · PyTorch · Apache Spark · AWS · React · Flask — full manifest at #skills",
      education: "B.Tech Information Technology @ VIT, Tamil Nadu — CGPA 9.08. Full record at <a href=\"#education\">#education</a>.",
      contact: 'Reach out: <a href="mailto:manas.gunti@gmail.com">manas.gunti@gmail.com</a> or <a href="https://www.linkedin.com/in/manas-gunti-33451b252/" target="_blank">LinkedIn</a>.',
      resume: 'Opening resume... <a href="files/resume.pdf" target="_blank">files/resume.pdf</a>',
      'sudo hire me': "PERMISSION GRANTED. Redirecting to #contact — let's talk.",
      clear: null
    };

    function print(text, cls) {
      const line = document.createElement('div');
      line.className = 'terminal-line' + (cls ? ' ' + cls : '');
      line.innerHTML = text;
      body.appendChild(line);
      body.scrollTop = body.scrollHeight;
    }

    function run(raw) {
      const cmd = raw.trim();
      if (!cmd) return;
      print(cmd, 'cmd');
      const key = cmd.toLowerCase();
      if (key === 'clear') { body.innerHTML = ''; return; }
      if (responses[key]) {
        print(responses[key]);
        if (key === 'resume') window.open('files/resume.pdf', '_blank');
        if (key === 'sudo hire me') setTimeout(() => { window.location.hash = '#contact'; }, 500);
      } else {
        print(`command not found: ${cmd} — type "help"`);
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        run(input.value);
        input.value = '';
      }
    });
    body.addEventListener('click', () => input.focus());
  })();

  /* ============================ KONAMI EASTER EGG ============================ */
  (function konami() {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;
    document.addEventListener('keydown', (e) => {
      pos = (e.key === seq[pos]) ? pos + 1 : 0;
      if (pos === seq.length) {
        pos = 0;
        toggleMatrix();
      }
    });

    let matrixOn = false, matrixCanvas, matrixCtx, matrixInterval;
    function toggleMatrix() {
      matrixOn = !matrixOn;
      let overlay = document.getElementById('matrix-overlay');
      if (!overlay) {
        overlay = document.createElement('canvas');
        overlay.id = 'matrix-overlay';
        document.body.appendChild(overlay);
      }
      overlay.classList.toggle('active', matrixOn);
      if (matrixOn) {
        matrixCanvas = overlay;
        matrixCtx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        const cols = Math.floor(matrixCanvas.width / 16);
        const drops = new Array(cols).fill(0);
        const chars = '01アイウエオカキクケコMANASGUNTI';
        matrixInterval = setInterval(() => {
          matrixCtx.fillStyle = 'rgba(0,0,0,0.08)';
          matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
          matrixCtx.fillStyle = '#fff';
          matrixCtx.font = '14px monospace';
          drops.forEach((y, i) => {
            const char = chars[Math.floor(Math.random() * chars.length)];
            matrixCtx.fillText(char, i * 16, y);
            drops[i] = (y > matrixCanvas.height && Math.random() > 0.975) ? 0 : y + 16;
          });
        }, 40);
        overlay.addEventListener('click', () => { toggleMatrix(); });
      } else {
        clearInterval(matrixInterval);
        setTimeout(() => { if (overlay) overlay.getContext('2d').clearRect(0,0,overlay.width,overlay.height); }, 300);
      }
    }
  })();

});
