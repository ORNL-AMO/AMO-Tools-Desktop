import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryFilterComponent } from './summary-filter.component';
import { DepartmentDropdownComponent } from './department-dropdown/department-dropdown.component';
import { EfficiencyClassDropdownComponent } from './efficiency-class-dropdown/efficiency-class-dropdown.component';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { RatedVoltageDropdownComponent } from './rated-voltage-dropdown/rated-voltage-dropdown.component';
import { RatedPowerDropdownComponent } from './rated-power-dropdown/rated-power-dropdown.component';



@NgModule({
  declarations: [
    SummaryFilterComponent,
    DepartmentDropdownComponent,
    EfficiencyClassDropdownComponent,
    RatedVoltageDropdownComponent,
    RatedPowerDropdownComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule
  ],
  exports: [
    SummaryFilterComponent
  ]
})
export class SummaryFilterModule { }
