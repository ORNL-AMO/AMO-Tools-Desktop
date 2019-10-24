import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CompressedAirReductionComponent } from './compressed-air-reduction.component';
import { CompressedAirReductionService } from './compressed-air-reduction.service';
import { CompressedAirReductionFormComponent } from './compressed-air-reduction-form/compressed-air-reduction-form.component';
import { CompressedAirReductionResultsComponent } from './compressed-air-reduction-results/compressed-air-reduction-results.component';
import { CompressedAirReductionHelpComponent } from './compressed-air-reduction-help/compressed-air-reduction-help.component';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ConvertCompressedAirReductionService } from './convert-compressed-air-reduction.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule
  ],
  declarations: [
    CompressedAirReductionComponent,
    CompressedAirReductionFormComponent,
    CompressedAirReductionResultsComponent,
    CompressedAirReductionHelpComponent,
  ],
   providers: [
     CompressedAirReductionService,
     ConvertCompressedAirReductionService
   ],
   exports: [
     CompressedAirReductionComponent
   ]
})
export class CompressedAirReductionModule { }
