'use strict';

// Resolve xterm UMD globals defensively (scoped v5 attaches these to window).
const Terminal = window.Terminal;
const FitAddon = (window.FitAddon && window.FitAddon.FitAddon) || window.FitAddon;
const WebLinksAddon =
  (window.WebLinksAddon && window.WebLinksAddon.WebLinksAddon) || window.WebLinksAddon;
const SearchAddon =
  (window.SearchAddon && window.SearchAddon.SearchAddon) || window.SearchAddon;

const api = window.claudeDesktop;

// ---- terminal color themes ----
const THEMES = {
  'Catppuccin Mocha': {
    background: '#181825', foreground: '#cdd6f4', cursor: '#f5e0dc', selectionBackground: '#585b70',
    black: '#45475a', red: '#f38ba8', green: '#a6e3a1', yellow: '#f9e2af',
    blue: '#89b4fa', magenta: '#f5c2e7', cyan: '#94e2d5', white: '#bac2de',
    brightBlack: '#585b70', brightRed: '#f38ba8', brightGreen: '#a6e3a1', brightYellow: '#f9e2af',
    brightBlue: '#89b4fa', brightMagenta: '#f5c2e7', brightCyan: '#94e2d5', brightWhite: '#a6adc8',
  },
  'Dracula': {
    background: '#282a36', foreground: '#f8f8f2', cursor: '#f8f8f2', selectionBackground: '#44475a',
    black: '#21222c', red: '#ff5555', green: '#50fa7b', yellow: '#f1fa8c',
    blue: '#bd93f9', magenta: '#ff79c6', cyan: '#8be9fd', white: '#f8f8f2',
    brightBlack: '#6272a4', brightRed: '#ff6e6e', brightGreen: '#69ff94', brightYellow: '#ffffa5',
    brightBlue: '#d6acff', brightMagenta: '#ff92df', brightCyan: '#a4ffff', brightWhite: '#ffffff',
  },
  'Tokyo Night': {
    background: '#1a1b26', foreground: '#a9b1d6', cursor: '#c0caf5', selectionBackground: '#33467c',
    black: '#15161e', red: '#f7768e', green: '#9ece6a', yellow: '#e0af68',
    blue: '#7aa2f7', magenta: '#bb9af7', cyan: '#7dcfff', white: '#a9b1d6',
    brightBlack: '#414868', brightRed: '#f7768e', brightGreen: '#9ece6a', brightYellow: '#e0af68',
    brightBlue: '#7aa2f7', brightMagenta: '#bb9af7', brightCyan: '#7dcfff', brightWhite: '#c0caf5',
  },
  'Solarized Dark': {
    background: '#002b36', foreground: '#839496', cursor: '#93a1a1', selectionBackground: '#073642',
    black: '#073642', red: '#dc322f', green: '#859900', yellow: '#b58900',
    blue: '#268bd2', magenta: '#d33682', cyan: '#2aa198', white: '#eee8d5',
    brightBlack: '#002b36', brightRed: '#cb4b16', brightGreen: '#586e75', brightYellow: '#657b83',
    brightBlue: '#839496', brightMagenta: '#6c71c4', brightCyan: '#93a1a1', brightWhite: '#fdf6e3',
  },
  'GitHub Light': {
    background: '#ffffff', foreground: '#24292e', cursor: '#24292e', selectionBackground: '#c8e1ff',
    black: '#24292e', red: '#d73a49', green: '#28a745', yellow: '#dbab09',
    blue: '#0366d6', magenta: '#5a32a3', cyan: '#0598bc', white: '#6a737d',
    brightBlack: '#959da5', brightRed: '#cb2431', brightGreen: '#22863a', brightYellow: '#b08800',
    brightBlue: '#005cc5', brightMagenta: '#5a32a3', brightCyan: '#3192aa', brightWhite: '#d1d5da',
  },
};
const DEFAULT_THEME = 'Catppuccin Mocha';
let currentTheme = DEFAULT_THEME;

// ---- DOM refs ----
const tabsEl = document.getElementById('tabs');
const hostsEl = document.getElementById('terminals');
const statusCwd = document.getElementById('status-cwd');
const statusClaude = document.getElementById('status-claude');
const langSel = document.getElementById('lang');
const newtabBtn = document.getElementById('newtab');
const pickdirBtn = document.getElementById('pickdir');
const findBar = document.getElementById('findbar');
const findInput = document.getElementById('findinput');
const findPrevBtn = document.getElementById('findprev');
const findNextBtn = document.getElementById('findnext');
const findCloseBtn = document.getElementById('findclose');
const resumeBar = document.getElementById('resumebar');
const resumeTitleEl = document.getElementById('resumetitle');
const resumeListEl = document.getElementById('resumelist');
const resumeCloseBtn = document.getElementById('resumeclose');
const ctxMenu = document.getElementById('ctxmenu');

