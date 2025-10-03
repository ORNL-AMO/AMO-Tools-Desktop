import { Routes } from "@angular/router";
import { BaselineTabContentComponent } from "./baseline-tab-content/baseline-tab-content";
import { SystemBasicsComponent } from "./baseline-tab-content/system-basics/system-basics.component";
import { SystemInformationComponent } from "./baseline-tab-content/system-information/system-information.component";
import { InventorySetupComponent } from "./baseline-tab-content/inventory-setup/inventory-setup.component";
import { DayTypesSetupComponent } from "./baseline-tab-content/day-types-setup/day-types-setup.component";
import { BaselineSystemProfileSetupComponent } from "./baseline-tab-content/baseline-system-profile-setup/baseline-system-profile-setup.component";
import { SystemProfileSetupComponent } from "./baseline-tab-content/baseline-system-profile-setup/system-profile-setup/system-profile-setup.component";
import { SystemProfileSummaryComponent } from "./baseline-tab-content/baseline-system-profile-setup/system-profile-summary/system-profile-summary.component";
import { SystemProfileGraphsComponent } from "./system-profile-graphs/system-profile-graphs.component";
import { SystemProfileAnnualSummaryComponent } from "./baseline-tab-content/baseline-system-profile-setup/system-profile-annual-summary/system-profile-annual-summary.component";
import { CompressorSummaryComponent } from "./baseline-tab-content/baseline-system-profile-setup/compressor-summary/compressor-summary.component";
import { EndUsesSetupComponent } from "./baseline-tab-content/end-uses-setup/end-uses-setup.component";
import { AssessmentTabContentComponent } from "./assessment-tab-content/assessment-tab-content.component";
import { ExploreOpportunitiesComponent } from "./assessment-tab-content/explore-opportunities/explore-opportunities.component";


export const compressedAirAssessmentRoutes: Routes = [
    {
        path: '',
        redirectTo: 'baseline',
        pathMatch: 'full'
    },
    {
        path: 'baseline',
        component: BaselineTabContentComponent,
        children: [
            {
                path: '',
                redirectTo: 'system-basics',
                pathMatch: 'full'
            },
            {
                path: 'system-basics',
                component: SystemBasicsComponent
            },
            {
                path: 'system-information',
                component: SystemInformationComponent
            },
            {
                path: 'inventory-setup',
                component: InventorySetupComponent
            },
            {
                path: 'day-types-setup',
                component: DayTypesSetupComponent
            },
            {
                path: 'system-profile-setup',
                component: BaselineSystemProfileSetupComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'setup-profile',
                        pathMatch: 'full'
                    },
                    {
                        path: 'setup-profile',
                        component: SystemProfileSetupComponent
                    },
                    {
                        path: 'profile-summary',
                        component: SystemProfileSummaryComponent
                    },
                    {
                        path: 'profile-graphs',
                        component: SystemProfileGraphsComponent
                    },
                    {
                        path: 'annual-summary',
                        component: SystemProfileAnnualSummaryComponent
                    },
                    {
                        path: 'compressor-summary',
                        component: CompressorSummaryComponent
                    }
                ]
            },
            {
                path: 'end-uses',
                component: EndUsesSetupComponent
            }
        ]
    },
    {
        path: 'assessment',
        component: AssessmentTabContentComponent,
        children: [
            {
                path: '',
                redirectTo: 'explore-opportunities',
                pathMatch: 'full'
            },
            {
                path: 'explore-opportunities',
                component: ExploreOpportunitiesComponent
            },
            {
                path: 'explore-opportunities/:id',
                component: ExploreOpportunitiesComponent
            },
        ]
    }
]