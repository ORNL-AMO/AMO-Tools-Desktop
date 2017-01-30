import { Injectable } from '@angular/core';
declare var electron: any;

@Injectable()
export class ElectronService {
  win: any = electron.remote.getCurrentWindow();
  app: any = electron.remote.app;
  dialog: any = electron.remote.dialog;

  constructor() { }

  toggleDevTools(){
    this.win.toggleDevTools();
  }

  closeWindow(){
    this.app.quit();
  }
}
