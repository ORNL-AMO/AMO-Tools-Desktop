import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';

declare var electron: any;

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css']
})

@Injectable()
export class ElectronService {
  win: any = electron.remote.getCurrentWindow();
  app: any = electron.remote.app;
  dialog: any = electron.remote.dialog;
  fs: any = electron.remote.fs;

  constructor() { }

  toggleDevTools(){
    this.win.toggleDevTools();
  }

  closeWindow(){
    this.app.quit();
  }

  logDialog(){
    let fileName = this.dialog.showOpenDialog(this.win);
    console.log(fileName);
  }

  isUpdateAvailable(){
    return electron.remote.getGlobal('globalUpdate');
  }

}

export class CoreComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}