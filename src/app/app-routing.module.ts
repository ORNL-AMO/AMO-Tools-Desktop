import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { CoreComponent } from './core/core.component';
import { coreRoutes } from './core/core.routing';


const appRoutes: Routes = [
  {
    path: '',
    component: CoreComponent,
    children: coreRoutes
  },
];

const routerOptions: ExtraOptions = {
  anchorScrolling: 'enabled',
  onSameUrlNavigation: 'reload',
  scrollPositionRestoration: 'enabled',
  enableTracing: true,
  useHash: true
  // paramsInheritanceStrategy: 'always'
};

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes, routerOptions)
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }

