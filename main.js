// ./main.js
//require('electron-reload')(__dirname);

const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const feedURL = '~/updates-folder';
const log = require('electron-log');
const {autoUpdater} = require('electron-updater');

// Logger for autoUpdater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

require('dotenv').config();
let win = null;

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
  win.webContents.openDevTools();
  
  // Remove window once app is closed
  win.on('closed', function () {
    win = null;
  });
  
function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
};

  
    // Auto Updater events
  autoUpdater.on('checking-for-update', () => {
  });
  autoUpdater.on('update-available', (ev, info) => {
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
  autoUpdater.autoDownload = true;
  autoUpdater.checkForUpdates();
});


app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});
