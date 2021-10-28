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
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
import { DayTypesHelpComponent } from './results-panel/help-panel/day-types-help/day-types-help.component';
import { CompressedAirCalculatorsComponent } from './compressed-air-calculators/compressed-air-calculators.component';
import { CalculatorTabsComponent } from './compressed-air-banner/calculator-tabs/calculator-tabs.component';
import { AirFlowConversionModule } from '../calculator/compressed-air/air-flow-conversion/air-flow-conversion.module';
import { ReceiverTankModule } from '../calculator/compressed-air/receiver-tank/receiver-tank.module';
import { AirLeakModule } from '../calculator/compressed-air/air-leak/air-leak.module';
import { PipeSizingModule } from '../calculator/compressed-air/pipe-sizing/pipe-sizing.module';
import { CompressedAirPressureReductionModule } from '../calculator/compressed-air/compressed-air-pressure-reduction/compressed-air-pressure-reduction.module';
import { AirVelocityModule } from '../calculator/compressed-air/air-velocity/air-velocity.module';
import { PerformancePointsFormService } from './inventory/performance-points/performance-points-form.service';
import { SystemCapacityModalComponent } from './system-information/system-capacity-modal/system-capacity-modal.component';
import { SystemCapacityModule } from '../calculator/compressed-air/system-capacity/system-capacity.module';
import { ExploreOpportunitiesComponent } from './explore-opportunities/explore-opportunities.component';
import { ReduceAirLeaksComponent } from './explore-opportunities/reduce-air-leaks/reduce-air-leaks.component';
import { ImproveEndUseEfficiencyComponent } from './explore-opportunities/improve-end-use-efficiency/improve-end-use-efficiency.component';
import { ReduceSystemAirPressureComponent } from './explore-opportunities/reduce-system-air-pressure/reduce-system-air-pressure.component';
import { AdjustCascadingSetPointsComponent } from './explore-opportunities/adjust-cascading-set-points/adjust-cascading-set-points.component';
import { UseAutomaticSequencerComponent } from './explore-opportunities/use-automatic-sequencer/use-automatic-sequencer.component';
import { ReduceRunTimeComponent } from './explore-opportunities/reduce-run-time/reduce-run-time.component';
import { AddReceiverVolumeComponent } from './explore-opportunities/add-receiver-volume/add-receiver-volume.component';
import { ExploreOpportunitiesService } from './explore-opportunities/explore-opportunities.service';
import { ConfirmDeleteModalModule } from '../shared/confirm-delete-modal/confirm-delete-modal.module';
import { CompressedAirDiagramComponent } from './compressed-air-diagram/compressed-air-diagram.component';
import { CompressorNamePipe } from './compressor-name.pipe';
import { ExploreOpportunitiesResultsComponent } from './explore-opportunities/explore-opportunities-results/explore-opportunities-results.component';
import { ModificationListModalComponent } from './modification-list-modal/modification-list-modal.component';
import { AddModificationModalComponent } from './add-modification-modal/add-modification-modal.component';
import { DayTypeService } from './day-types/day-type.service';
import { FullLoadAmpsModule } from '../calculator/motors/full-load-amps/full-load-amps.module';
import { AltitudeCorrectionModule } from '../calculator/utilities/altitude-correction/altitude-correction.module';
import { CompressedAirDataManagementService } from './compressed-air-data-management.service';
import { ExploreOpportunitiesProfileTableComponent } from './explore-opportunities/explore-opportunities-profile-table/explore-opportunities-profile-table.component';
import { CompressedAirAssessmentResultsService } from './compressed-air-assessment-results.service';
import { PercentGraphModule } from '../shared/percent-graph/percent-graph.module';

