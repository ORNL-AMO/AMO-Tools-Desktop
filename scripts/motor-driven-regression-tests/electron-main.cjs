const {app,BrowserWindow,ipcMain}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
app.setPath('userData',path.join(process.env.MOTOR_DRIVEN_SMOKE_DIR,'isolated-user-data'));
app.disableHardwareAcceleration();
const timeout=setTimeout(()=>{console.error('Electron runtime verification timed out');app.exit(1);},30000);
ipcMain.on('ready',(_event,result)=>{
  fs.writeFileSync(path.join(process.env.MOTOR_DRIVEN_SMOKE_DIR,'electron-result.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));clearTimeout(timeout);app.exit(result.passed&&result.isElectron?0:1);
});
let win;
app.whenReady().then(()=>{
 win=new BrowserWindow({show:false,webPreferences:{contextIsolation:true,nodeIntegration:false,
   preload:process.env.MOTOR_DRIVEN_PRELOAD}});
 win.webContents.on('console-message',event=>console.log('renderer:',event.message));
 win.webContents.on('did-fail-load',(_event,code,description)=>{console.error(code,description);app.exit(1);});
 win.loadFile(path.join(process.env.MOTOR_DRIVEN_SMOKE_DIR,'index.html'));
});
