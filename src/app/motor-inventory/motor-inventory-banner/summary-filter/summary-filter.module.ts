import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryFilterComponent } from './summary-filter.component';
import { DepartmentDropdownComponent } from './department-dropdown/department-dropdown.component';



@NgModule({
  declarations: [
    SummaryFilterComponent,
    DepartmentDropdownComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SummaryFilterComponent
  ]
})
export class SummaryFilterModule { }
