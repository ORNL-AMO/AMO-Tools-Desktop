import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ElectronService } from '../../electron/electron.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { BackupDataService, MeasurBackupFile } from '../../shared/backup-data.service';
import { AutomaticBackupService } from '../../electron/automatic-backup.service';
import { ApplicationInstanceData, ApplicationInstanceDbService } from '../../indexedDb/application-instance-db.service';
import { ImportBackupService } from '../../shared/import-backup.service';
import { FileImportStatus, ImportService } from '../../shared/import-export/import.service';
import { AnalyticsService } from '../../shared/analytics/analytics.service';
import { MEASUR_RESOURCES_URL } from '../../shared/models/utilities';

@Component({
    selector: 'app-data-and-backup',
    templateUrl: './data-and-backup.component.html',
    styleUrl: './data-and-backup.component.css',
    standalone: false
})
export class DataAndBackupComponent {

  backupFilePath: string;
  backupFilePathSub: Subscription;
  applicationInstanceData: ApplicationInstanceData;
  applicationInstanceDataSub: Subscription;
  dataBackupFilePath: string;
  isAutomaticBackupOn: boolean = false;
  fileImportStatus: FileImportStatus;

  MEASUR_RESOURCES_URL = MEASUR_RESOURCES_URL;
  

  @ViewChild('importFileRef', { static: false }) importFileRef: ElementRef;


  constructor(public electronService: ElectronService,
    private backupDataService: BackupDataService,
    private importBackupService: ImportBackupService,
    private applicationInstanceDbService: ApplicationInstanceDbService,
    private automaticBackupService: AutomaticBackupService,
    private importService: ImportService,
    private analyticsService: AnalyticsService,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.applicationInstanceData = this.applicationInstanceDbService.applicationInstanceData.getValue();
    if (this.electronService.isElectron) {
      this.backupFilePathSub = this.electronService.backupFilePath.subscribe(updatedFilePath => {
        if (updatedFilePath)
          this.updateFilePath(updatedFilePath)
      });
    }
  }

  ngOnDestroy() {
    if (this.electronService.isElectron) {
      this.backupFilePathSub.unsubscribe();
    }
  }

  createBackupFile() {
    this.backupDataService.downloadBackupFile();
  }

  async updateFilePath(backupFilePath: string) {
    this.dataBackupFilePath = backupFilePath;
    this.applicationInstanceData.dataBackupFilePath = backupFilePath;
    this.saveAutomaticBackupSettings();
    this.automaticBackupService.saveBackup();
  }

  changeAutomaticBackupLocation() {
    if (this.applicationInstanceData.isAutomaticBackupOn) {
      this.selectAutomaticBackupLocation()
    }
  }

  async selectAutomaticBackupLocation() {
    let newBackupFile = await this.backupDataService.getBackupFile();
    this.electronService.openDialog(newBackupFile);
  }

  async toggleAutomaticBackup() {
    if (this.applicationInstanceData && this.applicationInstanceData.isAutomaticBackupOn) {
      this.analyticsService.sendEvent('measur-auto-backup-on');
    }
    this.saveAutomaticBackupSettings();
  }


  async saveAutomaticBackupSettings() {
    await firstValueFrom(this.applicationInstanceDbService.updateWithObservable(this.applicationInstanceData));
    this.applicationInstanceDbService.applicationInstanceData.next(this.applicationInstanceData);
    this.cd.detectChanges();
  }

  async selectImportFile(eventTarget: EventTarget) {
    let files: FileList = (eventTarget as HTMLInputElement).files;
    if (files && files.length !== 0) {
      // let gzRegex = /.gz$/;
      let jsonRegex = /.json$/;
      let importFile: File = files[0];

      if (jsonRegex.test(importFile.name)) {
        try {
          const fileContent = await this.importService.readFileAsText(importFile);
          this.importBackupService.selectedImportFile = JSON.parse(fileContent);
          this.fileImportStatus = this.importService.getIsValidImportType(this.importBackupService.selectedImportFile, 'MEASUR-BACKUP');
        } catch (err) {
          console.error('File reading/parsing error:', err);
          this.fileImportStatus = { isValid: false, fileType: 'UNKNOWN' };
        }
      } else {
        this.fileImportStatus = { isValid: false, fileType: 'UNKNOWN' };
      }
    }
  }

  async importBackupFile() {
    await this.importBackupService.importBackupFile();
    this.importFileRef.nativeElement.value = "";

  }


}
