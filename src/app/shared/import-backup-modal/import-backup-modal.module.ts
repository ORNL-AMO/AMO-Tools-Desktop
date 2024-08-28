import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ImportBackupModalComponent } from './import-backup-modal.component';
import { ImportBackupModalService } from './import-backup-modal.service';



@NgModule({
  declarations: [ImportBackupModalComponent],
  imports: [
    CommonModule,
    ModalModule
  ],
  exports: [
    ImportBackupModalComponent
  ],
  providers: [
    ImportBackupModalService
  ]
})
export class ImportBackupModalModule { }
