// ./main.js
//require('electron-reload')(__dirname);

const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const log = require('electron-log');
const {autoUpdater} = require('electron-updater');

function isDev() {
  return process.mainModule.filename.indexOf('app.asar') === -1;
};

// Logger for autoUpdater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

require('dotenv').config();
let win = null;
let available = null;

app.on('ready', function () {

  // Initialize the window to our specified dimensions
  win = new BrowserWindow({ width: 1000, height: 600 });
  win.maximize();

  // Specify entry point
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/index.html'),
    protocol: 'file',
    slashes: true
  }));

  win.toggleDevTools();

  // Remove window once app is closed
  win.on('closed', function () {
    win = null;
  });

  // If isDev = true, don't check for updates. If false, check for update
 if (isDev()) {
   update = null;
   } else {
     autoUpdater.checkForUpdates();
  };

  // Auto Updater events
  autoUpdater.on('checking-for-update', () => {
  });

  autoUpdater.on('update-available', (ev, info) => {
  });

  // Send message to core.component when an update is available
  ipcMain.on('ready', (event, arg) => {
    if (autoUpdater.updateAvailable === true) {
      event.sender.send('available', null);
    };
  });

  autoUpdater.on('update-not-available', (ev, info) => {
  });

  autoUpdater.on('error', (ev, error) => {
  });

  autoUpdater.on('download-progress', (ev, progressObj) => {
  });

  autoUpdater.on('update-downloaded', (ev, info) => {
    autoUpdater.quitAndInstall();
  });

  //Check for updates and install
  autoUpdater.autoDownload = false;
});

// Listen for message from core.component to either download updates or not
ipcMain.on('update', (ev) => {
  autoUpdater.downloadUpdate();
})
ipcMain.on('later', (ev) => {
  update = null;
})

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
})

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});
