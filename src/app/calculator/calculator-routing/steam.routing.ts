import { Routes } from "@angular/router";
import { BoilerComponent } from "../steam/boiler/boiler.component";
import { BoilerBlowdownRateComponent } from "../steam/boiler-blowdown-rate/boiler-blowdown-rate.component";
import { DeaeratorComponent } from "../steam/deaerator/deaerator.component";
import { FlashTankComponent } from "../steam/flash-tank/flash-tank.component";
import { HeaderComponent } from "../steam/header/header.component";
import { HeatLossComponent } from "../steam/heat-loss/heat-loss.component";
import { PrvComponent } from "../steam/prv/prv.component";
import { SaturatedPropertiesComponent } from "../steam/saturated-properties/saturated-properties.component";
import { StackLossComponent } from "../steam/stack-loss/stack-loss.component";
import { SteamPropertiesComponent } from "../steam/steam-properties/steam-properties.component";
import { TurbineComponent } from "../steam/turbine/turbine.component";
import { SteamListComponent } from "../steam/steam-list/steam-list.component";

export const steamRoutes: Routes = [
    {
        path: '',
        component: SteamListComponent
    },
    {
        path: 'boiler',
        component: BoilerComponent
    },
    {
        path: 'boiler-blowdown-rate',
        component: BoilerBlowdownRateComponent
    },
    {
        path: 'deaerator',
        component: DeaeratorComponent   
    },
    {
        path: 'flash-tank',
        component: FlashTankComponent   
    },
    {
        path: 'header',
        component: HeaderComponent   
    },
    {
        path: 'heat-loss',
        component: HeatLossComponent   
    },
    {
        path: 'prv',
        component: PrvComponent   
    },
    {
        path: 'saturated-properties',
        component: SaturatedPropertiesComponent   
    },
    {
        path: 'stack-loss',
        component: StackLossComponent   
    },
    {
        path: 'steam-properties',
        component: SteamPropertiesComponent   
    },
    {
        path: 'turbine',
        component: TurbineComponent   
    }
]