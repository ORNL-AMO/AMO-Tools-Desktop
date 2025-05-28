import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaterAssessmentComponent } from './water-assessment.component';
import { ResultsPanelComponent } from './results-panel/results-panel.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { WaterBannerComponent } from './water-banner/water-banner.component';
import { WaterAssessmentResultsService } from './water-assessment-results.service';
import { WaterAssessmentService } from './water-assessment.service';
import { ConvertWaterAssessmentService } from './convert-water-assessment.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SettingsModule } from '../settings/settings.module';
import { AssessmentCo2SavingsModule } from '../shared/assessment-co2-savings/assessment-co2-savings.module';
import { Co2HelpTextModule } from '../shared/co2-help-text/co2-help-text.module';
import { ConfirmDeleteModalModule } from '../shared/confirm-delete-modal/confirm-delete-modal.module';
import { ExportableResultsTableModule } from '../shared/exportable-results-table/exportable-results-table.module';
import { ImportExportModule } from '../shared/import-export/import-export.module';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { UpdateUnitsModalModule } from '../shared/update-units-modal/update-units-modal.module';
import { TabsTooltipModule } from '../shared/tabs-tooltip/tabs-tooltip.module';
import { SetupTabsComponent } from './water-banner/setup-tabs/setup-tabs.component';
import { IntakeSourceComponent } from './intake-source/intake-source.component';
import { WaterComponentTableComponent } from './results-panel/water-component-table/water-component-table.component';
import { WaterSystemComponentService } from './water-system-component.service';
import { WaterProcessDiagramModule } from '../water-process-diagram/water-process-diagram.module';
import { UpdateAssessmentFromDiagramService } from './update-assessment-from-diagram.service';
import { DischargeOutletComponent } from './discharge-outlet/discharge-outlet.component';
import { WaterUsingSystemService } from './water-using-system/water-using-system.service';
import { HeatEnergyComponent } from './water-using-system/added-energy/heat-energy/heat-energy.component';
import { HeatEnergyService } from './water-using-system/added-energy/heat-energy/heat-energy.service';
import { OperatingHoursModalModule } from '../shared/operating-hours-modal/operating-hours-modal.module';
import { CoolingTowerComponent } from './water-using-system/water-system-data/cooling-tower/cooling-tower.component';
import { ProcessUseComponent } from './water-using-system/water-system-data/process-use/process-use.component';
import { KitchenRestroomComponent } from './water-using-system/water-system-data/kitchen-restroom/kitchen-restroom.component';
import { BoilerWaterComponent } from './water-using-system/water-system-data/boiler-water/boiler-water.component';
import { LandscapingComponent } from './water-using-system/water-system-data/landscaping/landscaping.component';
import { PercentLoadEstimationModule } from '../calculator/motors/percent-load-estimation/percent-load-estimation.module';
import { StackLossModule } from '../calculator/steam/stack-loss/stack-loss.module';
import { WaterSystemDataModalComponent } from './water-using-system/water-system-data/water-system-data-modal/water-system-data-modal.component';
import { WaterSystemDataComponent } from './water-using-system/water-system-data/water-system-data.component';
import { AddedEnergyComponent } from './water-using-system/added-energy/added-energy.component';
import { WaterUsingSystemComponent } from './water-using-system/water-using-system.component';
import { MotorEnergyComponent } from './water-using-system/added-energy/motor-energy/motor-energy.component';
import { MotorEnergyService } from './water-using-system/added-energy/motor-energy/motor-energy.service';
import { WasteWaterTreatmentComponent } from './waste-water-treatment/waste-water-treatment.component';
import { SystemBasicsService } from './system-basics/system-basics.service';
import { WaterTreatmentComponent } from './water-treatment/water-treatment.component';
import { WaterBalanceResultsTableComponent } from './results-panel/water-balance-results-table/water-balance-results-table.component';
import { MonthlyFlowChartComponent } from './results-panel/monthly-flow-chart/monthly-flow-chart.component';
import { MonthlyFlowModalComponent } from './monthly-flow-modal/monthly-flow-modal.component';
import { WaterSourcesWrapperComponent } from './water-using-system/water-sources-wrapper/water-sources-wrapper.component';
import { ConnectionFlowComponent } from './water-using-system/connection-flow/connection-flow.component';
import { SystemTreatmentComponent } from './water-using-system/system-treatment/system-treatment.component';
import { InSystemTreatmentTableComponent } from './results-panel/in-system-treatment-table/in-system-treatment-table.component';
import { WaterReportModule } from './water-report/water-report.module';
import { AlertBadgeComponent } from '../shared/alert-badge/alert-badge.component';
import { AlertInfoContainerComponent } from '../shared/alert-info-container/alert-info-container.component';

@NgModule({
  declarations: [
    WaterAssessmentComponent,
    ResultsPanelComponent,
    WaterBannerComponent,
    SetupTabsComponent,
    IntakeSourceComponent,
    WaterUsingSystemComponent,
    WaterComponentTableComponent,
    WaterBalanceResultsTableComponent,
    DischargeOutletComponent,
    HeatEnergyComponent,
    MotorEnergyComponent,
    CoolingTowerComponent,
    ProcessUseComponent,
    KitchenRestroomComponent,
    BoilerWaterComponent,
    LandscapingComponent,
    WaterSystemDataModalComponent,
    WaterSystemDataComponent,
    AddedEnergyComponent,
    WaterTreatmentComponent,
    WasteWaterTreatmentComponent,
    SystemBasicsComponent,
    MonthlyFlowModalComponent,
    MonthlyFlowChartComponent,
    WaterSourcesWrapperComponent,
    ConnectionFlowComponent,
    SystemTreatmentComponent,
    InSystemTreatmentTableComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SettingsModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
    NgbModule,
    TabsTooltipModule,
    ConfirmDeleteModalModule, 
    UpdateUnitsModalModule,
    SharedPipesModule,
    ExportableResultsTableModule,
    AssessmentCo2SavingsModule,
    Co2HelpTextModule,
    ImportExportModule,
    WaterProcessDiagramModule,
    OperatingHoursModalModule,
    ConfirmDeleteModalModule, 
    PercentLoadEstimationModule,
    StackLossModule,
    WaterReportModule,
    AlertBadgeComponent,
    AlertInfoContainerComponent
  ],
  providers: [
    WaterAssessmentService,
    WaterSystemComponentService,
    WaterAssessmentResultsService,
    ConvertWaterAssessmentService,
    UpdateAssessmentFromDiagramService,
    WaterUsingSystemService,
    HeatEnergyService,
    MotorEnergyService,
    SystemBasicsService,
  ]
})
export class WaterModule { }
