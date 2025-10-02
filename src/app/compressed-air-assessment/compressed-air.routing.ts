import { Routes } from "@angular/router";
import { AssessessmentTabContentComponent } from "./assessessment-tab-content/assessessment-tab-content";
import { BaselineTabContentComponent } from "./baseline-tab-content/baseline-tab-content";
import { SystemBasicsComponent } from "./baseline-tab-content/system-basics/system-basics.component";



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
            }
        ]
    },
    {
        path: 'assessment',
        component: AssessessmentTabContentComponent
    }
]