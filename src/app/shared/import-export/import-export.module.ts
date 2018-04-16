import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExportService } from './import-export.service';
import { ImportExportComponent } from './import-export.component';
import { ImportExport2Service } from './import-export-2.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ImportExportComponent],
  providers: [
    ImportExportService,
    ImportExport2Service
  ],
  exports: [  
    ImportExportComponent
  ]
})
export class ImportExportModule { }
