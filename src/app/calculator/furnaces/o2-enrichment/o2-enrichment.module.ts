import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { O2EnrichmentHelpComponent } from '../o2-enrichment/o2-enrichment-help/o2-enrichment-help.component';
import { O2EnrichmentComponent } from '../o2-enrichment/o2-enrichment.component';
import { O2EnrichmentGraphComponent } from '../o2-enrichment/o2-enrichment-graph/o2-enrichment-graph.component';
import { O2EnrichmentFormComponent } from '../o2-enrichment/o2-enrichment-form/o2-enrichment-form.component';
import { O2EnrichmentService } from './o2-enrichment.service';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule,
    SimpleTooltipModule,
    SharedPipesModule
  ],
  declarations: [
    O2EnrichmentFormComponent,
    O2EnrichmentComponent,
    O2EnrichmentGraphComponent,
    O2EnrichmentHelpComponent
  ],
  exports: [
    O2EnrichmentComponent
  ],
  providers: [
    O2EnrichmentService
  ]
})
export class O2EnrichmentModule { }
