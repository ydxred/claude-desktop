'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Secure bridge: renderer never touches Node directly. All terminal/pty work
// happens in the main process; this exposes a tiny typed surface.
contextBridge.exposeInMainWorld('claudeDesktop', {
  createSession: (opts) => ipcRenderer.invoke('pty:create', opts),
  sendInput: (id, data) => ipcRenderer.send('pty:input', { id, data }),
  resize: (id, cols, rows) => ipcRenderer.send('pty:resize', { id, cols, rows }),
  kill: (id) => ipcRenderer.send('pty:kill', { id }),
  pickFolder: () => ipcRenderer.invoke('dialog:pickFolder'),
  listSessions: (cwd) => ipcRenderer.invoke('sessions:list', cwd),
  appInfo: () => ipcRenderer.invoke('app:info'),

  i18n: {
    get: () => ipcRenderer.invoke('i18n:get'),
    set: (locale) => ipcRenderer.invoke('i18n:set', locale),
    onChanged: (cb) => ipcRenderer.on('i18n:changed', (_e, payload) => cb(payload)),
  },

  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (patch) => ipcRenderer.send('settings:set', patch),
  },

  clipboard: {
    // Runs in the main process (sandboxed renderer can't use the clipboard module)
    write: (text) => ipcRenderer.send('clipboard:write', { text }),
    read: () => ipcRenderer.sendSync('clipboard:read', {}),
    // X11/Wayland PRIMARY selection (select-to-copy / middle-click-paste)
    writePrimary: (text) => ipcRenderer.send('clipboard:write', { text, primary: true }),
    readPrimary: () => ipcRenderer.sendSync('clipboard:read', { primary: true }),
  },

  onData: (cb) => ipcRenderer.on('pty:data', (_e, payload) => cb(payload)),
  onExit: (cb) => ipcRenderer.on('pty:exit', (_e, payload) => cb(payload)),

  onMenu: (cb) => ipcRenderer.on('menu:action', (_e, name, arg) => cb(name, arg)),
});
