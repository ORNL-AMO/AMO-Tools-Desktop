import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatePointAnalysisComponent } from './state-point-analysis.component';
import { StatePointAnalysisFormComponent } from './state-point-analysis-form/state-point-analysis-form.component';
import { StatePointAnalysisGraphComponent } from './state-point-analysis-graph/state-point-analysis-graph.component';
import { StatePointAnalysisHelpComponent } from './state-point-analysis-help/state-point-analysis-help.component';
import { StatePointAnalysisResultsComponent } from './state-point-analysis-results/state-point-analysis-results.component';
import { StatePointAnalysisGraphService } from './state-point-analysis-graph.service';
import { StatePointAnalysisFormService } from './state-point-analysis-form.service';
import { StatePointAnalysisService } from './state-point-analysis.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';



@NgModule({
  declarations: [
    StatePointAnalysisComponent,
    StatePointAnalysisFormComponent,
    StatePointAnalysisGraphComponent,
    StatePointAnalysisHelpComponent,
    StatePointAnalysisResultsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SimpleTooltipModule,
    ExportableResultsTableModule,
  ],
  exports: [
    StatePointAnalysisComponent
  ],
  providers: [
    StatePointAnalysisService,
    StatePointAnalysisFormService,
    StatePointAnalysisGraphService
  ]
})
export class StatePointAnalysisModule { }
