const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = require('electron');
const path = require('path');
const url = require('url');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const jetpack = require('fs-jetpack');

// * If left enabled, causes flashing on app first rendering. 
// * Likely caused by some dependency of the process-flow-diagram
app.disableHardwareAcceleration();

app.allowRendererProcessReuse = false;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.forceDevUpdateConfig = true;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

// * signing process does not currently support differential downloads - block maps would need to be regenerated and signed
autoUpdater.disableDifferentialDownload = true;

let win = null;

function isDev() {
  return app.isPackaged === false;
};

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.maximize();
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/index.html'),
    protocol: 'file',
    slashes: true
  }));

  if (isDev()) {
    win.toggleDevTools();
  }
  
  const menuTemplate = [{
    label: "Application",
    submenu: [
      { label: "Quit", accelerator: "Command+Q", click: function () { app.quit(); } },
      { label: "Dev Tools", accelerator: "CmdOrCtrl+I", click: function () { win.toggleDevTools(); } }
    ]
  }, {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
  }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
  win.setMenuBarVisibility(false);

  win.webContents.on('new-window', function (e, url) {
    // make sure local urls stay in electron perimeter
    if ('file://' === url.substr(0, 'file://'.length)) {
      return;
    }
    e.preventDefault();
    shell.openExternal(url);
  });

  win.on('closed', function () {
    win = null;
  });
}

app.whenReady().then(() => {
    console.log('app.on.ready: App is ready');
    createWindow();

    // * necessary to recreate window when docked on macOS
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    });

  ipcMain.on('ready', (coreCompEvent, arg) => {
    console.log('ipcMain.on.ready');

    if (!isDev()) {
      autoUpdater.checkForUpdates(() => {
        log.info('[autoUpdater] done checking for updates');
      });
      autoUpdater.on('update-available', (info) => {
        log.info('[autoUpdater] update available');
        coreCompEvent.sender.send('available', info);
      });
      autoUpdater.on('update-not-available', (info) => {
        log.info('[autoUpdater] no update available');
      });
      autoUpdater.on('error', (err) => {
        log.info('[autoUpdater] error');
        coreCompEvent.sender.send('error', err);
      });

      autoUpdater.on('download-progress', (progressObj) => {
        coreCompEvent.sender.send('download-progress', {
          percent: progressObj.percent,
          mbPerSecond: (progressObj.bytesPerSecond / 1000000).toFixed(2),
          transferred: progressObj.transferred,
          total: progressObj.total
        });
      });

      autoUpdater.on('update-downloaded', (info) => {
        log.info('[autoUpdater] update downloaded', info);
        coreCompEvent.sender.send('update-downloaded', info);
      });
    }
  })

  ipcMain.once('quit-and-install', (event, arg) => {
    autoUpdater.quitAndInstall(false);
  })

})


ipcMain.on('update', (event, arg) => {  
  log.info('[ipcMain] Download Update selected');
  autoUpdater.downloadUpdate();
});

ipcMain.once('relaunch', () => {
  log.info('[ipcMain] relaunch emitted');
  app.relaunch();
  app.exit();
});

ipcMain.on("saveFile", (event, arg) => {
  delete arg.fileData.dataBackupFilePath;
  jetpack.writeAsync(arg.fileName, arg.fileData);
});

ipcMain.on("openDialog", (event, arg) => {
  let saveDialogOptions = {
    filters: [{
      name: "JSON Files, Gzip Files",
      extensions: ["json", "gz"]
    }],
    defaultPath: arg.fileName
  }
  dialog.showSaveDialog(win, saveDialogOptions).then(results => {
    win.webContents.send('backup-file-path', results.filePath);
  });
});

