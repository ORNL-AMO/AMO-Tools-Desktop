// ./main.js
//require('electron-reload')(__dirname);

const { app, BrowserWindow, ipcMain, crashReporter } = require('electron');
const path = require('path');
const url = require('url');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

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

  if (isDev()) {
   // win.toggleDevTools();
  };

  // Remove window once app is closed
  win.on('closed', function () {
    win = null;
  });

  //signal from core.component to check for update
  ipcMain.on('ready', (coreCompEvent, arg) => {
    if (!isDev()) {
    autoUpdater.checkForUpdates();
    log.info('checking for update..');
    autoUpdater.on('update-available', (event, info) => {
      coreCompEvent.sender.send('available', autoUpdater.updateAvailable);
  });
    autoUpdater.on('update-not-available', (event, info) => {
      log.info('no update available..');
  });
  }
})

  autoUpdater.on('error', (event, error) => {
  });

  autoUpdater.on('download-progress', (event, progressObj) => {
    log.info(progressObj);
  });

  autoUpdater.on('update-downloaded', (event, info) => {
    autoUpdater.quitAndInstall();
  });

  //Check for updates and install
  autoUpdater.autoDownload = false;

  crashReporter.start({
    productName: "ORNL-AMO",
    companyName: "ornl-amo",
    submitURL: "https://ornl-amo.sp.backtrace.io:6098/post?format=minidump&token=9e914fbd14a36589b7e2ce09cf8c3b4b5b3e37368da52bf1dabff576f156126c",
    uploadToServer: true
  });
});

// Listen for message from core.component to either download updates or not
ipcMain.once('update', (event, arg) => {
  autoUpdater.downloadUpdate();
});

ipcMain.once('later', (event, arg) => {
  update = null;
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});
