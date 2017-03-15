// ./main.js
//require('electron-reload')(__dirname);

const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const {autoUpdater} = require('electron');
const feedURL = '~/updates-folder';


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

  

  // Remove window once app is closed
  win.on('closed', function () {
    win = null;
  });
  
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
