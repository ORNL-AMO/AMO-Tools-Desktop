import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanEfficiencyComponent } from './fan-efficiency.component';
import { FanEfficiencyFormComponent } from './fan-efficiency-form/fan-efficiency-form.component';
import { FanEfficiencyGraphComponent } from './fan-efficiency-graph/fan-efficiency-graph.component';
import { FanEfficiencyHelpComponent } from './fan-efficiency-help/fan-efficiency-help.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { FanEfficiencyService } from './fan-efficiency.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [FanEfficiencyComponent, FanEfficiencyFormComponent, FanEfficiencyGraphComponent, FanEfficiencyHelpComponent],
  exports: [FanEfficiencyComponent],
  providers: [FanEfficiencyService]
})
export class FanEfficiencyModule { }