import { ConvertCompressedAirService } from './convert-compressed-air.service';
import { AssessmentHelpComponent } from './results-panel/help-panel/assessment-help/assessment-help.component';
import { ReduceAirLeaksHelpComponent } from './results-panel/help-panel/assessment-help/reduce-air-leaks-help/reduce-air-leaks-help.component';
import { ImproveEndUseEfficiencyHelpComponent } from './results-panel/help-panel/assessment-help/improve-end-use-efficiency-help/improve-end-use-efficiency-help.component';
import { ReduceSystemAirPressureHelpComponent } from './results-panel/help-panel/assessment-help/reduce-system-air-pressure-help/reduce-system-air-pressure-help.component';
import { UseAutomaticSequencerHelpComponent } from './results-panel/help-panel/assessment-help/use-automatic-sequencer-help/use-automatic-sequencer-help.component';
import { ReduceRunTimeHelpComponent } from './results-panel/help-panel/assessment-help/reduce-run-time-help/reduce-run-time-help.component';
import { AddReceiverVolumeHelpComponent } from './results-panel/help-panel/assessment-help/add-receiver-volume-help/add-receiver-volume-help.component';
import { SystemProfileAnnualSummaryComponent } from './system-profile/system-profile-annual-summary/system-profile-annual-summary.component';
import { UpdateUnitsModalModule } from '../shared/update-units-modal/update-units-modal.module';
import { AdjustSequencerProfileComponent } from './explore-opportunities/use-automatic-sequencer/adjust-sequencer-profile/adjust-sequencer-profile.component';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { CompressedAirReportComponent } from './compressed-air-report/compressed-air-report.component';
import { ExecutiveSummaryComponent } from './compressed-air-report/executive-summary/executive-summary.component';
import { SystemProfilesComponent } from './compressed-air-report/system-profiles/system-profiles.component';
import { ReportGraphsComponent } from './compressed-air-report/report-graphs/report-graphs.component';
import { InputSummaryComponent } from './compressed-air-report/input-summary/input-summary.component';
import { FacilityInfoSummaryModule } from '../shared/facility-info-summary/facility-info-summary.module';
import { PaybackPeriodComponent } from './compressed-air-report/payback-period/payback-period.component';
import { ProfileSummaryTableComponent } from './profile-summary-table/profile-summary-table.component';
import { SystemInfoSummaryComponent } from './compressed-air-report/input-summary/system-info-summary/system-info-summary.component';
import { CompressorItemSummaryComponent } from './compressed-air-report/input-summary/compressor-item-summary/compressor-item-summary.component';
import { SystemProfileGraphsService } from './system-profile/system-profile-graphs/system-profile-graphs.service';
import { AdjustCascadingSetPointsHelpComponent } from './results-panel/help-panel/assessment-help/adjust-cascading-set-points-help/adjust-cascading-set-points-help.component';
import { ExportableResultsTableModule } from '../shared/exportable-results-table/exportable-results-table.module';
import { AssessmentNotesComponent } from './explore-opportunities/assessment-notes/assessment-notes.component';
import { AddReceiverVolumeService } from './explore-opportunities/add-receiver-volume/add-receiver-volume.service';
import { ReduceAirLeaksService } from './explore-opportunities/reduce-air-leaks/reduce-air-leaks.service';
import { ReduceSystemAirPressureService } from './explore-opportunities/reduce-system-air-pressure/reduce-system-air-pressure.service';
import { ImproveEndUseEfficiencyItemComponent } from './explore-opportunities/improve-end-use-efficiency/improve-end-use-efficiency-item/improve-end-use-efficiency-item.component';
import { ImproveEndUseEfficiencyService } from './explore-opportunities/improve-end-use-efficiency/improve-end-use-efficiency.service';
import { UseAutomaticSequencerService } from './explore-opportunities/use-automatic-sequencer/use-automatic-sequencer.service';
import { AdjustCascadingSetPointsService } from './explore-opportunities/adjust-cascading-set-points/adjust-cascading-set-points.service';
import { ReduceRunTimeService } from './explore-opportunities/reduce-run-time/reduce-run-time.service';
import { ExploreOpportunitiesValidationService } from './explore-opportunities/explore-opportunities-validation.service';

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
    SystemCapacityModalComponent,
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
    MaxFullFlowHelpComponent,
    DayTypesHelpComponent,
    CompressedAirCalculatorsComponent,
    CalculatorTabsComponent,
    ExploreOpportunitiesComponent,
    ReduceAirLeaksComponent,
    ImproveEndUseEfficiencyComponent,
    ReduceSystemAirPressureComponent,
    AdjustCascadingSetPointsComponent,
    UseAutomaticSequencerComponent,
    ReduceRunTimeComponent,
    AddReceiverVolumeComponent,
    CompressedAirDiagramComponent,
    CompressorNamePipe,
    ExploreOpportunitiesResultsComponent,
    ModificationListModalComponent,
    AddModificationModalComponent,
    ExploreOpportunitiesProfileTableComponent,
    AssessmentHelpComponent,
    ReduceAirLeaksHelpComponent,
    ImproveEndUseEfficiencyHelpComponent,
    ReduceSystemAirPressureHelpComponent,
    UseAutomaticSequencerHelpComponent,
    ReduceRunTimeHelpComponent,
    AddReceiverVolumeHelpComponent,
    SystemProfileAnnualSummaryComponent,
    AdjustSequencerProfileComponent,
    CompressedAirReportComponent,
    ExecutiveSummaryComponent,
    SystemProfilesComponent,
    ReportGraphsComponent,
    InputSummaryComponent,
    PaybackPeriodComponent,
    ProfileSummaryTableComponent,
    SystemInfoSummaryComponent,
    CompressorItemSummaryComponent,
    AdjustCascadingSetPointsHelpComponent,
    AssessmentNotesComponent,
    ImproveEndUseEfficiencyItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SettingsModule,
    ReactiveFormsModule,
    AirFlowConversionModule,
    ReceiverTankModule,
    AirLeakModule,
    SystemCapacityModule,
    PipeSizingModule,
    CompressedAirPressureReductionModule,
    AirVelocityModule,
    FormsModule,
    ModalModule,
    NgbModule,
    ConfirmDeleteModalModule, 
    FullLoadAmpsModule,
    AltitudeCorrectionModule,
    PercentGraphModule,
    UpdateUnitsModalModule,
    SharedPipesModule,
    FacilityInfoSummaryModule,
    ExportableResultsTableModule
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
    SharedPointCalculationsService,
    PerformancePointsFormService,
    ExploreOpportunitiesService,
    DayTypeService,
    CompressedAirDataManagementService,
    CompressedAirAssessmentResultsService,
    ConvertCompressedAirService,
    SystemProfileGraphsService,
    AddReceiverVolumeService,
    ReduceAirLeaksService,
    ReduceSystemAirPressureService,
    ImproveEndUseEfficiencyService,
    UseAutomaticSequencerService,
    AdjustCascadingSetPointsService,
    ReduceRunTimeService,
    ExploreOpportunitiesValidationService
  ]
})
export class CompressedAirAssessmentModule { }