let T = {}; // current UI strings
const sessions = new Map(); // id -> { term, fit, search, host, tab, label, cwd, restarting }
let activeId = null;
let seq = 0;
let fontSize = 14;
let appInfo = { claudeBin: null, home: '~' };

function basename(p) {
  if (!p) return 'claude';
  const parts = p.replace(/\/+$/, '').split('/');
  return parts[parts.length - 1] || '/';
}

function setActive(id) {
  if (!sessions.has(id)) return;
  activeId = id;
  for (const [sid, s] of sessions) {
    const on = sid === id;
    s.host.classList.toggle('active', on);
    s.tab.classList.toggle('active', on);
    if (on) {
      s.fit.fit();
      s.term.focus();
      statusCwd.textContent = s.cwd;
    }
  }
}

async function createSession(cwd, resumeId) {
  const id = 'term-' + ++seq;

  // tab
  const tab = document.createElement('div');
  tab.className = 'tab';
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = basename(cwd) || 'claude';
  const close = document.createElement('span');
  close.className = 'close';
  close.textContent = '×';
  tab.append(label, close);
  tab.addEventListener('click', (e) => {
    if (e.target === close) return;
    setActive(id);
  });
  close.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSession(id);
  });
  tabsEl.appendChild(tab);

  // host + terminal
  const host = document.createElement('div');
  host.className = 'term-host';
  hostsEl.appendChild(host);

  const term = new Terminal({
    fontFamily: '"Ubuntu Mono", "DejaVu Sans Mono", "Menlo", monospace',
    fontSize,
    cursorBlink: true,
    allowProposedApi: true,
    scrollback: 10000,
    theme: THEMES[currentTheme],
  });
  const fit = new FitAddon();
  term.loadAddon(fit);
  const search = SearchAddon ? new SearchAddon() : null;
  if (search) term.loadAddon(search);
  if (WebLinksAddon) term.loadAddon(new WebLinksAddon());
  term.open(host);
  host.style.background = THEMES[currentTheme].background;
  fit.fit();

  const s = { term, fit, search, host, tab, label, cwd: cwd || appInfo.home, restarting: false };
  sessions.set(id, s);

  term.onData((data) => api.sendInput(id, data));

  // ---- mouse copy/paste (Linux conventions) ----
  // select-to-copy → PRIMARY selection (doesn't clobber the clipboard)
  host.addEventListener('mouseup', () => {
    if (term.hasSelection()) {
      const sel = term.getSelection();
      if (sel) api.clipboard.writePrimary(sel);
    }
  });
  // middle-click → paste PRIMARY (fallback to clipboard)
  host.addEventListener(
    'mousedown',
    (e) => {
      if (e.button === 1) {
        e.preventDefault();
        const t = api.clipboard.readPrimary() || api.clipboard.read();
        if (t) term.paste(t);
      }
    },
    true
  );
  // right-click → context menu (Copy / Paste / Select All)
  host.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
      setActive(id);
      showCtx(e.clientX, e.clientY);
    },
    true
  );

  const res = await api.createSession({ id, cwd, cols: term.cols, rows: term.rows, resumeId });
  s.cwd = res.cwd;
  label.textContent = (resumeId ? '↺ ' : '') + basename(res.cwd);

  setActive(id);
  return id;
}

function closeSession(id) {
  const s = sessions.get(id);
  if (!s) return;
  api.kill(id);
  s.term.dispose();
  s.host.remove();
  s.tab.remove();
  sessions.delete(id);
  if (activeId === id) {
    const next = sessions.keys().next();
    if (!next.done) setActive(next.value);
    else activeId = null;
  }
  if (sessions.size === 0) createSession(appInfo.home);
}

function restartSession(id) {
  const s = sessions.get(id);
  if (!s) return;
  s.restarting = true;
  api.kill(id); // pty:exit will respawn (see onExit)
}

function cycleTab(dir) {
  const ids = Array.from(sessions.keys());
  if (ids.length < 2) return;
  const idx = ids.indexOf(activeId);
  const next = ids[(idx + dir + ids.length) % ids.length];
  setActive(next);
}

