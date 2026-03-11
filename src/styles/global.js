export const globalCss = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700;900&display=swap');

:root {
  --b0: #0E1117;
  --b1: #161B27;
  --b2: #1E2434;
  --b3: #262E42;
  --b4: #2F3850;
  --b5: #39435E;
  --bd: rgba(255,255,255,.18);
  --bd2: rgba(255,255,255,.28);
  --t1: #F0F0F5;
  --t2: #C2C2CB;
  --t3: #9898A6;
  --t4: #6A6A7A;
  --accent: #00E5FF;
  --accent-dim: rgba(0,229,255,.10);
  --danger: #FF375F;
  --success: #32D74B;
  --warn:  #FFD60A;
  --f:  'Noto Sans SC', system-ui, -apple-system, sans-serif;
  --fm: 'JetBrains Mono', 'Fira Code', monospace;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --r-sm: 6px;
  --r-md: 10px;
  --r-lg: 14px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body { font-family: var(--f); font-size: 14px; color: var(--t1); background: var(--b0); }

*:focus { outline: none; }
*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--r-sm); }

.sc::-webkit-scrollbar { width: 5px; height: 5px; }
.sc::-webkit-scrollbar-track { background: transparent; }
.sc::-webkit-scrollbar-thumb { background: var(--b4); border-radius: 3px; }
.sc::-webkit-scrollbar-thumb:hover { background: var(--b5); }

@keyframes fd { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes sp { to { transform:rotate(360deg); } }
@keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }

.fd { animation: fd .35s cubic-bezier(.22, 1, .36, 1) both; }

/* Button interaction */
.gf-btn { transition: filter .15s ease, transform .12s ease, box-shadow .15s ease; }
.gf-btn:hover:not(:disabled) { filter: brightness(1.18) saturate(1.08); }
.gf-btn:active:not(:disabled) { transform: scale(.95); }

/* Card interaction */
.gf-card-i { transition: border-color .15s ease, background-color .15s ease; }
.gf-card-i:hover { border-color: rgba(255,255,255,.35) !important; background-color: var(--b3) !important; }

/* Form input focus */
.gf-input:focus { border-color: rgba(0,229,255,.55) !important; box-shadow: 0 0 0 3px rgba(0,229,255,.10) !important; outline: none !important; }
.gf-select:focus { border-color: rgba(0,229,255,.55) !important; box-shadow: 0 0 0 3px rgba(0,229,255,.10) !important; outline: none !important; }
.gf-textarea:focus { border-color: rgba(0,229,255,.55) !important; box-shadow: 0 0 0 3px rgba(0,229,255,.10) !important; outline: none !important; }

/* Step nav active underline */
.gf-step-active { position: relative; }
.gf-step-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
}

/* Filter pill */
.gf-pill { transition: background .15s, color .15s, border-color .15s; }
.gf-pill:hover { border-color: rgba(255,255,255,.20) !important; }

/* Responsive breakpoints */
@media (max-width: 640px) {
  .sm-col1 { grid-template-columns: 1fr !important; }
  .sm-hide { display: none !important; }
  .sm-full { max-width: 100% !important; }
  .sm-wrap { flex-wrap: wrap !important; }
  .sm-p2 { padding: 8px !important; }
  .sm-gap2 { gap: 8px !important; }
}
@media (max-width: 768px) {
  .md-col1 { grid-template-columns: 1fr !important; }
  .md-hide { display: none !important; }
}
@media (min-width: 1280px) {
  .xl-wide { max-width: 1100px !important; }
}
`;
