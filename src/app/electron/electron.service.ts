import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MeasurBackupFile } from '../shared/backup-data.service';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  updateAvailable: BehaviorSubject<boolean>;
  releaseData: BehaviorSubject<ReleaseData>;
  updateError: BehaviorSubject<string>;
  updateDownloaded: BehaviorSubject<boolean>;
  backupFilePath: BehaviorSubject<string>;
  downloadProgress: BehaviorSubject<DownloadProgress>;
  isElectron: boolean;
  constructor() {

    this.updateAvailable = new BehaviorSubject<boolean>(false);
    this.releaseData = new BehaviorSubject<ReleaseData>(undefined);
    this.updateError = new BehaviorSubject<string>(undefined);
    this.updateDownloaded = new BehaviorSubject<boolean>(false);
    this.backupFilePath = new BehaviorSubject<string>(undefined);
    this.downloadProgress = new BehaviorSubject<DownloadProgress>(undefined);


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
      console.log('[ElectronService] Electron API not found, cannot listen for updates');
      return;
    }
    window["electronAPI"].on("release-info", (data: ReleaseData) => {
      console.log('[ElectronService] release-info', data);
      this.releaseData.next(data);
    });
    window["electronAPI"].on("available", (data) => {
      console.log('[ElectronService] available', data);
      this.updateAvailable.next(true);
    });
    window["electronAPI"].on("error", (error) => {
      console.log('[ElectronService] error', error);
      this.updateError.next(error);
    });
     window["electronAPI"].on("download-progress", (progress: DownloadProgress) => {
      if (progress) {
        this.downloadProgress.next(progress);
      }
    });
    window["electronAPI"].on("update-downloaded", (data) => {
      console.log('[ElectronService] update-downloaded', data);
      this.updateDownloaded.next(true);
    });
    window["electronAPI"].on("backup-file-path", (filePath) => {
      if (filePath) {
        this.backupFilePath.next(filePath);
      }
    });

  }

  //Used to tell electron that app is ready
  //does nothing when in browser
  // todo don't really need params here?
  sendAppReady(data: any): void {
    if (!window["electronAPI"]) {
      console.log('[ElectronService] Electron API not found, cannot send app ready signal');
      return;
    }
    window["electronAPI"].send("ready", data);
  }

  //send signal to ipcMain to update
  sendUpdateSignal() {
    if (!window["electronAPI"]) {
      console.log('[ElectronService] Electron API not found, cannot send update signal');
      return;
    }
    window["electronAPI"].send("update");
  }

  sendAppRelaunch(){
    if(!window["electronAPI"]){
      console.log('[ElectronService] Electron API not found, cannot send app relaunch signal');
      return;
    }
    console.log('[ElectronService] relaunch1');
    window["electronAPI"].send("relaunch");
  }

  sendQuitAndInstall(){
    if(!window["electronAPI"]){
      return;
    }
    console.log('[ElectronService] quit and install');
    window["electronAPI"].send("quit-and-install");
  }

  saveToFileSystem(backupFile: any) {
    if (!window["electronAPI"] || !backupFile) {
      return;
    }
    let args: { fileName: string, fileData: any } = {
      fileName: undefined,
      fileData: backupFile
    }
    if (backupFile.dataBackupFilePath) {
      args.fileName = backupFile.dataBackupFilePath;
    } else {
      args.fileName = backupFile.name + '.json';
    }
    window["electronAPI"].send("saveFile", args);
  }

  openDialog(backupFile: MeasurBackupFile) {
    if (!window["electronAPI"]) {
      return;
    }
    let args: { fileName: string, fileData: any } = {
      fileName: undefined,
      fileData: backupFile
    }
    if (backupFile.dataBackupFilePath) {
      args.fileName = backupFile.dataBackupFilePath;
    } else {
      args.fileName = backupFile.filename + '.json';
    }
    window["electronAPI"].send("openDialog", args);
  }


}

export interface ReleaseData { releaseName: string, releaseNotes: string, version: string}
export interface DownloadProgress { percent: number, mbPerSecond: number, transferred: number, total: number }