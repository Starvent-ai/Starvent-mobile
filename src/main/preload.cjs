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
  },
  mobilePrices: {
    test: (config) => ipcRenderer.invoke("mobilePrices:test", config),
    getConfig: () => ipcRenderer.invoke("mobilePrices:getConfig"),
    saveConfig: (config) => ipcRenderer.invoke("mobilePrices:saveConfig", config),
    getList: () => ipcRenderer.invoke("mobilePrices:getList"),
    onUpdated: (callback) => {
      const handler = (_event, result) => callback(result);
      ipcRenderer.on("mobilePrices:updated", handler);
      return () => ipcRenderer.removeListener("mobilePrices:updated", handler);
    }
  }
});
