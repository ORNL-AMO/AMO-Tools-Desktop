import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ElectronService } from '../../electron/electron.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { BackupDataService, MeasurBackupFile } from '../../shared/backup-data.service';
import { AutomaticBackupService } from '../../electron/automatic-backup.service';
import { ApplicationInstanceData, ApplicationInstanceDbService } from '../../indexedDb/application-instance-db.service';
import { ImportBackupService } from '../../shared/import-backup.service';

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
  selectedImportFile: MeasurBackupFile;
  dataBackupFilePath: string;
  selectImportFileError: string;
  isAutomaticBackupOn: boolean = false;

  @ViewChild('importFileRef', { static: false }) importFileRef: ElementRef;


  constructor(public electronService: ElectronService,
    private backupDataService: BackupDataService,
    private importBackupService: ImportBackupService,
    private applicationInstanceDbService: ApplicationInstanceDbService,
    private automaticBackupService: AutomaticBackupService,
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

  async saveAutomaticBackupSettings() {
    await firstValueFrom(this.applicationInstanceDbService.updateWithObservable(this.applicationInstanceData));
    this.applicationInstanceDbService.applicationInstanceData.next(this.applicationInstanceData);
    this.cd.detectChanges();
  }

  async selectImportFile(eventTarget: EventTarget) {
    this.importBackupService.setImportFile(eventTarget).then(file => {
      this.selectedImportFile = file;
    });
  }

  async importBackupFile() {
    await this.importBackupService.importBackupFile();
    this.selectedImportFile = undefined;
    this.importFileRef.nativeElement.value = "";

  }


}
