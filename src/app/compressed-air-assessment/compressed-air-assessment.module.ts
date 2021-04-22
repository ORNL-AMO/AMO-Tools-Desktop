import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirAssessmentComponent } from './compressed-air-assessment.component';
import { CompressedAirBannerComponent } from './compressed-air-banner/compressed-air-banner.component';
import { CompressedAirAssessmentService } from './compressed-air-assessment.service';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [CompressedAirAssessmentComponent, CompressedAirBannerComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  providers: [
    CompressedAirAssessmentService
  ]
})
export class CompressedAirAssessmentModule { }
