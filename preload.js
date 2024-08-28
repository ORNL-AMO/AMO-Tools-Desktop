const {
    contextBridge,
    ipcRenderer
} = require("electron");


//from https://github.com/electron/electron/issues/9920#issuecomment-575839738
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "electronAPI", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["ready", "update", "relaunch", "quit-and-install",  "saveFile", "fileExists", "openDialog", "getDataFile"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        on: (channel, func) => {
            let validChannels = ["release-info", "available", "error", "update-downloaded", "backup-file-path", "file-exists", "data-file"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);