import { Component, ViewChild } from '@angular/core';
import { ImportBackupModalService } from './import-backup-modal.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-import-backup-modal',
  templateUrl: './import-backup-modal.component.html',
  styleUrl: './import-backup-modal.component.css'
})
export class ImportBackupModalComponent {

  backupFile: any;
  backupFileError: string;
  overwriteData: boolean = true;
  backupName: string;

  @ViewChild('importBackupModal', { static: false }) public importBackupModal: ModalDirective;


  constructor(
    private importBackupModalService: ImportBackupModalService,
  ) { }

  ngOnInit(): void {}

  ngAfterViewInit() {
    // this.importBackupModal.show();
  }

  close() {
    this.importBackupModal.hide();
    this.importBackupModalService.showImportBackupModal.next(false);
  }

  cancelImportBackup() {
    this.importBackupModal.hide();
    this.importBackupModalService.showImportBackupModal.next(false);
  }

  setImportFile(event: EventTarget) {
    this.setImportFile(event)
  }

  async importBackupFile() {
    // this.importBackupModalService.importBackupFile();
  }

}
