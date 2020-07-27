import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { O2EnrichmentHelpComponent } from '../o2-enrichment/o2-enrichment-help/o2-enrichment-help.component';
import { O2EnrichmentComponent } from '../o2-enrichment/o2-enrichment.component';
import { O2EnrichmentFormComponent } from '../o2-enrichment/o2-enrichment-form/o2-enrichment-form.component';
import { O2EnrichmentService } from './o2-enrichment.service';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { EnrichmentGraphComponent } from './enrichment-graph/enrichment-graph.component';
import { O2EnrichmentResultsComponent } from './o2-enrichment-results/o2-enrichment-results.component';
import { O2EnrichmentCopyTableComponent } from './o2-enrichment-copy-table/o2-enrichment-copy-table.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule,
    SimpleTooltipModule,
    SharedPipesModule
  ],
  declarations: [
    O2EnrichmentFormComponent,
    O2EnrichmentComponent,
    O2EnrichmentHelpComponent,
    EnrichmentGraphComponent,
    O2EnrichmentResultsComponent,
    O2EnrichmentCopyTableComponent
  ],
  exports: [
    O2EnrichmentComponent
  ],
  providers: [
    O2EnrichmentService
  ]
})
export class O2EnrichmentModule { }
