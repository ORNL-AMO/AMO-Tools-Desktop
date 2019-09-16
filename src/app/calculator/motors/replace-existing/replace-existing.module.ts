import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplaceExistingComponent } from './replace-existing.component';
import { ReplaceExistingFormComponent } from './replace-existing-form/replace-existing-form.component';
import { ReplaceExistingHelpComponent } from './replace-existing-help/replace-existing-help.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ReplaceExistingService } from './replace-existing.service';
import { ReplaceExistingResultsComponent } from './replace-existing-results/replace-existing-results.component';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { PercentGraphModule } from '../../../shared/percent-graph/percent-graph.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule,
    PercentGraphModule
  ],
  providers: [
    ReplaceExistingService
  ],
  declarations: [ReplaceExistingComponent, ReplaceExistingFormComponent, ReplaceExistingHelpComponent, ReplaceExistingResultsComponent],
  exports: [ReplaceExistingComponent]
})
export class ReplaceExistingModule { }
