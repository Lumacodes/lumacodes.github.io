/* ─────────────────────────────────────────────────────────────
   LUMA PORTFOLIO — script.js
   Features: particle bg · typewriter · custom cursor · nav scroll
             Web Audio API visualizer · music player · AI terminal
             GitHub API repos · scroll reveal · OpenRouter AI
   ───────────────────────────────────────────────────────────── */

// ── CONFIG — read from config.js (injected by CI, never committed) ──
const OPENROUTER_API_KEY = (window.LUMA_CONFIG || {}).openrouterKey || '';
const OPENROUTER_MODEL   = 'mistralai/mistral-7b-instruct';

// ── CURSOR (desktop only — hidden on touch via CSS) ──────────────
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
}, { passive: true });

// Expand on hover — event delegation, handles dynamically added elements
document.addEventListener('mouseover', e => {
  cursor.classList.toggle(
    'hovered',
    !!e.target.closest('a, button, input, .repo-card, .work-card, .progress-bar, .vol-slider, label')
  );
}, { passive: true });

// ── NAV SCROLL ───────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ── HAMBURGER ────────────────────────────────────────────────
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('nav-mobile').classList.toggle('open');
});
document.getElementById('nav-mobile').querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('nav-mobile').classList.remove('open'));
});

// ── TYPEWRITER ───────────────────────────────────────────────
const phrases = [
  'developer & creator.',
  'music producer.',
  'audio engineer.',
  'building things that feel alive.',
  'open source enthusiast.',
  'late-night coder (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
];
let pi = 0, ci = 0, deleting = false;
const typed = document.getElementById('typed-text');
function typeLoop() {
  const current = phrases[pi];
  if (!deleting) {
    typed.textContent = current.slice(0, ++ci);
    if (ci === current.length) { deleting = true; setTimeout(typeLoop, 2000); return; }
    setTimeout(typeLoop, 65);
  } else {
    typed.textContent = current.slice(0, --ci);
    if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(typeLoop, 350); return; }
    setTimeout(typeLoop, 35);
  }
}
setTimeout(typeLoop, 800);

