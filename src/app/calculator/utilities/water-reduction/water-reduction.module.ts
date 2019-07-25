import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaterReductionComponent } from './water-reduction.component';
import { WaterReductionService } from './water-reduction.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { WaterReductionFormComponent } from './water-reduction-form/water-reduction-form.component';
import { WaterReductionResultsComponent } from './water-reduction-results/water-reduction-results.component';
import { WaterReductionHelpComponent } from './water-reduction-help/water-reduction-help.component';

@NgModule({
  declarations: [
    WaterReductionComponent,
    WaterReductionFormComponent,
    WaterReductionResultsComponent,
    WaterReductionHelpComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    WaterReductionService
  ],
  exports: [
    WaterReductionComponent
  ]
})
export class WaterReductionModule { }
