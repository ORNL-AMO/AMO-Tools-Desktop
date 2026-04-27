import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExportService } from './import-export.service';
import { ExportService } from './export.service';
import { ImportService } from './import.service';
import { FormsModule } from '@angular/forms';
import { ImportModalComponent } from './import-modal/import-modal.component';
import { ExportModalComponent } from './export-modal/export-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ExportItemComponent } from './export-item/export-item.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ModalModule
  ],
  declarations: [ImportModalComponent, ExportModalComponent, ExportItemComponent],
  providers: [
    ImportExportService,
    ExportService,
    ImportService
  ],
  exports: [  
    ImportModalComponent,
    ExportModalComponent,
    ExportItemComponent
  ]
})
export class ImportExportModule { }
