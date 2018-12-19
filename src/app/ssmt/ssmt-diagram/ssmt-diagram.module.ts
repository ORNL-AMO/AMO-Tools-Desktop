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
    HeaderDiagramComponent
  ],
  exports: [
    SsmtDiagramComponent
  ]
})
export class SsmtDiagramModule { }
