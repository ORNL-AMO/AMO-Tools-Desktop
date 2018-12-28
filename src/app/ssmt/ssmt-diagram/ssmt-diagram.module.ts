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

@NgModule({
  imports: [
    CommonModule,
    SharedModule
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
    OneHeaderConnectorComponent
  ],
  exports: [
    SsmtDiagramComponent
  ]
})
export class SsmtDiagramModule { }
