import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsmtDiagramComponent } from './ssmt-diagram.component';
import { HeaderTableComponent } from './header-table/header-table.component';
import { FlashTankTableComponent } from './flash-tank-table/flash-tank-table.component';
import { DeaeratorTableComponent } from './deaerator-table/deaerator-table.component';
import { BoilerTableComponent } from './boiler-table/boiler-table.component';
import { HeatLossTableComponent } from './heat-loss-table/heat-loss-table.component';
import { PrvTableComponent } from './prv-table/prv-table.component';
import { SteamPropertiesTableComponent } from './steam-properties-table/steam-properties-table.component';
import { TurbineTableComponent } from './turbine-table/turbine-table.component';
import { SharedModule } from '../../shared/shared.module';
import { BoilerDiagramComponent } from './boiler-diagram/boiler-diagram.component';
import { PrvDiagramComponent } from './prv-diagram/prv-diagram.component';
import { TurbineDiagramComponent } from './turbine-diagram/turbine-diagram.component';
import { FlashTankDiagramComponent } from './flash-tank-diagram/flash-tank-diagram.component';
import { HeaderDiagramComponent } from './header-diagram/header-diagram.component';
import { DiagramHelpComponent } from './diagram-help/diagram-help.component';
import { CostTableComponent } from './cost-table/cost-table.component';
import { DeaeratorDiagramComponent } from './deaerator-diagram/deaerator-diagram.component';
import { TurbineConnectorComponent } from './turbine-connector/turbine-connector.component';
import { CondensateFlashTankComponent } from './condensate-flash-tank/condensate-flash-tank.component';
import { ReturnCondensateHeaderComponent } from './return-condensate-header/return-condensate-header.component';
import { MakeupWaterDiagramComponent } from './makeup-water-diagram/makeup-water-diagram.component';
import { BlowdownFlashTankComponent } from './blowdown-flash-tank/blowdown-flash-tank.component';
import { CondensateConnectorComponent } from './condensate-connector/condensate-connector.component';
import { OneHeaderConnectorComponent } from './one-header-connector/one-header-connector.component';
import { HoverTableComponent } from './hover-table/hover-table.component';
import { HoverBoilerTableComponent } from './hover-table/hover-boiler-table/hover-boiler-table.component';
import { CalculateModelService } from '../ssmt-calculations/calculate-model.service';
import { HoverTurbineTableComponent } from './hover-table/hover-turbine-table/hover-turbine-table.component';
import { HoverBoilerSteamTableComponent } from './hover-table/hover-boiler-steam-table/hover-boiler-steam-table.component';
import { HoverHeaderTableComponent } from './hover-table/hover-header-table/hover-header-table.component';
import { FeedwaterDiagramComponent } from './feedwater-diagram/feedwater-diagram.component';
import { HoverFlashTankTableComponent } from './hover-table/hover-flash-tank-table/hover-flash-tank-table.component';
import { HoverPrvTableComponent } from './hover-table/hover-prv-table/hover-prv-table.component';
import { HoverCondensateTableComponent } from './hover-table/hover-condensate-table/hover-condensate-table.component';
import { HoverMakeupWaterComponent } from './hover-table/hover-makeup-water/hover-makeup-water.component';
import { HoverBlowdownTableComponent } from './hover-table/hover-blowdown-table/hover-blowdown-table.component';
import { HoverProcessUsageComponent } from './hover-table/hover-process-usage/hover-process-usage.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HoverDeaeratorTableComponent } from './hover-table/hover-deaerator-table/hover-deaerator-table.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    SsmtDiagramComponent,
    BoilerTableComponent,
    DeaeratorTableComponent,
    FlashTankTableComponent,
    HeaderTableComponent,
    HeatLossTableComponent,
    PrvTableComponent,
    SteamPropertiesTableComponent,
    TurbineTableComponent,
    BoilerDiagramComponent,
    PrvDiagramComponent,
    TurbineDiagramComponent,
    FlashTankDiagramComponent,
    HeaderDiagramComponent,
    DiagramHelpComponent,
    CostTableComponent,
    DeaeratorDiagramComponent,
    TurbineConnectorComponent,
    CondensateFlashTankComponent,
    ReturnCondensateHeaderComponent,
    MakeupWaterDiagramComponent,
    BlowdownFlashTankComponent,
    CondensateConnectorComponent,
    OneHeaderConnectorComponent,
    HoverTableComponent,
    HoverBoilerTableComponent,
    HoverTurbineTableComponent,
    HoverBoilerSteamTableComponent,
    HoverHeaderTableComponent,
    FeedwaterDiagramComponent,
    HoverFlashTankTableComponent,
    HoverPrvTableComponent,
    HoverCondensateTableComponent,
    HoverMakeupWaterComponent,
    HoverBlowdownTableComponent,
    HoverProcessUsageComponent,
    HoverDeaeratorTableComponent
  ],
  exports: [
    SsmtDiagramComponent
  ],
  providers:[
    CalculateModelService
  ]
})
export class SsmtDiagramModule { }