// ---- clipboard / selection (via xterm, so it works on terminal selections) ----
function doCopy() {
  const s = sessions.get(activeId);
  if (!s) return;
  const sel = s.term.getSelection();
  if (sel) api.clipboard.write(sel);
}
function doPaste() {
  const s = sessions.get(activeId);
  if (!s) return;
  const txt = api.clipboard.read();
  if (txt) s.term.paste(txt);
}
function doSelectAll() {
  const s = sessions.get(activeId);
  if (s) s.term.selectAll();
}
function doClear() {
  const s = sessions.get(activeId);
  if (s) s.term.clear();
}

// ---- find ----
function showFind() {
  findBar.classList.add('visible');
  findInput.focus();
  findInput.select();
}
function hideFind() {
  findBar.classList.remove('visible');
  const s = sessions.get(activeId);
  if (s) s.term.focus();
}
function findNext() {
  const s = sessions.get(activeId);
  if (s && s.search && findInput.value) s.search.findNext(findInput.value);
}
function findPrev() {
  const s = sessions.get(activeId);
  if (s && s.search && findInput.value) s.search.findPrevious(findInput.value);
}
findInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); e.shiftKey ? findPrev() : findNext(); }
  else if (e.key === 'Escape') { e.preventDefault(); hideFind(); }
});
findNextBtn.addEventListener('click', findNext);
findPrevBtn.addEventListener('click', findPrev);
findCloseBtn.addEventListener('click', hideFind);

// ---- resume picker ----
function relTime(ms) {
  const sec = Math.max(0, (Date.now() - ms) / 1000);
  if (sec < 60) return 'just now';
  const m = Math.floor(sec / 60);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}
async function showResume() {
  const s = sessions.get(activeId);
  const cwd = s ? s.cwd : appInfo.home;
  resumeTitleEl.textContent = (T.resumeTitle || 'Resume a session') + ' · ' + cwd;
  resumeListEl.innerHTML = '';
  resumeBar.classList.add('visible');
  const list = await api.listSessions(cwd);
  if (!resumeBar.classList.contains('visible')) return; // closed while loading
  resumeListEl.innerHTML = '';
  if (!list || !list.length) {
    const e = document.createElement('div');
    e.className = 'resume-empty';
    e.textContent = T.resumeEmpty || 'No saved sessions for this folder';
    resumeListEl.appendChild(e);
    return;
  }
  for (const sess of list) {
    const row = document.createElement('div');
    row.className = 'resume-item';
    const title = document.createElement('div');
    title.className = 'rtitle';
    title.textContent = sess.title || 'session ' + sess.id.slice(0, 8);
    const meta = document.createElement('div');
    meta.className = 'rmeta';
    meta.textContent = relTime(sess.mtime) + ' · ' + sess.id.slice(0, 8);
    row.append(title, meta);
    row.addEventListener('click', () => {
      hideResume();
      createSession(cwd, sess.id);
    });
    resumeListEl.appendChild(row);
  }
}
function hideResume() {
  resumeBar.classList.remove('visible');
  const s = sessions.get(activeId);
  if (s) s.term.focus();
}
resumeCloseBtn.addEventListener('click', hideResume);
document.addEventListener(
  'keydown',
  (e) => {
    if (e.key === 'Escape' && resumeBar.classList.contains('visible')) {
      e.preventDefault();
      e.stopPropagation();
      hideResume();
    }
  },
  true
);

// ---- right-click context menu (mouse copy/paste) ----
function showCtx(x, y) {
  ctxMenu.style.left = Math.min(x, window.innerWidth - 160) + 'px';
  ctxMenu.style.top = Math.min(y, window.innerHeight - 120) + 'px';
  ctxMenu.classList.add('visible');
}
function hideCtx() {
  ctxMenu.classList.remove('visible');
}
ctxMenu.addEventListener('mousedown', (e) => e.preventDefault()); // keep terminal selection/focus
ctxMenu.querySelectorAll('.ctx-item').forEach((el) => {
  el.addEventListener('click', () => {
    const act = el.dataset.act;
    if (act === 'copy') doCopy();
    else if (act === 'paste') doPaste();
    else if (act === 'selectAll') doSelectAll();
    hideCtx();
  });
});
window.addEventListener('click', hideCtx);

