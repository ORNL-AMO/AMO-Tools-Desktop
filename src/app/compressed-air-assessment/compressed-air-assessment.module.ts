import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirAssessmentComponent } from './compressed-air-assessment.component';
import { CompressedAirBannerComponent } from './compressed-air-banner/compressed-air-banner.component';
import { CompressedAirAssessmentService } from './compressed-air-assessment.service';
import { RouterModule } from '@angular/router';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { SettingsModule } from '../settings/settings.module';
import { SetupTabsComponent } from './compressed-air-banner/setup-tabs/setup-tabs.component';

@NgModule({
  declarations: [CompressedAirAssessmentComponent, CompressedAirBannerComponent, SystemBasicsComponent, SetupTabsComponent],
  imports: [
    CommonModule,
    RouterModule,
    SettingsModule
  ],
  providers: [
    CompressedAirAssessmentService
  ]
})
export class CompressedAirAssessmentModule { }
