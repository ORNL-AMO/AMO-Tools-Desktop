import { Injectable } from '@angular/core';
declare var electron: any;

@Injectable()
export class ProjElectronService {
  win: any = electron.remote.getCurrentWindow();
  app: any = electron.remote.app;
  dialog: any = electron.remote.dialog;
  fs: any = electron.remote.fs;

  constructor() { }
 
  logDialog(){
    let fileName = this.dialog.showSaveDialog(this.win);
    return fileName;
  }
}
