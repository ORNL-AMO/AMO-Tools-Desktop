import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtraOptions, RouterModule, Routes, provideRouter, withDebugTracing, withRouterConfig } from '@angular/router';
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
};

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [RouterModule],
  providers: [provideRouter(appRoutes, withRouterConfig(routerOptions))]
})
export class AppRoutingModule { }

