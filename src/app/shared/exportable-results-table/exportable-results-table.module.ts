import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportableResultsTableComponent } from './exportable-results-table.component';
import { AnimatedCheckmarkModule } from '../animated-checkmark/animated-checkmark.module';
import { FormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';


@NgModule({
  declarations: [
    ExportableResultsTableComponent
  ],
  imports: [
    CommonModule,
    AnimatedCheckmarkModule,
    FormsModule,
    ClipboardModule
  ],
  exports: [
    ExportableResultsTableComponent
  ]
})
export class ExportableResultsTableModule { }
