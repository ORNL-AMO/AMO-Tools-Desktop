const { app, BrowserWindow, ipcMain, crashReporter, Menu, shell, dialog } = require('electron');
const path = require('path');
const url = require('url');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const jetpack = require('fs-jetpack');


function isDev() {
  return require.main.filename.indexOf('app.asar') === -1;
};

app.allowRendererProcessReuse = false
// Logger for autoUpdater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let win = null;

app.on('ready', function () {

  // Initialize the window to our specified dimensions
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

  // Specify entry point
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/index.html'),
    protocol: 'file',
    slashes: true
  }));

  if (isDev()) {
    win.toggleDevTools();
  }
  // Remove window once app is closed
  win.on('closed', function () {
    win = null;
  });
  //signal from core.component to check for update
  ipcMain.on('ready', (coreCompEvent, arg) => {
    if (!isDev()) {
      autoUpdater.checkForUpdates().then(() => {
        log.info('done checking for updates');
        coreCompEvent.sender.send('release-info', autoUpdater.updateInfoAndProvider.info);
      });
      autoUpdater.on('update-available', (event, info) => {
        log.info('update available');
        coreCompEvent.sender.send('available', true);
      });
      autoUpdater.on('update-not-available', (event, info) => {
        log.info('no update available..');
      });
      autoUpdater.on('error', (event, error) => {
        log.info('error');
        coreCompEvent.sender.send('error', error);
      });

      autoUpdater.on('update-downloaded', (event, info) => {
        // autoUpdater.quitAndInstall();
        coreCompEvent.sender.send('update-downloaded');
      });
    }
  })

  ipcMain.once('quit-and-install', (event, arg) => {
    autoUpdater.quitAndInstall(false);
  })

  //Check for updates and install
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  crashReporter.start({
    productName: "ORNL-AMO",
    companyName: "ornl-amo",
    submitURL: "https://ornl-amo.sp.backtrace.io:6098/post?format=minidump&token=9e914fbd14a36589b7e2ce09cf8c3b4b5b3e37368da52bf1dabff576f156126c",
    uploadToServer: true
  });

  var template = [{
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

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  win.setMenuBarVisibility(false);

  win.webContents.on('new-window', function (e, url) {
    // make sure local urls stay in electron perimeter
    if ('file://' === url.substr(0, 'file://'.length)) {
      return;
    }
    e.preventDefault();
    shell.openExternal(url);
  });
});

app.on('window-all-closed', function () {
  app.quit();
});

// Listen for message from core.component to either download updates or not
ipcMain.once('update', (event, arg) => {
  log.info('update')
  autoUpdater.downloadUpdate();
});

ipcMain.once('later', (event, arg) => {
  update = null;
});

ipcMain.once('relaunch', () => {
  console.log('ipcMain relaunch emitted');
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
      name: "JSON Files",
      extensions: ["json"]
    }],
    defaultPath: arg.fileName
  }
  dialog.showSaveDialog(win, saveDialogOptions).then(results => {
    win.webContents.send('backup-file-path', results.filePath);
  });
});

