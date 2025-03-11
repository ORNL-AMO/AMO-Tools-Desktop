import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterStateSnapshot } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AssessmentItemComponent } from './assessment-item/assessment-item.component';
import { CalculatorListComponent } from './calculator-list/calculator-list.component';
import { DirectoryItemComponent } from './directory-item/directory-item.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DashboardPipeModule } from '../dashboard-pipe/dashboard-pipe.module';
import { InventoryItemComponent } from './inventory-item/inventory-item.component';
import { PreAssessmentItemComponent } from './pre-assessment-item/pre-assessment-item.component';
import { DiagramItemComponent } from './diagram-item/diagram-item.component';
import { UpdateApplicationModule } from '../../shared/update-application/update-application.module';

@NgModule({
  declarations: [
    SidebarComponent,
    AssessmentItemComponent,
    CalculatorListComponent,
    DirectoryItemComponent,
    InventoryItemComponent,
    PreAssessmentItemComponent,
    DiagramItemComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ModalModule,
    DashboardPipeModule,
    UpdateApplicationModule
  ],
  exports: [
    SidebarComponent
  ]
})
export class SidebarModule { }
