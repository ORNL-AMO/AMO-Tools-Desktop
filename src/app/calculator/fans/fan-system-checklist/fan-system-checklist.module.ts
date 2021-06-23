import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanSystemChecklistComponent } from './fan-system-checklist.component';
import { FanSystemChecklistFormService } from './fan-system-checklist-form.service';
import { FanSystemChecklistService } from './fan-system-checklist.service';
import { FanSystemChecklistFormComponent } from './fan-system-checklist-form/fan-system-checklist-form.component';
import { FanSystemChecklistResultsComponent } from './fan-system-checklist-results/fan-system-checklist-results.component';
import { FanSystemChecklistHelpComponent } from './fan-system-checklist-help/fan-system-checklist-help.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { PercentGraphModule } from '../../../shared/percent-graph/percent-graph.module';
import { FanSystemChecklistCopyTableComponent } from './fan-system-checklist-copy-table/fan-system-checklist-copy-table.component';
import { FanSystemChecklistChartComponent } from './fan-system-checklist-chart/fan-system-checklist-chart.component';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';



@NgModule({
  declarations: [
    FanSystemChecklistComponent,
    FanSystemChecklistFormComponent, 
    FanSystemChecklistResultsComponent, 
    FanSystemChecklistHelpComponent, FanSystemChecklistCopyTableComponent, FanSystemChecklistChartComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OperatingHoursModalModule,
    SimpleTooltipModule,
    ExportableResultsTableModule
  ],
  exports: [
    FanSystemChecklistComponent
  ],
  providers: [
    FanSystemChecklistFormService,
    FanSystemChecklistService
  ]
})
export class FanSystemChecklistModule { }