// ── HERO PARTICLE CANVAS ─────────────────────────────────────
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Subtle grid
  function drawGrid() {
    ctx.strokeStyle = 'rgba(100,100,160,0.04)';
    ctx.lineWidth = 1;
    const spacing = 60;
    for (let x = 0; x < W; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  // Floating orbs
  const orbs = Array.from({ length: 5 }, () => ({
    x: Math.random() * 1200,
    y: Math.random() * 800,
    r: Math.random() * 200 + 80,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    hue: [260, 280, 210, 190, 310][Math.floor(Math.random() * 5)],
  }));

  function drawOrbs() {
    orbs.forEach(o => {
      o.x += o.vx; o.y += o.vy;
      if (o.x < -o.r) o.x = W + o.r;
      if (o.x > W + o.r) o.x = -o.r;
      if (o.y < -o.r) o.y = H + o.r;
      if (o.y > H + o.r) o.y = -o.r;
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, `hsla(${o.hue},60%,55%,0.07)`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Particles
  class Dot {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.5 + 0.1);
      this.size = Math.random() * 1.4 + 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.life = 0; this.maxLife = Math.random() * 400 + 200;
      const hues = [260, 180, 310, 200];
      this.hue = hues[Math.floor(Math.random() * hues.length)];
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      const p = this.life / this.maxLife;
      this.a = this.alpha * (p < 0.1 ? p / 0.1 : p > 0.8 ? (1 - p) / 0.2 : 1);
      if (this.life >= this.maxLife || this.y < -5) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.a;
      ctx.fillStyle = `hsl(${this.hue},70%,70%)`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  const dots = Array.from({ length: 80 }, () => new Dot());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawGrid(); drawOrbs();
    dots.forEach(d => { d.update(); d.draw(); });

    // connecting lines
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 80) {
          ctx.save();
          ctx.globalAlpha = (1 - dist/80) * 0.06;
          ctx.strokeStyle = '#c9b8ff';
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
          ctx.restore();
        }
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

// ── SCROLL REVEAL ────────────────────────────────────────────
document.querySelectorAll('section, .glass-card, .work-card, .sec-h, .body-text, .sec-tag').forEach(el => {
  el.classList.add('reveal');
});
const revObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      const siblings = [...e.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      setTimeout(() => e.target.classList.add('visible'), siblings.indexOf(e.target) * 50);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// ── MUSIC PLAYER + WEB AUDIO VISUALIZER ──────────────────────
(function () {
  /* ——— track list ———
     Using free/creative-commons lo-fi tracks from public URLs.
     We load them from the Free Music Archive / Chosic free music CDNs.
     Feel free to replace with your own files once you upload them to the repo. */
  const tracks = [
    {
      title: 'Lofi Study',
      artist: 'Chill Beats',
      src: './lofi.mp3',
    }
  ];

  let currentTrack = 0;
  let isPlaying = false;
  let audioCtx, analyser, source, animId;

  const audio      = document.getElementById('audio');
  const btnPlay    = document.getElementById('btn-play');
  const playIcon   = document.getElementById('play-icon');
  const btnPrev    = document.getElementById('btn-prev');
  const btnNext    = document.getElementById('btn-next');
  const trackTitle = document.getElementById('track-title');
  const trackArtist= document.getElementById('track-artist');
  const curTime    = document.getElementById('current-time');
  const durEl      = document.getElementById('duration');
  const progressFill= document.getElementById('progress-fill');
  const progressBar = document.getElementById('progress-bar');
  const volSlider  = document.getElementById('vol-slider');
  const volToggle  = document.getElementById('vol-toggle');
  const volIcon    = document.getElementById('vol-icon');
  const playerStatus= document.getElementById('player-status');
  const canvas     = document.getElementById('visualizer');
  const ctx        = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  function loadTrack(idx) {
    audio.src = tracks[idx].src;
    trackTitle.textContent  = tracks[idx].title;
    trackArtist.textContent = tracks[idx].artist;
    progressFill.style.width = '0%';
    curTime.textContent = '0:00';
    durEl.textContent = '0:00';
    if (isPlaying) audio.play().catch(() => {});
  }

  function initAudioCtx() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    drawVisualizer();
  }

  function drawVisualizer() {
    const bufLen = analyser.frequencyBinCount;
    const data   = new Uint8Array(bufLen);

    function frame() {
      animId = requestAnimationFrame(frame);
      analyser.getByteFrequencyData(data);

      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const barW = (W / bufLen) * 2.2;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const barH = (data[i] / 255) * H * 0.85;
        // gradient bar: accent to accent2
        const grad = ctx.createLinearGradient(0, H - barH, 0, H);
        grad.addColorStop(0, 'rgba(201,184,255,0.9)');
        grad.addColorStop(1, 'rgba(157,229,201,0.4)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, H - barH, barW - 1, barH);
        x += barW;
      }
    }
    frame();
  }

  function drawIdleVisualizer() {
    // gentle sine wave when paused
    let t = 0;
    function idle() {
      if (isPlaying) return;
      animId = requestAnimationFrame(idle);
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(201,184,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = H/2 + Math.sin((x / W) * Math.PI * 6 + t) * (H * 0.18);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      t += 0.03;
    }
    idle();
  }
  drawIdleVisualizer();

  async function togglePlay() {
    initAudioCtx();
    if (!audio.src || audio.src === window.location.href) loadTrack(currentTrack);
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      playIcon.className = 'fas fa-play';
      playerStatus.textContent = '♪ paused';
      drawIdleVisualizer();
    } else {
      try {
        await audio.play();
        isPlaying = true;
        playIcon.className = 'fas fa-pause';
        playerStatus.textContent = '♪ now playing';
      } catch (e) {
        console.warn('play failed:', e);
      }
    }
  }

  btnPlay.addEventListener('click', togglePlay);

  btnNext.addEventListener('click', () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
  });

  btnPrev.addEventListener('click', () => {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrack);
  });

  audio.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    curTime.textContent = fmtTime(audio.currentTime);
    durEl.textContent   = fmtTime(audio.duration);
  });

  progressBar.addEventListener('click', e => {
    const rect = progressBar.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    if (audio.duration) audio.currentTime = pct * audio.duration;
  });

  audio.volume = parseFloat(volSlider.value);
  volSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volSlider.value);
    volIcon.className = audio.volume === 0 ? 'fas fa-volume-xmark' : 'fas fa-volume-high';
  });

  let muted = false;
  let lastVol = 0.7;
  volToggle.addEventListener('click', () => {
    muted = !muted;
    audio.volume = muted ? 0 : lastVol;
    volSlider.value = audio.volume;
    volIcon.className = muted ? 'fas fa-volume-xmark' : 'fas fa-volume-high';
  });

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  // Auto-load first track metadata
  loadTrack(0);
})();

