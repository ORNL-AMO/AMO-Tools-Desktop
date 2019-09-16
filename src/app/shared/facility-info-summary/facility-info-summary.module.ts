import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityInfoSummaryComponent } from './facility-info-summary.component';
import { SharedModule } from '../shared.module';



@NgModule({
  declarations: [FacilityInfoSummaryComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    FacilityInfoSummaryComponent
  ]
})
export class FacilityInfoSummaryModule { }
