import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EfficiencyImprovementComponent } from './efficiency-improvement.component';
import { EfficiencyImprovementFormComponent } from './efficiency-improvement-form/efficiency-improvement-form.component';
import { EfficiencyImprovementHelpComponent } from './efficiency-improvement-help/efficiency-improvement-help.component';
import { EfficiencyImprovementService } from './efficiency-improvement.service';
import { EfficiencyImprovementGraphComponent } from './efficiency-improvement-graph/efficiency-improvement-graph.component';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { EfficiencyImprovementResultsComponent } from './efficiency-improvement-results/efficiency-improvement-results.component';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SimpleTooltipModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule
  ],
  declarations: [
    EfficiencyImprovementComponent,
    EfficiencyImprovementFormComponent,
    EfficiencyImprovementHelpComponent,
    EfficiencyImprovementGraphComponent,
    EfficiencyImprovementResultsComponent
  ],
  exports: [
    EfficiencyImprovementComponent
  ],
  providers: [
    EfficiencyImprovementService
  ]
})
export class EfficiencyImprovementModule { }
