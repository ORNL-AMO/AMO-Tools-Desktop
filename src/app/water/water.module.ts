import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaterAssessmentComponent } from './water-assessment.component';
import { WaterReportComponent } from './water-report/water-report.component';
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
import { WaterProcessComponentService } from './water-system-component.service';
import { WaterProcessDiagramModule } from '../water-process-diagram/water-process-diagram.module';
import { WaterAssessmentConnectionsService } from './water-assessment-connections.service';
import { WaterUsingSystemComponent } from './water-using-system/water-using-system.component';
import { DischargeOutletComponent } from './discharge-outlet/discharge-outlet.component';
import { WaterUsingSystemService } from './water-using-system/water-using-system.service';
import { HeatEnergyComponent } from './water-using-system/heat-energy/heat-energy.component';
import { HeatEnergyService } from './water-using-system/heat-energy/heat-energy.service';
import { MotorEnergyService } from './water-using-system/motor-energy/motor-energy.service';
import { MotorEnergyComponent } from './water-using-system/motor-energy/motor-energy.component';
import { OperatingHoursModalModule } from '../shared/operating-hours-modal/operating-hours-modal.module';
import { CoolingTowerComponent } from './water-using-system/cooling-tower/cooling-tower.component';
import { ProcessUseComponent } from './water-using-system/process-use/process-use.component';
import { KitchenRestroomComponent } from './water-using-system/kitchen-restroom/kitchen-restroom.component';
import { BoilerWaterComponent } from './water-using-system/boiler-water/boiler-water.component';
import { LandscapingComponent } from './water-using-system/landscaping/landscaping.component';
import { PercentLoadEstimationModule } from '../calculator/motors/percent-load-estimation/percent-load-estimation.module';
import { StackLossModule } from '../calculator/steam/stack-loss/stack-loss.module';
import { WaterSystemDataModalComponent } from './water-using-system/water-system-data-modal/water-system-data-modal.component';

@NgModule({
  declarations: [
    WaterAssessmentComponent,
    WaterReportComponent,
    ResultsPanelComponent,
    SystemBasicsComponent,
    WaterBannerComponent,
    SetupTabsComponent,
    IntakeSourceComponent,
    WaterUsingSystemComponent,
    WaterComponentTableComponent,
    DischargeOutletComponent,
    HeatEnergyComponent,
    MotorEnergyComponent,
    CoolingTowerComponent,
    ProcessUseComponent,
    KitchenRestroomComponent,
    BoilerWaterComponent,
    LandscapingComponent,
    WaterSystemDataModalComponent,
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
    StackLossModule
  ],
  providers: [
    WaterAssessmentService,
    WaterProcessComponentService,
    WaterAssessmentResultsService,
    ConvertWaterAssessmentService,
    WaterAssessmentConnectionsService,
    WaterUsingSystemService,
    HeatEnergyService,
    MotorEnergyService,
  ]
})
export class WaterModule { }