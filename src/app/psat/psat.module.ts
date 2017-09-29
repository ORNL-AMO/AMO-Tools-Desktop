import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ChartsModule } from 'ng2-charts';
import { ModalModule } from 'ngx-bootstrap';
import { IndexedDbModule } from '../indexedDb/indexedDb.module';
import { JsonToCsvModule } from '../shared/json-to-csv/json-to-csv.module';
import { HelpPanelModule } from './help-panel/help-panel.module';

import { SystemCurveModule } from '../calculator/pumps/system-curve/system-curve.module';
import { HeadToolModule } from '../calculator/pumps//head-tool/head-tool.module';
import { NemaEnergyEfficiencyModule } from '../calculator/motors/nema-energy-efficiency/nema-energy-efficiency.module';
import { MotorPerformanceModule } from '../calculator/motors/motor-performance/motor-performance.module';
import { AchievableEfficiencyModule } from '../calculator/pumps/achievable-efficiency/achievable-efficiency.module';
import { SpecificSpeedModule } from '../calculator/pumps/specific-speed/specific-speed.module';
import { PumpCurveModule } from '../calculator/pumps/pump-curve/pump-curve.module';



import { PsatComponent } from './psat.component';
import { PsatBannerComponent } from './psat-banner/psat-banner.component';
import { PsatTabsComponent } from './psat-tabs/psat-tabs.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { PumpFluidComponent } from './pump-fluid/pump-fluid.component';
import { MotorComponent } from './motor/motor.component';
import { FieldDataComponent } from './field-data/field-data.component';
import { ModifyConditionsComponent } from './modify-conditions/modify-conditions.component';
import { SettingsPanelComponent } from './settings-panel/settings-panel.component';

import { PsatReportComponent } from './psat-report/psat-report.component';
import { InputSummaryComponent } from './psat-report/input-summary/input-summary.component';
import { OutputSummaryComponent } from './psat-report/output-summary/output-summary.component';

import { PsatService } from './psat.service';
import { ModifyConditionsTabsComponent } from './modify-conditions/modify-conditions-tabs/modify-conditions-tabs.component';
import { ModifyConditionsNotesComponent } from './modify-conditions/modify-conditions-notes/modify-conditions-notes.component';
import { SettingsModule } from '../settings/settings.module';
import { ToastyModule } from 'ng2-toasty';
import { EditConditionPropertiesComponent } from './modify-conditions/edit-condition-properties/edit-condition-properties.component';
import { ExploreOpportunitiesComponent } from './explore-opportunities/explore-opportunities.component';
import { CompareService } from './compare.service';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities/explore-opportunities-form/explore-opportunities-form.component';
import { ExploreOpportunitiesResultsComponent } from './explore-opportunities/explore-opportunities-results/explore-opportunities-results.component';
import { ExploreOpportunitiesHelpComponent } from './explore-opportunities/explore-opportunities-help/explore-opportunities-help.component';

import { ExploreOpportunitiesSankeyComponent } from './explore-opportunities/explore-opportunities-sankey/explore-opportunities-sankey.component';
import { PsatDiagramComponent } from './psat-diagram/psat-diagram.component';

@NgModule({
  declarations: [
    PsatComponent,
    PsatBannerComponent,
    PsatTabsComponent,
    SystemBasicsComponent,
    PumpFluidComponent,
    MotorComponent,
    FieldDataComponent,
    ModifyConditionsComponent,
    SettingsPanelComponent,
    PsatReportComponent,
    InputSummaryComponent,
    OutputSummaryComponent,
    ModifyConditionsTabsComponent,
    ModifyConditionsNotesComponent,
    EditConditionPropertiesComponent,
    ExploreOpportunitiesComponent,
    ExploreOpportunitiesFormComponent,
    ExploreOpportunitiesResultsComponent,
    ExploreOpportunitiesHelpComponent,
    ExploreOpportunitiesSankeyComponent,
    PsatDiagramComponent
  ],
  exports: [
    PsatReportComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ChartsModule,
    ModalModule.forRoot(),
    IndexedDbModule,
    SettingsModule,
    ToastyModule,
    JsonToCsvModule,
    HelpPanelModule,
    SystemCurveModule,
    SpecificSpeedModule,
    NemaEnergyEfficiencyModule,
    MotorPerformanceModule,
    HeadToolModule,
    AchievableEfficiencyModule, 
    PumpCurveModule
  ],
  providers: [
    PsatService,
    CompareService
  ]
})

export class PsatModule { }
