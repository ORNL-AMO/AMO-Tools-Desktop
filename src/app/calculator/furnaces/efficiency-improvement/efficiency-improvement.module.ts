import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EfficiencyImprovementComponent } from './efficiency-improvement.component';
import { EfficiencyImprovementFormComponent } from './efficiency-improvement-form/efficiency-improvement-form.component';
import { EfficiencyImprovementGraphComponent } from './efficiency-improvement-graph/efficiency-improvement-graph.component';
import { EfficiencyImprovementHelpComponent } from './efficiency-improvement-help/efficiency-improvement-help.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    EfficiencyImprovementComponent,
    EfficiencyImprovementFormComponent,
    EfficiencyImprovementGraphComponent,
    EfficiencyImprovementHelpComponent
  ],
  exports: [
    EfficiencyImprovementComponent
  ]
})
export class EfficiencyImprovementModule { }
