import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsmtDiagramComponent } from './ssmt-diagram.component';

import { SharedModule } from '../../shared/shared.module';
import { BoilerDiagramComponent } from './boiler-diagram/boiler-diagram.component';
import { PrvDiagramComponent } from './prv-diagram/prv-diagram.component';
import { TurbineDiagramComponent } from './turbine-diagram/turbine-diagram.component';
import { FlashTankDiagramComponent } from './flash-tank-diagram/flash-tank-diagram.component';
import { HeaderDiagramComponent } from './header-diagram/header-diagram.component';

import { DeaeratorDiagramComponent } from './deaerator-diagram/deaerator-diagram.component';
import { TurbineConnectorComponent } from './turbine-connector/turbine-connector.component';
import { CondensateFlashTankComponent } from './condensate-flash-tank/condensate-flash-tank.component';
import { ReturnCondensateHeaderComponent } from './return-condensate-header/return-condensate-header.component';
import { MakeupWaterDiagramComponent } from './makeup-water-diagram/makeup-water-diagram.component';
import { BlowdownFlashTankComponent } from './blowdown-flash-tank/blowdown-flash-tank.component';
import { CondensateConnectorComponent } from './condensate-connector/condensate-connector.component';
import { OneHeaderConnectorComponent } from './one-header-connector/one-header-connector.component';

import { FeedwaterDiagramComponent } from './feedwater-diagram/feedwater-diagram.component';
import { ReturnCondensateConnectorComponent } from './return-condensate-connector/return-condensate-connector.component';
import { HoverTableModule } from './hover-table/hover-table.module';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HoverTableModule
  ],
  declarations: [
    SsmtDiagramComponent,
    BoilerDiagramComponent,
    PrvDiagramComponent,
    TurbineDiagramComponent,
    FlashTankDiagramComponent,
    HeaderDiagramComponent,
    DeaeratorDiagramComponent,
    TurbineConnectorComponent,
    CondensateFlashTankComponent,
    ReturnCondensateHeaderComponent,
    MakeupWaterDiagramComponent,
    BlowdownFlashTankComponent,
    CondensateConnectorComponent,
    OneHeaderConnectorComponent,
    FeedwaterDiagramComponent,
    ReturnCondensateConnectorComponent
  ],
  exports: [
    SsmtDiagramComponent
  ],
  providers:[
  ]
})
export class SsmtDiagramModule { }
