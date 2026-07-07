import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportableResultsTableComponent } from './exportable-results-table.component';
import { FormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';


@NgModule({
  declarations: [
    ExportableResultsTableComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ClipboardModule
  ],
  exports: [
    ExportableResultsTableComponent
  ]
})
export class ExportableResultsTableModule { }
