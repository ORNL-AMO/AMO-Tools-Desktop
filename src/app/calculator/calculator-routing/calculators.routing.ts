import { Routes } from "@angular/router";
import { CompressedAirComponent } from "../compressed-air/compressed-air.component";
import { compressedAirRoutes } from "./compressed-air.routing";
import { FansComponent } from "../fans/fans.component";
import { fanRoutes } from "./fan.routing";
import { FurnacesComponent } from "../furnaces/furnaces.component";
import { processHeatingRoutes } from "./process-heating.routing";
import { LightingComponent } from "../lighting/lighting.component";
import { lightingRoutes } from "./lighting.routing";
import { MotorsComponent } from "../motors/motors.component";
import { motorRoutes } from "./motors.routing";
import { PumpsComponent } from "../pumps/pumps.component";
import { pumpRoutes } from "./pumps.routing";
import { SteamComponent } from "../steam/steam.component";
import { steamRoutes } from "./steam.routing";
import { UtilitiesComponent } from "../utilities/utilities.component";
import { generalRoutes } from "./general.routing";
import { CalculatorsListComponent } from "../calculators-list/calculators-list.component";

export const calculatorRoutes: Routes = [
    {
        path: '',
        component: CalculatorsListComponent
    },
    {
        path: 'compressed-air',
        component: CompressedAirComponent,
        children: compressedAirRoutes
    },
    {
        path: 'fans',
        component: FansComponent,
        children: fanRoutes
    },
    {
        path: 'process-heating',
        component: FurnacesComponent,
        children: processHeatingRoutes
    },
    {
        path: 'lighting',
        component: LightingComponent,
        children: lightingRoutes
    },
    {
        path: 'motors',
        component: MotorsComponent,
        children: motorRoutes
    },
    {
        path: 'pumps',
        component: PumpsComponent,
        children: pumpRoutes
    },
    {
        path: 'steam',
        component: SteamComponent,
        children: steamRoutes
    },
    {
        path: 'general',
        component: UtilitiesComponent,
        children: generalRoutes
    }
]