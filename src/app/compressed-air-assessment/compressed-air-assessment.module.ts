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
import { SystemProfileSetupComponent } from './system-profile/system-profile-setup/system-profile-setup.component';
import { SystemProfileSummaryComponent } from './system-profile/system-profile-summary/system-profile-summary.component';
import { SystemProfileGraphsComponent } from './system-profile/system-profile-graphs/system-profile-graphs.component';
import { SystemBasicsFormService } from './system-basics/system-basics-form.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SystemInformationFormService } from './system-information/system-information-form.service';
import { NameplateDataComponent } from './inventory/nameplate-data/nameplate-data.component';
import { ControlDataComponent } from './inventory/control-data/control-data.component';
import { DesignDetailsComponent } from './inventory/design-details/design-details.component';
import { InventoryService } from './inventory/inventory.service';
import { ResultsPanelComponent } from './results-panel/results-panel.component';
import { InventoryTableComponent } from './results-panel/inventory-table/inventory-table.component';
import { ProfileSetupFormComponent } from './system-profile/profile-setup-form/profile-setup-form.component';
import { CompressorOrderingTableComponent } from './system-profile/system-profile-setup/compressor-ordering-table/compressor-ordering-table.component';
import { OperatingProfileTableComponent } from './system-profile/system-profile-setup/operating-profile-table/operating-profile-table.component';
import { SystemProfileService } from './system-profile/system-profile.service';
import { CentrifugalSpecificsComponent } from './inventory/centrifugal-specifics/centrifugal-specifics.component';
import { CompressedAirCalculationService } from './compressed-air-calculation.service';
import { PerformancePointsComponent } from './inventory/performance-points/performance-points.component';
import { FullLoadComponent } from './inventory/performance-points/full-load/full-load.component';
import { MaxFullFlowComponent } from './inventory/performance-points/max-full-flow/max-full-flow.component';
import { NoLoadComponent } from './inventory/performance-points/no-load/no-load.component';
import { UnloadPointComponent } from './inventory/performance-points/unload-point/unload-point.component';
import { BlowoffComponent } from './inventory/performance-points/blowoff/blowoff.component';
import { GenericCompressorDbService } from './generic-compressor-db.service';
import { GenericCompressorModalComponent } from './inventory/generic-compressor-modal/generic-compressor-modal.component';
import { ModalModule } from 'ngx-bootstrap';
import { CompressorOptionsTableComponent } from './inventory/generic-compressor-modal/compressor-options-table/compressor-options-table.component';
import { FilterCompressorsComponent } from './inventory/generic-compressor-modal/filter-compressors/filter-compressors.component';
import { CompressorTypePipe } from './compressor-type.pipe';
import { ControlTypePipe } from './control-type.pipe';
import { FilterCompressorsPipe } from './inventory/generic-compressor-modal/filter-compressors.pipe';
import { InletConditionsComponent } from './inventory/inlet-conditions/inlet-conditions.component';
import { InventoryPerformanceProfileComponent } from './results-panel/inventory-performance-profile/inventory-performance-profile.component';
import { PerformancePointCalculationsService } from './inventory/performance-points/calculations/performance-point-calculations.service';
import { BlowoffCalculationsService } from './inventory/performance-points/calculations/blowoff-calculations.service';
import { FullLoadCalculationsService } from './inventory/performance-points/calculations/full-load-calculations.service';
import { MaxFullFlowCalculationsService } from './inventory/performance-points/calculations/max-full-flow-calculations.service';
import { NoLoadCalculationsService } from './inventory/performance-points/calculations/no-load-calculations.service';
import { UnloadPointCalculationsService } from './inventory/performance-points/calculations/unload-point-calculations.service';
import { SharedPointCalculationsService } from './inventory/performance-points/calculations/shared-point-calculations.service';
import { DayTypeFilterPipe } from './system-profile/day-type-filter.pipe';
import { HelpPanelComponent } from './results-panel/help-panel/help-panel.component';
import { SystemBasicsHelpComponent } from './results-panel/help-panel/system-basics-help/system-basics-help.component';
import { SystemInformationHelpComponent } from './results-panel/help-panel/system-information-help/system-information-help.component';
import { InventoryHelpComponent } from './results-panel/help-panel/inventory-help/inventory-help.component';
import { NameplateDataHelpComponent } from './results-panel/help-panel/inventory-help/nameplate-data-help/nameplate-data-help.component';
import { ControlDataHelpComponent } from './results-panel/help-panel/inventory-help/control-data-help/control-data-help.component';
import { InletConditionsHelpComponent } from './results-panel/help-panel/inventory-help/inlet-conditions-help/inlet-conditions-help.component';
import { DesignDetailsHelpComponent } from './results-panel/help-panel/inventory-help/design-details-help/design-details-help.component';
import { CentrifugalSpecificsHelpComponent } from './results-panel/help-panel/inventory-help/centrifugal-specifics-help/centrifugal-specifics-help.component';
import { PerformancePointsHelpComponent } from './results-panel/help-panel/inventory-help/performance-points-help/performance-points-help.component';
import { NoLoadHelpComponent } from './results-panel/help-panel/inventory-help/performance-points-help/no-load-help/no-load-help.component';
import { UnloadPointHelpComponent } from './results-panel/help-panel/inventory-help/performance-points-help/unload-point-help/unload-point-help.component';
import { BlowoffHelpComponent } from './results-panel/help-panel/inventory-help/performance-points-help/blowoff-help/blowoff-help.component';
import { FullLoadHelpComponent } from './results-panel/help-panel/inventory-help/performance-points-help/full-load-help/full-load-help.component';
import { MaxFullFlowHelpComponent } from './results-panel/help-panel/inventory-help/performance-points-help/max-full-flow-help/max-full-flow-help.component';

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
    DesignDetailsComponent,
    ResultsPanelComponent,
    InventoryTableComponent,
    ProfileSetupFormComponent,
    CompressorOrderingTableComponent,
    OperatingProfileTableComponent,
    CentrifugalSpecificsComponent,
    PerformancePointsComponent,
    FullLoadComponent,
    MaxFullFlowComponent,
    NoLoadComponent,
    UnloadPointComponent,
    BlowoffComponent,
    GenericCompressorModalComponent,
    CompressorOptionsTableComponent,
    FilterCompressorsComponent,
    CompressorTypePipe,
    ControlTypePipe,
    FilterCompressorsPipe,
    InletConditionsComponent,
    InventoryPerformanceProfileComponent,
    DayTypeFilterPipe,
    HelpPanelComponent,
    SystemBasicsHelpComponent,
    SystemInformationHelpComponent,
    InventoryHelpComponent,
    NameplateDataHelpComponent,
    ControlDataHelpComponent,
    InletConditionsHelpComponent,
    DesignDetailsHelpComponent,
    CentrifugalSpecificsHelpComponent,
    PerformancePointsHelpComponent,
    NoLoadHelpComponent,
    UnloadPointHelpComponent,
    BlowoffHelpComponent,
    FullLoadHelpComponent,
    MaxFullFlowHelpComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SettingsModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule
  ],
  providers: [
    CompressedAirAssessmentService,
    SystemBasicsFormService,
    SystemInformationFormService,
    InventoryService,
    SystemProfileService,
    CompressedAirCalculationService,
    GenericCompressorDbService,
    PerformancePointCalculationsService,
    BlowoffCalculationsService,
    FullLoadCalculationsService,
    MaxFullFlowCalculationsService,
    NoLoadCalculationsService,
    UnloadPointCalculationsService,
    SharedPointCalculationsService
  ]
})
export class CompressedAirAssessmentModule { }
