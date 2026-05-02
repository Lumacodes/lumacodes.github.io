# Luma — Portfolio

> soft terminal · lo-fi · anime-coded · zero dependencies · GitHub Pages

## Features
- 🎆 Particle canvas with floating orbs + grid
- ⌨️ Typewriter tagline (6 rotating phrases)
- 🎯 GPU-accelerated custom cursor (transform-based, no jitter)
- 🎵 Music player with Web Audio API visualizer
- 🤖 AI terminal powered by OpenRouter (key injected by CI — never in source)
- 🐙 Live GitHub API repo cards
- 📜 Scroll reveal animations
- 📱 Fully responsive

## Tech stack
Vanilla HTML · Vanilla CSS · Vanilla JS · GitHub Actions

---

## Deploy to GitHub Pages (with AI terminal)

### Step 1 — Add your OpenRouter key as a GitHub secret

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `OPENROUTER_API_KEY`
4. Value: your key (e.g. `sk-or-v1-xxxxx`)
5. Click **Add secret**

### Step 2 — Configure GitHub Pages to serve from `gh-pages` branch

1. Go to **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Branch: **`gh-pages`** / folder: **`/ (root)`**
4. Click **Save**

### Step 3 — Push your source to `main`

```bash
git add .
git commit -m "feat: portfolio with AI terminal"
git push origin main
```

GitHub Actions will automatically:
- Inject your key into `config.js` (this file is never committed)
- Push the built site to `gh-pages`
- GitHub Pages serves `gh-pages` live at `luma.is-a.dev`

### Local dev

For local testing, edit `config.js` directly:
```js
window.LUMA_CONFIG = {
  openrouterKey: 'sk-or-v1-your-real-key',
};
```
This file is in `.gitignore` so it will never be accidentally pushed.

---

## License
MIT
