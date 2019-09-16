import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityInfoSummaryComponent } from './facility-info-summary.component';
import { SharedModule } from '../shared.module';
import { SharedPipesModule } from '../shared-pipes/shared-pipes.module';



@NgModule({
  declarations: [FacilityInfoSummaryComponent],
  imports: [
    CommonModule,
    SharedModule,
    SharedPipesModule
  ],
  exports: [
    FacilityInfoSummaryComponent
  ]
})
export class FacilityInfoSummaryModule { }
