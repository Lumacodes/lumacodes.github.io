// Immediately show body if JS fails
document.body.style.opacity = 1;

// Proper load event listener
window.addEventListener('DOMContentLoaded', () => {
  // Show body with transition
  document.body.style.opacity = 1;

  // Theme toggle
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) {
    root.classList.add('dark');
  }

  const themeBtn = document.getElementById('theme-toggle');
  function updateThemeBtn() {
    themeBtn.textContent = root.classList.contains('dark') ? 'Toggle light' : 'Toggle dark';
  }

  themeBtn.addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
    updateThemeBtn();
  });
  updateThemeBtn();

  // Progress bar
  const progress = document.getElementById('progress');
  let raf = null;
  function onScroll() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const p = scrollTop / (scrollHeight - clientHeight) || 0;
      progress.style.transform = `scaleX(${p})`;
    });
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal animations
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('revealed');
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
  }

  // Typewriter effect
  (function () {
    const words = ['Lumacodes!', 'Subhajit ^_^'];
    const el = document.getElementById('typewriter');
    if (!el) return;

    let wordIndex = 0, charIndex = 0, deleting = false;
    const T = { type: 90, del: 45, hold: 900 };

    function step() {
      const word = words[wordIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) {
          deleting = true;
          setTimeout(step, T.hold);
          return;
        }
      } else {
        charIndex--;
        el.textContent = word.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
      setTimeout(step, deleting ? T.del : T.type);
    }
    step();
  })();

  // GitHub repos
  const grid = document.getElementById('grid');
  if (!grid) return;

  const GH_USER = 'Lumacodes';
  const LIMIT = 12;

  function bentoClass(i) {
    if (i % 6 === 0) return 'span-8 row-2';
    if (i % 6 === 1) return 'span-4';
    if (i % 6 === 2) return 'span-6';
    if (i % 6 === 3) return 'span-4';
    if (i % 6 === 4) return 'span-6';
    return 'span-4';
  }

  function esc(s) {
    return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function repoCard(r, i) {
    const desc = esc(r.description);
    const lang = r.language ? `<span class="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">${esc(r.language)}</span>` : '';
    const topics = (r.topics || []).slice(0, 3).map(t => `<span class="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">${esc(t)}</span>`).join('');
    return `
      <article class="bento-item ${bentoClass(i)} reveal hover:shadow-lg transition-transform will-change-transform hover:scale-[1.01]">
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-lg font-semibold tracking-tight"><a class="link" href="${r.html_url}" target="_blank" rel="noreferrer">${esc(r.name)}</a></h3>
          <a class="text-sm link opacity-70" href="${r.html_url}" target="_blank" rel="noreferrer">Open</a>
        </div>
        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">${desc}</p>
        <div class="mt-4 flex flex-wrap gap-2">${lang}${topics}</div>
      </article>`;
  }

  async function loadRepos() {
    try {
      const res = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=100`, {
        headers: { 'Accept': 'application/vnd.github+json' }
      });
      if (!res.ok) throw new Error('GitHub API error');

      const all = await res.json();
      if (!Array.isArray(all)) throw new Error('GitHub error');

      const repos = all.filter(r => !r.fork && r.description && r.description.trim().length > 0)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, LIMIT);

      if (!repos.length) {
        grid.innerHTML = `<div class="bento-item span-12"><p class="text-sm">No described repos yet. Add descriptions on GitHub to feature them automatically.</p></div>`;
        return;
      }

      grid.innerHTML = repos.map(repoCard).join('');

      // Attach reveals for newly created nodes
      if (!prefersReduced) {
        document.querySelectorAll('#grid .reveal').forEach(el => {
          const o = new IntersectionObserver(es => {
            es.forEach(e => {
              if (e.isIntersecting) e.target.classList.add('revealed');
            });
          }, { threshold: 0.12 });
          o.observe(el);
        });
      } else {
        document.querySelectorAll('#grid .reveal').forEach(el => el.classList.add('revealed'));
      }
    } catch (e) {
      console.error('Error loading repos:', e);
      grid.innerHTML = `<div class="bento-item span-12"><p class="text-sm">Couldn't load repos. Visit <a class="link" href="https://github.com/${GH_USER}">@${GH_USER}</a>.</p></div>`;
    }
  }
  loadRepos();

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
