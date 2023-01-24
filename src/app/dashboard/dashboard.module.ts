import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { CreateFolderComponent } from './create-folder/create-folder.component';
import { AssessmentCreateComponent } from './assessment-create/assessment-create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from './dashboard.service';
import { SidebarModule } from './sidebar/sidebar.module';
import { LandingScreenComponent } from './landing-screen/landing-screen.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { RouterModule } from '@angular/router';
import { MeasurComponent } from './landing-screen/measur/measur.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { AcknowledgmentsPageComponent } from './acknowledgments-page/acknowledgments-page.component';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { ImportExportModule } from './import-export/import-export.module';
import { DirectoryDashboardModule } from './directory-dashboard/directory-dashboard.module';
import { ToastModule } from '../shared/toast/toast.module';
import { DragBarComponent } from './drag-bar/drag-bar.component';
import { CreateInventoryComponent } from './create-inventory/create-inventory.component';
import { InventoryService } from './inventory.service';
import { MoveItemsComponent } from './move-items/move-items.component';
import { CopyItemsComponent } from './copy-items/copy-items.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';

@NgModule({
  declarations: [
    DashboardComponent,
    CreateFolderComponent,
    AssessmentCreateComponent,
    LandingScreenComponent,
    MeasurComponent,
    AboutPageComponent,
    AcknowledgmentsPageComponent,
    ContactPageComponent,
    DragBarComponent,
    CreateInventoryComponent,
    MoveItemsComponent,
    CopyItemsComponent,
    DisclaimerComponent,
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
    DashboardService,
    InventoryService
  ]
})
export class DashboardModule { }
