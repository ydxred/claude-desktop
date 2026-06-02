'use strict';

const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const cp = require('child_process');
const pty = require('node-pty');
const i18n = require('./i18n');

// --- Wayland / Linux display adaptation --------------------------------------
// Let Electron pick Wayland natively when available, fall back to X11.
app.commandLine.appendSwitch('ozone-platform-hint', 'auto');

// In a packaged build there is no run.sh to add --no-sandbox, and the bundled
// chrome-sandbox isn't setuid-root on Ubuntu 24.04, so the sandbox can't start.
// Disable it for packaged builds so the AppImage/.deb launches on double-click.
if (app.isPackaged) app.commandLine.appendSwitch('no-sandbox');

// --- Resolve the real `claude` binary robustly -------------------------------
// When launched from a .desktop entry the PATH is minimal (no nvm), so we
// search several known locations instead of relying on PATH alone.
function resolveClaudeBin() {
  if (process.env.CLAUDE_DESKTOP_BIN && fs.existsSync(process.env.CLAUDE_DESKTOP_BIN)) {
    return process.env.CLAUDE_DESKTOP_BIN;
  }
  // 1) login shell knows about nvm
  try {
    const found = cp
      .execSync('bash -lc "command -v claude" 2>/dev/null', { encoding: 'utf8' })
      .trim();
    if (found && fs.existsSync(found)) return found;
  } catch (_) {}
  // 2) nvm-managed node installs
  try {
    const nvmRoot = path.join(os.homedir(), '.nvm', 'versions', 'node');
    if (fs.existsSync(nvmRoot)) {
      const versions = fs
        .readdirSync(nvmRoot)
        .sort()
        .reverse(); // newest first
      for (const v of versions) {
        const c = path.join(nvmRoot, v, 'bin', 'claude');
        if (fs.existsSync(c)) return c;
      }
    }
  } catch (_) {}
  // 3) common global locations
  const candidates = [
    path.join(os.homedir(), '.local', 'bin', 'claude'),
    '/usr/local/bin/claude',
    '/usr/bin/claude',
    '/opt/homebrew/bin/claude',
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null; // not found
}

const CLAUDE_BIN = resolveClaudeBin();

// node-pty needs `node` on PATH (claude is a node script). Prepend the binary's
// own directory so the matching node is found regardless of launch context.
function buildEnv() {
  const env = { ...process.env, TERM: 'xterm-256color' };
  if (CLAUDE_BIN) {
    const binDir = path.dirname(CLAUDE_BIN);
    env.PATH = binDir + path.delimiter + (env.PATH || '');
  }
  return env;
}

// --- Persisted settings (UI language, …) -------------------------------------
let currentLocale = 'en';

function configPath() {
  return path.join(app.getPath('userData'), 'config.json');
}
function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath(), 'utf8'));
  } catch (_) {
    return {};
  }
}
function writeConfig(patch) {
  const cfg = { ...readConfig(), ...patch };
  try {
    fs.mkdirSync(path.dirname(configPath()), { recursive: true });
    fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 2));
  } catch (_) {}
}

// --- Terminal session registry ----------------------------------------------
const terminals = new Map(); // id -> pty process

function spawnSession({ id, cwd, cols, rows, sender }) {
  const startDir = cwd && fs.existsSync(cwd) ? cwd : os.homedir();
  const env = buildEnv();

  let file;
  let args;
  if (CLAUDE_BIN) {
    file = CLAUDE_BIN;
    args = [];
  } else {
    // No claude found: drop into a shell so the window is still usable and the
    // user sees a clear message instead of a silent failure.
    file = process.env.SHELL || '/bin/bash';
    args = ['-lc', 'echo "claude binary not found — open a shell. Install Claude Code, then reopen."; exec "$SHELL" -l'];
  }

  const ptyProcess = pty.spawn(file, args, {
    name: 'xterm-256color',
    cols: cols || 80,
    rows: rows || 24,
    cwd: startDir,
    env,
  });
  terminals.set(id, ptyProcess);

  ptyProcess.onData((data) => {
    if (!sender.isDestroyed()) sender.send('pty:data', { id, data });
  });
  ptyProcess.onExit(({ exitCode }) => {
    if (!sender.isDestroyed()) sender.send('pty:exit', { id, exitCode });
    terminals.delete(id);
  });

  return { ok: true, cwd: startDir, claudeFound: !!CLAUDE_BIN };
}

// --- IPC ---------------------------------------------------------------------
ipcMain.handle('pty:create', (event, opts) =>
  spawnSession({ ...opts, sender: event.sender })
);

