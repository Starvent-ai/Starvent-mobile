// Preload script runs in an isolated context with access to Node APIs,
// but the renderer only ever sees what we explicitly expose below.
// Keep this file plain CommonJS: Electron's sandboxed preload loader
// does not require a TypeScript/ESM build step for it.
const { contextBridge, ipcRenderer } = require("electron");
const { versions } = process;

contextBridge.exposeInMainWorld("starvent", {
  appInfo: {
    version: versions.electron ? "0.1.0" : "0.1.0",
    platform: process.platform
  },
  settings: {
    get: (key) => ipcRenderer.invoke("settings:get", key),
    set: (key, value) => ipcRenderer.invoke("settings:set", key, value)
  }
});
