import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { PhastComponent } from '../phast/phast.component';
import { PsatComponent } from '../psat/psat.component';
import { FsatComponent } from '../fsat/fsat.component';
import { SsmtComponent } from '../ssmt/ssmt.component';
import { TreasureHuntComponent } from '../treasure-hunt/treasure-hunt.component';
import { LandingScreenComponent } from '../dashboard/landing-screen/landing-screen.component';
import { TutorialsComponent } from '../tutorials/tutorials.component';
import { AboutPageComponent } from '../dashboard/about-page/about-page.component';
import { ContactPageComponent } from '../dashboard/contact-page/contact-page.component';
import { AcknowledgmentsPageComponent } from '../dashboard/acknowledgments-page/acknowledgments-page.component';
import { AssessmentSettingsComponent } from '../settings/assessment-settings/assessment-settings.component';
import { CustomMaterialsComponent } from '../suiteDb/custom-materials/custom-materials.component';
import { calculatorRoutes } from '../calculator/calculator-routing/calculators.routing';
import { CalculatorComponent } from '../calculator/calculator.component';
import { DirectoryDashboardComponent } from '../dashboard/directory-dashboard/directory-dashboard.component';
import { ReportRollupComponent } from '../report-rollup/report-rollup.component';
import { LogToolComponent } from '../log-tool/log-tool.component';
import { ToolsComponent } from '../dashboard/tools/tools.component';
import { logToolRoutes } from '../log-tool/log-tool.routings';

export const coreRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'landing-screen'
      },
      {
        path: 'landing-screen',
        component: LandingScreenComponent
      },
      {
        component: DirectoryDashboardComponent,
        path: 'directory-dashboard/:id',
      },
      {
        component: TutorialsComponent,
        path: 'tutorials'
      },
      {
        component: AboutPageComponent,
        path: 'about'
      },
      {
        component: ContactPageComponent,
        path: 'contact'
      },
      {
        component: AcknowledgmentsPageComponent,
        path: 'acknowledgments'
      },
      {
        component: AssessmentSettingsComponent,
        path: 'settings'
      },
      {
        component: CustomMaterialsComponent,
        path: 'custom-materials'
      },
      {
        component: CalculatorComponent,
        path: 'calculators',
        children: calculatorRoutes
      },
      {
        component: ToolsComponent,
        path: 'tools'
      }
    ]
  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    redirectTo: ''
  },
  {
    path: 'phast/:id',
    component: PhastComponent
  },
  {
    path: 'psat/:id',
    component: PsatComponent
  },
  {
    path: 'fsat/:id',
    component: FsatComponent
  },
  {
    path: 'ssmt/:id',
    component: SsmtComponent
  },
  {
    path: 'treasure-hunt/:id',
    component: TreasureHuntComponent
  },
  {
    path: 'report-rollup',
    component: ReportRollupComponent
  },
  {
    path: 'log-tool',
    component: LogToolComponent,
    children: logToolRoutes
  }
];
