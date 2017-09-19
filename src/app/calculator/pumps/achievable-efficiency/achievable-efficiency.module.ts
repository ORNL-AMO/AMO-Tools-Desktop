import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AchievableEfficiencyFormComponent } from './achievable-efficiency-form/achievable-efficiency-form.component';
import { AchievableEfficiencyGraphComponent } from './achievable-efficiency-graph/achievable-efficiency-graph.component';
import { AchievableEfficiencyComponent } from './achievable-efficiency.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    AchievableEfficiencyComponent,
    AchievableEfficiencyFormComponent,
    AchievableEfficiencyGraphComponent
  ],
  exports: [
    AchievableEfficiencyComponent
  ]
})
export class AchievableEfficiencyModule { }
