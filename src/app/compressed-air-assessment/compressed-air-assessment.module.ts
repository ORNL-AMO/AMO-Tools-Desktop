import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirAssessmentComponent } from './compressed-air-assessment.component';
import { CompressedAirBannerComponent } from './compressed-air-banner/compressed-air-banner.component';
import { CompressedAirAssessmentService } from './compressed-air-assessment.service';
import { RouterModule } from '@angular/router';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { SettingsModule } from '../settings/settings.module';
import { SetupTabsComponent } from './compressed-air-banner/setup-tabs/setup-tabs.component';
import { SystemInformationComponent } from './system-information/system-information.component';
import { DayTypesComponent } from './day-types/day-types.component';
import { EndUsesComponent } from './end-uses/end-uses.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SystemProfileSetupComponent } from './system-profile-setup/system-profile-setup.component';
import { SystemProfileSummaryComponent } from './system-profile-summary/system-profile-summary.component';
import { SystemProfileGraphsComponent } from './system-profile-graphs/system-profile-graphs.component';
import { SystemBasicsFormService } from './system-basics/system-basics-form.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SystemInformationFormService } from './system-information/system-information-form.service';
import { NameplateDataComponent } from './inventory/nameplate-data/nameplate-data.component';
import { ControlDataComponent } from './inventory/control-data/control-data.component';
import { PerformanceComponent } from './inventory/performance/performance.component';
import { DesignDetailsComponent } from './inventory/design-details/design-details.component';
import { InventoryService } from './inventory/inventory.service';

@NgModule({
  declarations: [
    CompressedAirAssessmentComponent,
    CompressedAirBannerComponent,
    SystemBasicsComponent,
    SetupTabsComponent,
    SystemInformationComponent,
    DayTypesComponent,
    EndUsesComponent,
    InventoryComponent,
    SystemProfileSetupComponent,
    SystemProfileSummaryComponent,
    SystemProfileGraphsComponent,
    NameplateDataComponent,
    ControlDataComponent,
    PerformanceComponent,
    DesignDetailsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SettingsModule,
    ReactiveFormsModule
  ],
  providers: [
    CompressedAirAssessmentService,
    SystemBasicsFormService,
    SystemInformationFormService,
    InventoryService
  ]
})
export class CompressedAirAssessmentModule { }
