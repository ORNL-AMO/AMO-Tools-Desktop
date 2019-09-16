import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanEfficiencyComponent } from './fan-efficiency.component';
import { FanEfficiencyFormComponent } from './fan-efficiency-form/fan-efficiency-form.component';
import { FanEfficiencyHelpComponent } from './fan-efficiency-help/fan-efficiency-help.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FanEfficiencyService } from './fan-efficiency.service';
import { PercentGraphModule } from '../../../shared/percent-graph/percent-graph.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PercentGraphModule
  ],
  declarations: [FanEfficiencyComponent, FanEfficiencyFormComponent, FanEfficiencyHelpComponent],
  exports: [FanEfficiencyComponent],
  providers: [FanEfficiencyService]
})
export class FanEfficiencyModule { }
