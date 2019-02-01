import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsmtComponent } from './ssmt.component';
import { SsmtBannerComponent } from './ssmt-banner/ssmt-banner.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { SsmtTabsComponent } from './ssmt-tabs/ssmt-tabs.component';
import { SsmtService } from './ssmt.service';
import { BoilerComponent } from './boiler/boiler.component';
import { HeaderComponent } from './header/header.component';
import { TurbineComponent } from './turbine/turbine.component';
import { SettingsModule } from '../settings/settings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperationsModule } from './operations/operations.module';
import { ExploreOpportunitiesModule } from './explore-opportunities/explore-opportunities.module';
import { ModifyConditionsComponent } from './modify-conditions/modify-conditions.component';
import { ModifyConditionsTabsComponent } from './modify-conditions/modify-conditions-tabs/modify-conditions-tabs.component';
import { ModalModule } from 'ngx-bootstrap';
import { AddModificationComponent } from './add-modification/add-modification.component';
import { CompareService } from './compare.service';
import { ModificationListComponent } from './modification-list/modification-list.component';
import { BoilerService } from './boiler/boiler.service';
import { SuiteDbModule } from '../suiteDb/suiteDb.module';
import { HeaderService } from './header/header.service';
import { HeaderFormComponent } from './header/header-form/header-form.component';
import { TurbineService } from './turbine/turbine.service';
import { CondensingTurbineFormComponent } from './turbine/condensing-turbine-form/condensing-turbine-form.component';
import { PressureTurbineFormComponent } from './turbine/pressure-turbine-form/pressure-turbine-form.component';
import { SsmtSankeyComponent } from './ssmt-sankey/ssmt-sankey.component';
import { SharedModule } from '../shared/shared.module';
import { HelpPanelModule } from './help-panel/help-panel.module';
import { SsmtReportModule } from './ssmt-report/ssmt-report.module';
import { CalculateModelService } from './ssmt-calculations/calculate-model.service';
import { CalculateLossesService } from './ssmt-calculations/calculate-losses.service';
import { SsmtDiagramTabModule } from './ssmt-diagram-tab/ssmt-diagram-tab.module';
import { SteamPropertiesModule } from '../calculator/steam/steam-properties/steam-properties.module';
import { SaturatedPropertiesModule } from '../calculator/steam/saturated-properties/saturated-properties.module';
import { StackLossModule } from '../calculator/steam/stack-loss/stack-loss.module';
import { HeatLossModule } from '../calculator/steam/heat-loss/heat-loss.module';
import { BoilerModule } from '../calculator/steam/boiler/boiler.module';
import { FlashTankModule } from '../calculator/steam/flash-tank/flash-tank.module';
import { PrvModule } from '../calculator/steam/prv/prv.module';
import { TurbineModule } from '../calculator/steam/turbine/turbine.module';
import { HeaderModule } from '../calculator/steam/header/header.module';
import { DeaeratorModule } from '../calculator/steam/deaerator/deaerator.module';

@NgModule({
  imports: [
    CommonModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,
    OperationsModule,
    ExploreOpportunitiesModule,
    ModalModule,
    SuiteDbModule,
    SharedModule,
    HelpPanelModule,
    SsmtDiagramTabModule,
    SsmtReportModule,
    SteamPropertiesModule,
    SaturatedPropertiesModule,
    StackLossModule,
    HeatLossModule,
    BoilerModule,
    FlashTankModule,
    PrvModule,
    DeaeratorModule,
    HeaderModule,
    TurbineModule
  ],
  declarations: [
    SsmtComponent,
    SsmtBannerComponent,
    SystemBasicsComponent,
    SsmtTabsComponent,
    BoilerComponent,
    HeaderComponent,
    TurbineComponent,
   
    ModifyConditionsComponent,
    ModifyConditionsTabsComponent,
    AddModificationComponent,
    ModificationListComponent,
    HeaderFormComponent,
    CondensingTurbineFormComponent,
    PressureTurbineFormComponent,
    SsmtSankeyComponent
  ],
  providers: [
    SsmtService,
    CompareService,
    BoilerService,
    HeaderService,
    TurbineService,
    CalculateModelService,
    CalculateLossesService
  ]
})
export class SsmtModule { }
