import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MeasurBackupFile } from '../shared/backup-data.service';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  updateAvailable: BehaviorSubject<boolean>;
  releaseData: BehaviorSubject<ReleaseData>;
  updateError: BehaviorSubject<boolean>;
  updateDownloaded: BehaviorSubject<boolean>;
  backupFilePath: BehaviorSubject<string>;
  fileExists: BehaviorSubject<boolean>;
  accountLatestBackupFile: BehaviorSubject<MeasurBackupFile>;
  isElectron: boolean;
  constructor() {

    this.updateAvailable = new BehaviorSubject<boolean>(false);
    this.releaseData = new BehaviorSubject<ReleaseData>(undefined);
    this.updateError = new BehaviorSubject<boolean>(false);
    this.updateDownloaded = new BehaviorSubject<boolean>(false);
    this.backupFilePath = new BehaviorSubject<string>(undefined);
    this.accountLatestBackupFile = new BehaviorSubject<MeasurBackupFile>(undefined);
    this.fileExists = new BehaviorSubject<boolean>(false);


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

    window["electronAPI"].on("backup-file-path", (filePath) => {
      if (filePath) {
        this.backupFilePath.next(filePath);
      }
    });

    window["electronAPI"].on("file-exists", (data) => {
      this.fileExists.next(data == 'file');
    });

    window["electronAPI"].on("data-file", (data) => {
      //todo 6925
      // this.accountLatestBackupFile.next(data);
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
    console.log('filedata', args.fileData);
    console.log('saveToFileSystem args.filename', args.fileName)
    window["electronAPI"].send("saveFile", args);
  }

  checkFileExists(dataBackupFilePath: string) {
    if (!window["electronAPI"] || !dataBackupFilePath) {
      return;
    }
    let args: { fileName: string } = {
      fileName: dataBackupFilePath
    }
    window["electronAPI"].send("fileExists", args);
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
    console.log('selectAutomaticBackupPath openDialog', args);
    window["electronAPI"].send("openDialog", args);
  }

  // todo gets most recent data file, or specified path
  getDataFile(dataBackupFilePath: string){
    if (!window["electronAPI"]) {
      return;
    }
    let args: { fileName: string } = {
      fileName: dataBackupFilePath
    }
    window["electronAPI"].send("getDataFile", args);
  }


}

export interface ReleaseData { releaseName: string, releaseNotes: string, version: string}
