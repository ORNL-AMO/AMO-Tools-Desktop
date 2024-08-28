import { ChangeDetectorRef, Component } from '@angular/core';
import { ElectronService } from '../../electron/electron.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { BackupDataService, MeasurBackupFile } from '../../shared/backup-data.service';
import { AutomaticBackupService } from '../../electron/automatic-backup.service';
import { ApplicationInstanceData, ApplicationInstanceDbService } from '../../indexedDb/application-instance-db.service';
import { ImportBackupService } from '../../shared/import-backup.service';

@Component({
  selector: 'app-data-and-backup',
  templateUrl: './data-and-backup.component.html',
  styleUrl: './data-and-backup.component.css'
})
export class DataAndBackupComponent {

  backupFilePath: string;
  backupFilePathSub: Subscription;
  applicationInstanceData: ApplicationInstanceData;
  applicationInstanceDataSub: Subscription;
  selectedImportFile: MeasurBackupFile;
  dataBackupFilePath: string;
  selectImportFileError: string;
  isAutomaticBackupOn: boolean = false;

  constructor(public electronService: ElectronService,
    private backupDataService: BackupDataService,
    private importBackupService: ImportBackupService,
    private applicationInstanceDbService: ApplicationInstanceDbService,
    private automaticBackupService: AutomaticBackupService,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    // todo 6925 need to retrieve users parent dashboard
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
    console.log('updateFilePath applicationInstanceData', this.applicationInstanceData)

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

  async saveAutomaticBackupSettings() {
    await firstValueFrom(this.applicationInstanceDbService.updateWithObservable(this.applicationInstanceData));
    this.applicationInstanceDbService.applicationInstanceData.next(this.applicationInstanceData);
    console.log('SAVE applicationInstanceData', this.applicationInstanceData);
    this.cd.detectChanges();
  }

  async selectImportFile(eventTarget: EventTarget) {
    this.importBackupService.setImportFile(eventTarget).then(file => {
      this.selectedImportFile = file;
      // console.log('promise selectedImportFile', this.selectedImportFile);
    });
    // this.selectedImportFile = this.importBackupService.selectedImportFile;
  }

  async importBackupFile() {
    await this.importBackupService.importBackupFile();
  }


}