// ── GITHUB REPOS API ─────────────────────────────────────────
(async function () {
  const grid = document.getElementById('repos-grid');
  const langColors = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5',
    HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
    Vue: '#41b883', Svelte: '#ff3e00', Go: '#00add8',
  };

  try {
    const res  = await fetch('https://api.github.com/users/Lumacodes/repos?per_page=9&sort=pushed&type=public');
    const repos = await res.json();
    grid.innerHTML = '';
    if (!Array.isArray(repos) || repos.length === 0) {
      grid.innerHTML = '<div class="repo-loading">no public repos found yet.</div>';
      return;
    }
    repos.slice(0, 9).forEach(repo => {
      const color  = langColors[repo.language] || '#666';
      const el = document.createElement('a');
      el.href = repo.html_url;
      el.target = '_blank';
      el.rel = 'noopener';
      el.className = 'repo-card reveal';
      el.innerHTML = `
        <div class="repo-name">⚡ ${repo.name}</div>
        <div class="repo-desc">${repo.description || 'no description'}</div>
        <div class="repo-meta">
          ${repo.language ? `<span class="repo-lang"><span class="lang-dot" style="background:${color}"></span>${repo.language}</span>` : ''}
          <span class="repo-stars"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
        </div>
      `;
      grid.appendChild(el);
    });
    // observe newly added cards
    grid.querySelectorAll('.reveal').forEach(el => revObs.observe(el));
  } catch (e) {
    grid.innerHTML = '<div class="repo-loading">couldn\'t load repos right now. check <a href="https://github.com/Lumacodes" target="_blank" style="color:var(--accent)">github.com/lumacodes</a> ♡</div>';
  }

  // revObs might not be defined yet (hoisting issue) — safe fallback
  function revObs_safe(el) {
    if (typeof revObs !== 'undefined') revObs.observe(el);
  }
})();

