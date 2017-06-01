import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExportService } from './import-export.service';
import { ImportExportComponent } from './import-export.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ImportExportComponent],
  providers: [
    ImportExportService
  ],
  exports: [  
    ImportExportComponent
  ]
})
export class ImportExportModule { }
