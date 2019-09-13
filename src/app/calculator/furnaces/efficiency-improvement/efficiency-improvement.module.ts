import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EfficiencyImprovementComponent } from './efficiency-improvement.component';
import { EfficiencyImprovementFormComponent } from './efficiency-improvement-form/efficiency-improvement-form.component';
import { EfficiencyImprovementHelpComponent } from './efficiency-improvement-help/efficiency-improvement-help.component';
import { EfficiencyImprovementService } from './efficiency-improvement.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    EfficiencyImprovementComponent,
    EfficiencyImprovementFormComponent,
    EfficiencyImprovementHelpComponent
  ],
  exports: [
    EfficiencyImprovementComponent
  ],
  providers: [
    EfficiencyImprovementService
  ]
})
export class EfficiencyImprovementModule { }