// ── AI TERMINAL — powered by OpenRouter ──────────────────────
(function () {
  const termBody = document.getElementById('terminal-body');
  const input    = document.getElementById('terminal-input');

  // ── System prompt that defines Luma's AI persona ─────────
  const SYSTEM_PROMPT = `You are Luma's AI persona living inside his portfolio terminal.
Your personality: bubbly, warm, soft-spoken, a little anime-coded, knowledgeable about code and music.
You speak in lowercase, use kaomoji occasionally (｡•̀ᴗ-)✧  (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧  (╥_╥)  >>//<  ♡  ~
You are representing Luma, a self-taught developer, music producer, and audio engineer from India.
His skills: React, TypeScript, Python, Node.js, Web Audio API, Ableton Live, CSS, Three.js.
His email: lumacodes@proton.me · GitHub: github.com/lumacodes · X: @lumacodes
Keep replies SHORT (2-4 sentences max). No markdown. No bullet formatting unless asked.
If someone asks something you genuinely don't know, admit it cutely and suggest they check his GitHub.`;

  // ── Canned responses for shell-like commands ──────────────
  const SHELL = {
    help: `available commands:\n  about     → who is luma?\n  skills    → tech stack\n  music     → what luma produces\n  contact   → reach luma\n  projects  → his work\n  joke      → 😔\n  secret    → ✨\n  clear/cls → clear screen\n\nor just chat naturally — i'm powered by AI now!`,
    about:    `luma is a self-taught dev, music producer, and audio engineer. obsessed with the intersection of code and sound. 100% open source, fueled by coffee and lo-fi beats. (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧`,
    skills:   `frontend: react, typescript, html, css, canvas api\nbackend: node.js, python, bash\naudio: web audio api, ableton live\ntools: git, figma, linux, vscode\nlearning: three.js, wasm`,
    music:    `luma produces lo-fi, ambient, and electronic music. also does audio engineering — mixing, mastering, music production instruction. music is literally the other half of his brain (╥_╥)♪`,
    contact:  `📧 lumacodes@proton.me\n🐙 github.com/lumacodes\n🐦 @lumacodes on X`,
    projects: `• lumacodes.github.io — this portfolio (you're here!)\n• AI companion — 3D VTuber with lip-sync & LLM\n• audio tools — browser-based spectrum/waveform utils\n• open source utils — cli tools & automation\n→ github.com/lumacodes`,
    ls:       `about/   projects/   music/   contact/   secret/`,
    pwd:      `/home/luma/portfolio`,
    'cat readme': `built with ♡ and vanilla js. no frameworks were harmed. MIT licensed.`,
  };
  const jokes   = ['why do programmers prefer dark mode? because light attracts bugs! 🐛','how many programmers to change a lightbulb? none — hardware problem lol','i\'d tell a UDP joke... but you might not get it (╥_╥)','a SQL query walks into a bar and asks two tables: "can i join you?" hehe'];
  const secrets = ['✨ luma debugged for 6 hours only to find a missing semicolon. we don\'t talk about it.','🌙 most of this site was built midnight–3am to lo-fi music.','🎵 luma has a playlist for every mood. every single one.','☕ the coffee counter in the about section is very real and very concerning.'];
  let jokeIdx = 0, secretIdx = 0;

  // ── Helpers ───────────────────────────────────────────────
  function appendLine(promptText, cmdText) {
    const line = document.createElement('div');
    line.className = 't-line';
    line.innerHTML = `<span class="t-prompt">${promptText}</span><span class="t-cmd">${cmdText}</span>`;
    termBody.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function appendOutput(text, cls = 'ai') {
    const out = document.createElement('div');
    out.className = `t-output ${cls}`;
    out.innerHTML = text;
    termBody.appendChild(out);
    termBody.scrollTop = termBody.scrollHeight;
    return out;
  }

  // Typewriter effect for AI responses
  function typeOut(el, text, speed = 18) {
    el.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
      el.textContent += text[i++];
      termBody.scrollTop = termBody.scrollHeight;
      if (i >= text.length) clearInterval(timer);
    }, speed);
  }

  // ── OpenRouter call ───────────────────────────────────────
  async function askAI(userMessage) {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('REPLACE')) {
      return `(AI offline — add your openrouter key to script.js to enable real AI responses~)`;
    }
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lumacodes.github.io',
        'X-Title': 'Luma Portfolio Terminal',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userMessage },
        ],
        max_tokens: 200,
        temperature: 0.85,
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '...';
  }

  // ── Process a command / message ───────────────────────────
  async function processCmd(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    input.disabled = true;

    appendLine('luma ~', raw);

    // Shell commands — instant, no API
    if (cmd === 'clear' || cmd === 'cls') {
      termBody.innerHTML = '';
      input.disabled = false; return;
    }
    if (SHELL[cmd]) {
      setTimeout(() => { appendOutput(SHELL[cmd]); input.disabled = false; }, 80);
      return;
    }
    if (cmd === 'joke') {
      setTimeout(() => { appendOutput(jokes[jokeIdx++ % jokes.length]); input.disabled = false; }, 80);
      return;
    }
    if (cmd === 'secret') {
      setTimeout(() => { appendOutput(secrets[secretIdx++ % secrets.length]); input.disabled = false; }, 80);
      return;
    }
    if (cmd === 'ls' || cmd === 'dir') {
      setTimeout(() => { appendOutput(SHELL.ls); input.disabled = false; }, 80);
      return;
    }
    if (cmd === 'pwd') {
      setTimeout(() => { appendOutput(SHELL.pwd); input.disabled = false; }, 80);
      return;
    }

    // Everything else → OpenRouter AI
    const thinkingEl = appendOutput('thinking...', 'ai');
    try {
      const reply = await askAI(raw);
      thinkingEl.textContent = '';
      typeOut(thinkingEl, reply);
    } catch (err) {
      thinkingEl.className = 't-output error';
      thinkingEl.textContent = `couldn't reach AI right now (${err.message}) — check your key or try again~`;
    } finally {
      input.disabled = false;
      input.focus();
    }
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !input.disabled) {
      const val = input.value.trim();
      input.value = '';
      processCmd(val);
    }
  });

  // Auto-focus terminal when scrolled into view
  const tObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) input.focus({ preventScroll: true });
  }, { threshold: 0.5 });
  tObs.observe(document.getElementById('terminal'));
})();

// safe scroll observe for repos loaded async
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const siblings = [...(e.target.parentElement?.querySelectorAll('.reveal:not(.visible)') || [])];
      setTimeout(() => e.target.classList.add('visible'), siblings.indexOf(e.target) * 50);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));
