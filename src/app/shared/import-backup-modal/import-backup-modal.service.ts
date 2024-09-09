import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MeasurBackupFile } from '../backup-data.service';

@Injectable({
  providedIn: 'root'
})
export class ImportBackupModalService {
  showImportBackupModal: BehaviorSubject<boolean>;
  selectedImportFile: MeasurBackupFile;
  backupFileError: string;
  importName: string;

  constructor() { 

    this.showImportBackupModal = new BehaviorSubject<boolean>(undefined);
  }

}