ipcMain.on('pty:input', (_event, { id, data }) => {
  const p = terminals.get(id);
  if (p) p.write(data);
});

ipcMain.on('pty:resize', (_event, { id, cols, rows }) => {
  const p = terminals.get(id);
  if (p) {
    try {
      p.resize(cols, rows);
    } catch (_) {}
  }
});

ipcMain.on('pty:kill', (_event, { id }) => {
  const p = terminals.get(id);
  if (p) {
    try {
      p.kill();
    } catch (_) {}
    terminals.delete(id);
  }
});

ipcMain.handle('dialog:pickFolder', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const res = await dialog.showOpenDialog(win, {
    title: i18n.strings(currentLocale).pickFolderTitle,
    properties: ['openDirectory', 'createDirectory'],
    defaultPath: os.homedir(),
  });
  if (res.canceled || !res.filePaths.length) return null;
  return res.filePaths[0];
});

ipcMain.handle('app:info', () => ({
  claudeBin: CLAUDE_BIN,
  home: os.homedir(),
  platform: process.platform,
}));

// --- UI language -------------------------------------------------------------
ipcMain.handle('i18n:get', () => ({
  locale: currentLocale,
  dir: i18n.dir(currentLocale),
  strings: i18n.strings(currentLocale),
  list: i18n.list(),
}));

ipcMain.handle('settings:get', () => readConfig());
ipcMain.on('settings:set', (_event, patch) => writeConfig(patch));

ipcMain.handle('i18n:set', (_event, locale) => {
  currentLocale = i18n.resolve(locale);
  writeConfig({ locale: currentLocale });
  buildAndSetMenu(currentLocale);
  const payload = {
    locale: currentLocale,
    dir: i18n.dir(currentLocale),
    strings: i18n.strings(currentLocale),
  };
  for (const w of BrowserWindow.getAllWindows()) w.webContents.send('i18n:changed', payload);
  return payload;
});

// --- AppImage self-integration -----------------------------------------------
// When launched as a packaged AppImage, install a .desktop entry + icon into
// ~/.local/share on startup. This gives the window an app icon and an app-grid
// entry even on a fresh machine where only the bare .AppImage exists (GNOME
// resolves the icon by matching the window's app_id to this .desktop).
function integrateAppImage() {
  const appImage = process.env.APPIMAGE;
  if (!appImage || !fs.existsSync(appImage)) return; // not a real AppImage run
  try {
    const home = os.homedir();
    const appsDir = path.join(home, '.local', 'share', 'applications');
    const iconDir = path.join(home, '.local', 'share', 'icons');
    const iconPath = path.join(iconDir, 'claude-code-desktop.png');
    const desktopPath = path.join(appsDir, 'claude-code-desktop.desktop');
    fs.mkdirSync(appsDir, { recursive: true });
    fs.mkdirSync(iconDir, { recursive: true });

    // Copy the bundled icon out of the asar to a real file (absolute Icon= path
    // needs no icon-theme cache refresh). Write once.
    if (!fs.existsSync(iconPath)) {
      fs.writeFileSync(iconPath, fs.readFileSync(path.join(__dirname, 'assets', 'app-icon.png')));
    }

    const entry =
      '[Desktop Entry]\n' +
      'Type=Application\n' +
      'Name=Claude Code Desktop\n' +
      'Comment=Claude Code CLI in a desktop window\n' +
      `Exec="${appImage}" %U\n` +
      `Icon=${iconPath}\n` +
      'Terminal=false\n' +
      'Categories=Development;\n' +
      'StartupNotify=true\n' +
      'StartupWMClass=claude-code-desktop\n';

    // (Re)write only when missing or the AppImage moved — self-healing, no churn.
    let existing = '';
    try {
      existing = fs.readFileSync(desktopPath, 'utf8');
    } catch (_) {}
    if (existing !== entry) fs.writeFileSync(desktopPath, entry);
  } catch (_) {}
}

// --- Window ------------------------------------------------------------------
function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 640,
    minHeight: 380,
    backgroundColor: '#181825',
    title: 'Claude Code',
    icon: path.join(__dirname, 'assets', 'app-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  // Open external links (web-links addon) in the system browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  return win;
}

const THEME_NAMES = ['Catppuccin Mocha', 'Dracula', 'Tokyo Night', 'Solarized Dark', 'GitHub Light'];
const DEFAULT_THEME = 'Catppuccin Mocha';
const DOCS_URL = 'https://code.claude.com/docs/en/overview';

