import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { CreateFolderComponent } from './create-folder/create-folder.component';
import { AssessmentCreateComponent } from './assessment-create/assessment-create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from './dashboard.service';
import { SidebarModule } from './sidebar/sidebar.module';
import { LandingScreenComponent } from './landing-screen/landing-screen.component';
import { ModalModule } from 'ngx-bootstrap';
import { RouterModule } from '@angular/router';
import { MeasurComponent } from './landing-screen/measur/measur.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { AcknowledgmentsPageComponent } from './acknowledgments-page/acknowledgments-page.component';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { ImportExportModule } from './import-export/import-export.module';
import { DirectoryDashboardModule } from './directory-dashboard/directory-dashboard.module';
import { ToastModule } from '../shared/toast/toast.module';
import { DirectoryDashboardPipe } from './dashboard-pipe/directory-dashboard.pipe';

@NgModule({
  declarations: [
    DashboardComponent,
    CreateFolderComponent,
    AssessmentCreateComponent,
    LandingScreenComponent,
    MeasurComponent,
    AboutPageComponent,
    AcknowledgmentsPageComponent,
    ContactPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarModule,
    ModalModule,
    RouterModule,
    ImportExportModule,
    DirectoryDashboardModule,
    ToastModule
  ],
  providers: [
    DashboardService
  ]
})
export class DashboardModule { }
