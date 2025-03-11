import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FsatComponent } from './fsat.component';
import { FsatService } from './fsat.service';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsModule } from '../settings/settings.module';
import { FsatBannerComponent } from './fsat-banner/fsat-banner.component';
import { FsatTabsComponent } from './fsat-tabs/fsat-tabs.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FsatFluidComponent } from './fsat-fluid/fsat-fluid.component';
import { FsatFluidService } from './fsat-fluid/fsat-fluid.service';
import { FanSetupComponent } from './fan-setup/fan-setup.component';
import { FanSetupService } from './fan-setup/fan-setup.service';
import { FanMotorComponent } from './fan-motor/fan-motor.component';
import { FanMotorService } from './fan-motor/fan-motor.service';
import { PsatService } from '../psat/psat.service';
import { FanFieldDataComponent } from './fan-field-data/fan-field-data.component';
import { FanFieldDataService } from './fan-field-data/fan-field-data.service';
import { ExploreOpportunitiesModule } from './explore-opportunities/explore-opportunities.module';
import { ModifyConditionsTabsComponent } from './modify-conditions/modify-conditions-tabs/modify-conditions-tabs.component';
import { ModifyConditionsComponent } from './modify-conditions/modify-conditions.component';
import { ModifyConditionsService } from './modify-conditions/modify-conditions.service';
import { AddModificationComponent } from './add-modification/add-modification.component';
import { CompareService } from './compare.service';
import { ModificationListComponent } from './modification-list/modification-list.component';
import { ModifyFieldDataFormComponent } from './modify-conditions/modify-field-data-form/modify-field-data-form.component';
import { FsatResultsModule } from './fsat-results/fsat-results.module';
import { FsatReportModule } from './fsat-report/fsat-report.module';
import { HelpPanelModule } from './help-panel/help-panel.module';
import { ConvertFsatService } from './convert-fsat.service';
import { MotorPerformanceModule } from '../calculator/motors/motor-performance/motor-performance.module';
import { NemaEnergyEfficiencyModule } from '../calculator/motors/nema-energy-efficiency/nema-energy-efficiency.module';
import { FanEfficiencyModule } from '../calculator/fans/fan-efficiency/fan-efficiency.module';
import { FsatDiagramComponent } from './fsat-diagram/fsat-diagram.component';
import { FsatWarningService } from './fsat-warning.service';
import { CalculatePressuresModule } from './calculate-pressures/calculate-pressures.module';
import { OperatingHoursModalModule } from '../shared/operating-hours-modal/operating-hours-modal.module';
import { TabsTooltipModule } from '../shared/tabs-tooltip/tabs-tooltip.module';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { SystemAndEquipmentCurveModule } from '../calculator/system-and-equipment-curve/system-and-equipment-curve.module';
import { FsatSankeyModule } from '../shared/fsat-sankey/fsat-sankey.module';
import { UpdateUnitsModalModule } from '../shared/update-units-modal/update-units-modal.module';
import { OperationsComponent } from './operations/operations.component';
import { OperationsService } from './operations/operations.service';
import { AssessmentCo2SavingsModule } from '../shared/assessment-co2-savings/assessment-co2-savings.module';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { ImportExportModule } from '../shared/import-export/import-export.module';
import { SnackbarModule } from '../shared/snackbar-notification/snackbar.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsModule,
    SettingsModule,
    ModalModule,
    ExploreOpportunitiesModule,
    FsatResultsModule,
    FsatReportModule,
    HelpPanelModule,
    FsatSankeyModule,
    NemaEnergyEfficiencyModule,
    MotorPerformanceModule,
    FanEfficiencyModule,
    CalculatePressuresModule,
    OperatingHoursModalModule,
    TabsTooltipModule,
    SnackbarModule,
    SharedPipesModule,
    SystemAndEquipmentCurveModule,
    UpdateUnitsModalModule,
    AssessmentCo2SavingsModule,    
    ImportExportModule
  ],
  declarations: [
    FsatComponent,
    FsatBannerComponent,
    FsatTabsComponent,
    SystemBasicsComponent,
    FsatFluidComponent,
    FanSetupComponent,
    FanMotorComponent,
    FanFieldDataComponent,
    ModifyConditionsComponent,
    ModifyConditionsTabsComponent,
    AddModificationComponent,
    ModificationListComponent,
    ModifyFieldDataFormComponent,
    FsatDiagramComponent,
    OperationsComponent,
    WelcomeScreenComponent
  ],
  providers: [
    FsatService,
    FsatFluidService,
    FanSetupService,
    FanMotorService,
    PsatService,
    FanFieldDataService,
    ModifyConditionsService,
    CompareService,
    ConvertFsatService,
    FsatWarningService,
    OperationsService
  ]
})
export class FsatModule { }
