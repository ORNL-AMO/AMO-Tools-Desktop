import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileSummaryTableComponent } from './profile-summary-table.component';
import { SharedCompressorPipesModule } from '../shared-compressor-pipes/shared-compressor-pipes.module';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';
import { IntervalHourLabelModule } from '../interval-hour-label/interval-hour-label.module';



@NgModule({
  declarations: [
    ProfileSummaryTableComponent
  ],
  imports: [
    CommonModule,
    SharedCompressorPipesModule,
    ExportableResultsTableModule,
    IntervalHourLabelModule
  ],
  exports: [
    ProfileSummaryTableComponent
  ]
})
export class ProfileSummaryTableModule { }
