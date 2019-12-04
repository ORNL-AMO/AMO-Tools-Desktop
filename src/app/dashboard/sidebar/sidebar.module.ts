import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AssessmentItemComponent } from './assessment-item/assessment-item.component';
import { CalculatorListComponent } from './calculator-list/calculator-list.component';
import { DirectoryItemComponent } from './directory-item/directory-item.component';
import { VersionModalComponent } from './version-modal/version-modal.component';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [
    SidebarComponent,
    AssessmentItemComponent,
    CalculatorListComponent,
    DirectoryItemComponent,
    VersionModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ModalModule
  ],
  exports: [
    SidebarComponent
  ]
})
export class SidebarModule { }
