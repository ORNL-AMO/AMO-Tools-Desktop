import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportableResultsTableComponent } from './exportable-results-table.component';
import { AnimatedCheckmarkModule } from '../animated-checkmark/animated-checkmark.module';
import { ExportableTableComponent } from './exportable-table/exportable-table.component';
import { FormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';


@NgModule({
  declarations: [
    ExportableResultsTableComponent,
    ExportableTableComponent
  ],
  imports: [
    CommonModule,
    AnimatedCheckmarkModule,
    FormsModule,
    ClipboardModule
  ],
  exports: [
    ExportableResultsTableComponent,
    ExportableTableComponent
  ]
})
export class ExportableResultsTableModule { }
