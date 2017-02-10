import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { CoreComponent } from './core/core.component';
import { DemoComponent } from './demo/demo.component';
import { ContactFormComponent } from './contact-form/contact-form.component';

const appRoutes: Routes = [
  {
    path: '',
    component: CoreComponent,
    children: [
      {
        path: '',
        component: DemoComponent
      },{
        path:'demo',
        component: DemoComponent
      },{
        path: 'contact-form',
        component: ContactFormComponent
      }
    ]
  }
]

export const appRoutingProviders: any[] = [
]

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