function sendAction(win, name, arg) {
  if (win) win.webContents.send('menu:action', name, arg);
}

function showAbout(win) {
  const t = i18n.strings(currentLocale);
  dialog.showMessageBox(win, {
    type: 'info',
    title: t.about,
    message: 'Claude Code Desktop',
    detail:
      `App: ${app.getVersion()}\n` +
      `Electron: ${process.versions.electron}\n` +
      `Chromium: ${process.versions.chrome}\n` +
      `Node: ${process.versions.node}\n` +
      `claude: ${CLAUDE_BIN || 'not found'}`,
    buttons: ['OK'],
    noLink: true,
  });
}

function buildAndSetMenu(locale) {
  const t = i18n.strings(locale);
  const currentTheme = readConfig().theme || DEFAULT_THEME;

  const template = [
    {
      label: t.session,
      submenu: [
        { label: t.newTab, accelerator: 'CmdOrCtrl+Shift+T', click: (_m, w) => sendAction(w, 'newTab') },
        { label: t.newTabFolder, accelerator: 'CmdOrCtrl+Shift+O', click: (_m, w) => sendAction(w, 'newTabFolder') },
        { label: t.restartSession, accelerator: 'CmdOrCtrl+Shift+R', click: (_m, w) => sendAction(w, 'restartSession') },
        { type: 'separator' },
        { label: t.nextTab, accelerator: 'CmdOrCtrl+PageDown', click: (_m, w) => sendAction(w, 'nextTab') },
        { label: t.prevTab, accelerator: 'CmdOrCtrl+PageUp', click: (_m, w) => sendAction(w, 'prevTab') },
        { type: 'separator' },
        { label: t.closeTab, accelerator: 'CmdOrCtrl+Shift+W', click: (_m, w) => sendAction(w, 'closeTab') },
        { role: 'quit', label: t.quit },
      ],
    },
    {
      label: t.edit,
      submenu: [
        // Terminal-friendly: leave Ctrl+C/V/A for the shell, use Ctrl+Shift+*.
        { label: t.copy, accelerator: 'CmdOrCtrl+Shift+C', click: (_m, w) => sendAction(w, 'copy') },
        { label: t.paste, accelerator: 'CmdOrCtrl+Shift+V', click: (_m, w) => sendAction(w, 'paste') },
        { label: t.selectAll, accelerator: 'CmdOrCtrl+Shift+A', click: (_m, w) => sendAction(w, 'selectAll') },
        { type: 'separator' },
        { label: t.find, accelerator: 'CmdOrCtrl+Shift+F', click: (_m, w) => sendAction(w, 'find') },
        { label: t.clear, accelerator: 'CmdOrCtrl+Shift+K', click: (_m, w) => sendAction(w, 'clear') },
      ],
    },
    {
      label: t.view,
      submenu: [
        { label: t.zoomIn, accelerator: 'CmdOrCtrl+=', click: (_m, w) => sendAction(w, 'zoom', 1) },
        { label: t.zoomOut, accelerator: 'CmdOrCtrl+-', click: (_m, w) => sendAction(w, 'zoom', -1) },
        { label: t.resetZoom, accelerator: 'CmdOrCtrl+0', click: (_m, w) => sendAction(w, 'zoom', 0) },
        { type: 'separator' },
        {
          label: t.theme,
          submenu: THEME_NAMES.map((name) => ({
            label: name,
            type: 'radio',
            checked: name === currentTheme,
            click: (_m, w) => {
              writeConfig({ theme: name });
              sendAction(w, 'setTheme', name);
            },
          })),
        },
        { type: 'separator' },
        {
          label: t.alwaysOnTop,
          type: 'checkbox',
          checked: !!(BrowserWindow.getFocusedWindow() && BrowserWindow.getFocusedWindow().isAlwaysOnTop()),
          click: (menuItem, w) => { if (w) w.setAlwaysOnTop(menuItem.checked); },
        },
        { role: 'togglefullscreen', label: t.fullscreen },
        { role: 'toggleDevTools', label: t.devtools },
      ],
    },
    {
      label: t.help,
      submenu: [
        { label: t.docs, click: () => shell.openExternal(DOCS_URL) },
        { label: t.about, click: (_m, w) => showAbout(w) },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  const cfg = readConfig();
  currentLocale = i18n.resolve(cfg.locale || app.getLocale());
  integrateAppImage();
  buildAndSetMenu(currentLocale);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  for (const p of terminals.values()) {
    try {
      p.kill();
    } catch (_) {}
  }
  if (process.platform !== 'darwin') app.quit();
});
