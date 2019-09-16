import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AchievableEfficiencyFormComponent } from './achievable-efficiency-form/achievable-efficiency-form.component';
import { AchievableEfficiencyGraphComponent } from './achievable-efficiency-graph/achievable-efficiency-graph.component';
import { AchievableEfficiencyComponent } from './achievable-efficiency.component';
import { AchievableEfficiencyService } from './achievable-efficiency.service';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    SimpleTooltipModule
  ],
  declarations: [
    AchievableEfficiencyComponent,
    AchievableEfficiencyFormComponent,
    AchievableEfficiencyGraphComponent
  ],
  exports: [
    AchievableEfficiencyComponent
  ],
  providers: [
    AchievableEfficiencyService
  ]
})
export class AchievableEfficiencyModule { }
