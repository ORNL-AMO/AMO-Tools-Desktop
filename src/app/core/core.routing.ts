import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { PhastComponent } from '../phast/phast.component';
import { PsatComponent } from '../psat/psat.component';
import { FsatComponent } from '../fsat/fsat.component';
import { SsmtComponent } from '../ssmt/ssmt.component';
import { TreasureHuntComponent } from '../treasure-hunt/treasure-hunt.component';
import { AssessmentDashboardComponent } from '../assessment/assessment-dashboard/assessment-dashboard.component';
import { LandingScreenComponent } from '../landing-screen/landing-screen.component';
import { TutorialsComponent } from '../tutorials/tutorials.component';
import { AboutPageComponent } from '../about-page/about-page.component';
import { ContactPageComponent } from '../contact-page/contact-page.component';
import { AcknowledgmentsPageComponent } from '../acknowledgments-page/acknowledgments-page.component';
import { AssessmentSettingsComponent } from '../assessment/assessment-settings/assessment-settings.component';
import { CustomMaterialsComponent } from '../suiteDb/custom-materials/custom-materials.component';
import { calculatorRoutes } from '../calculator/calculator-routing/calculators.routing';
import { CalculatorComponent } from '../calculator/calculator.component';
import { DirectoryDashboardComponent } from '../directory-dashboard/directory-dashboard.component';

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
        component: AssessmentDashboardComponent,
        path: 'assessment-dashboard'
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
  }
];