// ---- theme ----
function applyTheme(name) {
  if (!THEMES[name]) name = DEFAULT_THEME;
  currentTheme = name;
  const th = THEMES[name];
  hostsEl.style.background = th.background;
  for (const s of sessions.values()) {
    s.term.options.theme = th;
    s.host.style.background = th.background;
  }
}

// ---- zoom ----
function applyZoom(dir) {
  if (dir === 0) fontSize = 14;
  else fontSize = Math.max(8, Math.min(28, fontSize + dir));
  for (const s of sessions.values()) {
    s.term.options.fontSize = fontSize;
    s.fit.fit();
    if (s === sessions.get(activeId)) api.resize(activeId, s.term.cols, s.term.rows);
  }
}

// ---- pty stream events ----
api.onData(({ id, data }) => {
  const s = sessions.get(id);
  if (s) s.term.write(data);
});
api.onExit(({ id, exitCode }) => {
  const s = sessions.get(id);
  if (!s) return;
  if (s.restarting) {
    s.restarting = false;
    s.term.reset();
    api.createSession({ id, cwd: s.cwd, cols: s.term.cols, rows: s.term.rows });
    return;
  }
  const msg = (T.exited || 'claude exited with code {code}.').replace('{code}', exitCode);
  s.term.write(`\r\n\x1b[90m[${msg}]\x1b[0m\r\n`);
  const restart = s.term.onData(() => {
    restart.dispose();
    closeSession(id);
  });
});

// ---- resize handling ----
const ro = new ResizeObserver(() => {
  const s = sessions.get(activeId);
  if (!s) return;
  s.fit.fit();
  api.resize(activeId, s.term.cols, s.term.rows);
});
ro.observe(hostsEl);

// ---- toolbar controls ----
async function pickAndOpen() {
  const dir = await api.pickFolder();
  if (dir) createSession(dir);
}
newtabBtn.addEventListener('click', () => createSession());
pickdirBtn.addEventListener('click', pickAndOpen);

// ---- menu dispatch ----
api.onMenu((name, arg) => {
  switch (name) {
    case 'newTab': createSession(); break;
    case 'newTabFolder': pickAndOpen(); break;
    case 'resume': showResume(); break;
    case 'restartSession': if (activeId) restartSession(activeId); break;
    case 'nextTab': cycleTab(1); break;
    case 'prevTab': cycleTab(-1); break;
    case 'closeTab': if (activeId) closeSession(activeId); break;
    case 'copy': doCopy(); break;
    case 'paste': doPaste(); break;
    case 'selectAll': doSelectAll(); break;
    case 'find': showFind(); break;
    case 'clear': doClear(); break;
    case 'zoom': applyZoom(arg); break;
    case 'setTheme': applyTheme(arg); break;
  }
});

// ---- i18n ----
function renderClaudeStatus() {
  statusClaude.textContent = appInfo.claudeBin
    ? 'claude: ' + appInfo.claudeBin
    : T.claudeNotFound || '⚠ claude binary not found';
}
function populateLangs(list, locale) {
  langSel.innerHTML = '';
  for (const { code, name } of list) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = name;
    langSel.appendChild(opt);
  }
  langSel.value = locale;
}
function applyI18n({ locale, dir, strings }) {
  if (strings) T = strings;
  if (dir) document.documentElement.dir = dir;
  if (locale) langSel.value = locale;
  newtabBtn.title = T.newTabTooltip + ' (Ctrl+Shift+T)';
  pickdirBtn.textContent = '📁 ' + T.folderButton;
  pickdirBtn.title = T.folderTooltip;
  langSel.title = T.language;
  findInput.placeholder = T.findPlaceholder || 'Find…';
  if (T.copy) ctxMenu.querySelector('[data-act="copy"]').textContent = T.copy;
  if (T.paste) ctxMenu.querySelector('[data-act="paste"]').textContent = T.paste;
  if (T.selectAll) ctxMenu.querySelector('[data-act="selectAll"]').textContent = T.selectAll;
  renderClaudeStatus();
}
langSel.addEventListener('change', () => api.i18n.set(langSel.value));
api.i18n.onChanged((payload) => applyI18n(payload));

// ---- boot ----
(async () => {
  appInfo = await api.appInfo();
  const settings = await api.settings.get();
  applyTheme(settings.theme || DEFAULT_THEME);
  const i = await api.i18n.get();
  populateLangs(i.list, i.locale);
  applyI18n(i);
  await createSession(); // starts in home dir
})();
