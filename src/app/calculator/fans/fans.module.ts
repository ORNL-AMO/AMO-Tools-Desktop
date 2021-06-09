import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanEfficiencyModule } from './fan-efficiency/fan-efficiency.module';
import { FanAnalysisModule } from './fan-analysis/fan-analysis.module';
import { SystemAndEquipmentCurveModule } from '../system-and-equipment-curve/system-and-equipment-curve.module';
import { FansListComponent } from './fans-list/fans-list.component';
import { RouterModule } from '@angular/router';
import { FanSystemChecklistComponent } from './fan-system-checklist/fan-system-checklist.component';
import { FanSystemChecklistModule } from './fan-system-checklist/fan-system-checklist.module';
import { FanSystemChecklistFormComponent } from './fan-system-checklist/fan-system-checklist-form/fan-system-checklist-form.component';
import { FanSystemChecklistResultsComponent } from './fan-system-checklist/fan-system-checklist-results/fan-system-checklist-results.component';
import { FanSystemChecklistHelpComponent } from './fan-system-checklist/fan-system-checklist-help/fan-system-checklist-help.component';

@NgModule({
  imports: [
    CommonModule,
    FanEfficiencyModule,
    FanAnalysisModule,
    FanSystemChecklistModule,
    SystemAndEquipmentCurveModule,
    RouterModule
  ],
  declarations: [FansListComponent],
  exports: [FansListComponent]
})
export class FansModule { }
