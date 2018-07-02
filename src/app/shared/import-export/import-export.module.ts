import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExportService } from './import-export.service';
import { ImportExportComponent } from './import-export.component';
import { ExportService } from './export.service';
import { ImportService } from './import.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ImportExportComponent],
  providers: [
    ImportExportService,
    ExportService,
    ImportService
  ],
  exports: [  
    ImportExportComponent
  ]
})
export class ImportExportModule { }
