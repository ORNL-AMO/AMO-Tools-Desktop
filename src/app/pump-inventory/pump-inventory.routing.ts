import { Routes } from "@angular/router";

export interface PumpInventoryRouteData {
    mainView?: string;
    setupView?: string;
    summaryView?: string;
}

export const setupTabs: string[] = ['plant-setup', 'department-setup', 'pump-catalog'];
export const summaryTabs: string[] = ['overview', 'graphs', 'table'];

export const pumpInventoryRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'setup'
    },
    {
        path: 'setup',
        data: { mainView: 'setup' },
        children: [
            { path: '', pathMatch: 'full', redirectTo: setupTabs[0] },
            ...setupTabs.map(tab => ({ path: tab, children: [], data: { setupView: tab } }))
        ]
    },
    {
        path: 'summary',
        data: { mainView: 'summary' },
        children: [
            { path: '', pathMatch: 'full', redirectTo: summaryTabs[0] },
            ...summaryTabs.map(tab => ({ path: tab, children: [], data: { summaryView: tab } }))
        ]
    },
    {
        path: '**',
        redirectTo: 'setup'
    }
];
