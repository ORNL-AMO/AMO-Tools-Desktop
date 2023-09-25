import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterStateSnapshot } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AssessmentItemComponent } from './assessment-item/assessment-item.component';
import { CalculatorListComponent } from './calculator-list/calculator-list.component';
import { DirectoryItemComponent } from './directory-item/directory-item.component';
import { VersionModalComponent } from './version-modal/version-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DashboardPipeModule } from '../dashboard-pipe/dashboard-pipe.module';
import { InventoryItemComponent } from './inventory-item/inventory-item.component';
import { PreAssessmentItemComponent } from './pre-assessment-item/pre-assessment-item.component';

@NgModule({
  declarations: [
    SidebarComponent,
    AssessmentItemComponent,
    CalculatorListComponent,
    DirectoryItemComponent,
    VersionModalComponent,
    InventoryItemComponent,
    PreAssessmentItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ModalModule,
    DashboardPipeModule,
  ],
  exports: [
    SidebarComponent
  ]
})
export class SidebarModule { }
