import { Routes } from "@angular/router";
import { compressedAirRoutes } from "./compressed-air.routing";
import { fanRoutes } from "./fan.routing";
import { processHeatingRoutes } from "./process-heating.routing";
import { lightingRoutes } from "./lighting.routing";
import { motorRoutes } from "./motors.routing";
import { pumpRoutes } from "./pumps.routing";
import { steamRoutes } from "./steam.routing";
import { generalRoutes } from "./general.routing";
import { CalculatorsListComponent } from "../calculators-list/calculators-list.component";
import { CompressedAirListComponent } from "../compressed-air/compressed-air-list/compressed-air-list.component";
import { SteamListComponent } from "../steam/steam-list/steam-list.component";
import { UtilitiesListComponent } from "../utilities/utilities-list/utilities-list.component";
import { FansListComponent } from "../fans/fans-list/fans-list.component";
import { FurnacesListComponent } from "../furnaces/furnaces-list/furnaces-list.component";
import { LightingListComponent } from "../lighting/lighting-list/lighting-list.component";
import { MotorsListComponent } from "../motors/motors-list/motors-list.component";
import { PumpsListComponent } from "../pumps/pumps-list/pumps-list.component";



export const calculatorListRoutes: Routes = [
    {
        path: '',
        component: CalculatorsListComponent
    },
    {
        path: 'compressed-air-list',
        component: CompressedAirListComponent
    },
    // {
    //     path: 'compressed-air',
    //     component: CompressedAirComponent,
    //     children: compressedAirRoutes
    // },
    {
        path: 'fans-list',
        component: FansListComponent
    },
    // {
    //     path: 'fans',
    //     component: FansComponent,
    //     children: fanRoutes
    // },
    {
        path: 'process-heating-list',
        component: FurnacesListComponent
    },
    // {
    //     path: 'process-heating',
    //     component: FurnacesComponent,
    //     children: processHeatingRoutes
    // },
    {
        path: 'lighting-list',
        component: LightingListComponent
    },
    // {
    //     path: 'lighting',
    //     component: LightingComponent,
    //     children: lightingRoutes
    // },
    {
        path: 'motors-list',
        component: MotorsListComponent
    },
    // {
    //     path: 'motors',
    //     component: MotorsComponent,
    //     children: motorRoutes
    // },
    {
        path: 'pumps-list',
        component: PumpsListComponent
    },
    // {
    //     path: 'pumps',
    //     component: PumpsComponent,
    //     children: pumpRoutes
    // },
    {
        path: 'steam-list',
        component: SteamListComponent
    },
    // {
    //     path: 'steam',
    //     component: SteamComponent,
    //     children: steamRoutes
    // },
    {
        path: 'general-list',
        component: UtilitiesListComponent
    },
    // {
    //     path: 'general',
    //     component: UtilitiesComponent,
    //     children: generalRoutes
    // },
]


export const calculatorRoutes: Routes = calculatorListRoutes.concat(compressedAirRoutes, fanRoutes, processHeatingRoutes, lightingRoutes, motorRoutes, pumpRoutes, steamRoutes, generalRoutes);