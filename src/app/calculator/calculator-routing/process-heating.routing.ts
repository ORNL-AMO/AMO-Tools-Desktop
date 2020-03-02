import { Routes } from "@angular/router";
import { EfficiencyImprovementComponent } from "../furnaces/efficiency-improvement/efficiency-improvement.component";
import { EnergyEquivalencyComponent } from "../furnaces/energy-equivalency/energy-equivalency.component";
import { EnergyUseComponent } from "../furnaces/energy-use/energy-use.component";
import { O2EnrichmentComponent } from "../furnaces/o2-enrichment/o2-enrichment.component";
import { FurnacesListComponent } from "../furnaces/furnaces-list/furnaces-list.component";

export const processHeatingRoutes: Routes = [
    {
        path: '',
        component: FurnacesListComponent
    },
    {
        path: 'efficiency-improvement',
        component: EfficiencyImprovementComponent
    },
    {
        path: 'energy-equivalency',
        component: EnergyEquivalencyComponent
    },
    {
        path: 'energy-use',
        component: EnergyUseComponent
    },
    {
        path: 'o2-enrichment',
        component: O2EnrichmentComponent
    }
]