import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  updateAvailable: BehaviorSubject<boolean>;
  releaseData: BehaviorSubject<ReleaseData>;
  updateError: BehaviorSubject<boolean>;
  updateDownloaded: BehaviorSubject<boolean>;
  isElectron: boolean;
  constructor() {

    this.updateAvailable = new BehaviorSubject<boolean>(false);
    this.releaseData = new BehaviorSubject<ReleaseData>(undefined);
    this.updateError = new BehaviorSubject<boolean>(false);
    this.updateDownloaded = new BehaviorSubject<boolean>(false);
    this.isElectron = window["electronAPI"]
    if (this.isElectron) {
      this.listen();
    } else {
      console.warn('Electron\'s IPC was not loaded');
    }
  }

  //listens for messages from electron about updates
  listen(): void {
    if (!window["electronAPI"]) {
      return;
    }
    window["electronAPI"].on("release-info", (data: ReleaseData) => {
      console.log('release-info');
      console.log(data)
      this.releaseData.next(data);
    });
    window["electronAPI"].on("available", (data) => {
      console.log('available');
      console.log(data)
      this.updateAvailable.next(true);
    });
    window["electronAPI"].on("error", (data) => {
      console.log('error');
      console.log(data)
      this.updateError.next(true);
    });
    window["electronAPI"].on("update-downloaded", (data) => {
      console.log('update-downloaded');
      console.log(data)
      this.updateDownloaded.next(true);
    });
  }

  //Used to tell electron that app is ready
  //does nothing when in browser
  sendAppReady(data: any): void {
    if (!window["electronAPI"]) {
      return;
    }
    window["electronAPI"].send("ready", data);
  }

  //send signal to ipcMain to update
  sendUpdateSignal() {
    if (!window["electronAPI"]) {
      return;
    }
    window["electronAPI"].send("update");
  }

  sendAppRelaunch(){
    if(!window["electronAPI"]){
      return;
    }
    console.log('relaunch1');
    window["electronAPI"].send("relaunch");
  }

  sendQuitAndInstall(){
    if(!window["electronAPI"]){
      return;
    }
    console.log('quit and install');
    window["electronAPI"].send("quit-and-install");
  }

}

export interface ReleaseData { releaseName: string, releaseNotes: string, version: string}
