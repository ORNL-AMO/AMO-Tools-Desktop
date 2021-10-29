import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteamPropertiesModule } from './steam-properties/steam-properties.module';
import { SteamService } from "./steam.service";
import { SaturatedPropertiesModule } from "./saturated-properties/saturated-properties.module";
import { StackLossModule } from './stack-loss/stack-loss.module';
import { HeatLossModule } from './heat-loss/heat-loss.module';
import { BoilerModule } from './boiler/boiler.module';
import { FlashTankModule } from './flash-tank/flash-tank.module';
import { PrvModule } from './prv/prv.module';
import { DeaeratorModule } from './deaerator/deaerator.module';
import { HeaderModule } from './header/header.module';
import { TurbineModule } from './turbine/turbine.module';
import { ConvertSteamService } from './convert-steam.service';
import { BoilerBlowdownRateModule } from './boiler-blowdown-rate/boiler-blowdown-rate.module';
import { SteamListComponent } from './steam-list/steam-list.component';
import { RouterModule } from '@angular/router';
import { SteamReductionModule } from './steam-reduction/steam-reduction.module';
import { PipeInsulationReductionModule } from './pipe-insulation-reduction/pipe-insulation-reduction.module';
import { TankInsulationReductionModule } from './tank-insulation-reduction/tank-insulation-reduction.module';
import { SaturatedPropertiesConversionService } from './saturated-properties-conversion.service';
import { SaturatedPropertiesService } from './saturated-properties.service';
import { WaterHeatingModule } from './water-heating/water-heating.module';
import { CondensingEconomizerModule } from './condensing-economizer/condensing-economizer.module';


@NgModule({
  imports: [
    CommonModule,
    SteamPropertiesModule,
    SaturatedPropertiesModule,
    StackLossModule,
    HeatLossModule,
    BoilerModule,
    FlashTankModule,
    PrvModule,
    DeaeratorModule,
    HeaderModule,
    TurbineModule,
    BoilerBlowdownRateModule,
    SteamReductionModule,
    WaterHeatingModule,
    RouterModule,
    PipeInsulationReductionModule,
    TankInsulationReductionModule,
    CondensingEconomizerModule
  ],
  declarations: [
    SteamListComponent,
  ],
  exports: [
    SteamListComponent
  ],
  providers: [
    SteamService,
    ConvertSteamService,
    SaturatedPropertiesConversionService,
    SaturatedPropertiesService
  ]
})
export class SteamModule { }
