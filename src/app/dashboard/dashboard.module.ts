import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { CreateFolderComponent } from './create-folder/create-folder.component';
import { AssessmentCreateComponent } from './assessment-create/assessment-create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from './dashboard.service';
import { SidebarModule } from '../sidebar/sidebar.module';
import { LandingScreenComponent } from '../landing-screen/landing-screen.component';
import { ModalModule } from 'ngx-bootstrap';
import { RouterModule } from '@angular/router';
import { MeasurComponent } from '../landing-screen/measur/measur.component';

@NgModule({
  declarations: [
    DashboardComponent,
    CreateFolderComponent,
    AssessmentCreateComponent,
    LandingScreenComponent,
    MeasurComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarModule,
    ModalModule,
    RouterModule
  ],
  providers: [
    DashboardService
  ]
})
export class DashboardModule { }
