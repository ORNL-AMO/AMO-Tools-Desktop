import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventorySummaryGraphsComponent } from './inventory-summary-graphs/inventory-summary-graphs.component';
import { InventorySummaryTableComponent } from './inventory-summary-table/inventory-summary-table.component';
import { InventorySummaryOverviewComponent } from './inventory-summary-overview/inventory-summary-overview.component';
import { InventorySummaryMotorDetailsComponent } from './inventory-summary-motor-details/inventory-summary-motor-details.component';
import { MotorInventorySummaryComponent } from './motor-inventory-summary.component';
import { DepartmentOverviewComponent } from './inventory-summary-overview/department-overview/department-overview.component';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { NameplateDataTableComponent } from './inventory-summary-overview/department-overview/nameplate-data-table/nameplate-data-table.component';
import { LoadCharacteristicsTableComponent } from './inventory-summary-overview/department-overview/load-characteristics-table/load-characteristics-table.component';
import { OperationDataTableComponent } from './inventory-summary-overview/department-overview/operation-data-table/operation-data-table.component';
import { ManualSpecificationsTableComponent } from './inventory-summary-overview/department-overview/manual-specifications-table/manual-specifications-table.component';
import { BatchAnalysisTableComponent } from './inventory-summary-overview/department-overview/batch-analysis-table/batch-analysis-table.component';
import { PurchaseInformationTableComponent } from './inventory-summary-overview/department-overview/purchase-information-table/purchase-information-table.component';
import { TorqueTableComponent } from './inventory-summary-overview/department-overview/torque-table/torque-table.component';
import { OtherTableComponent } from './inventory-summary-overview/department-overview/other-table/other-table.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MotorInventorySummaryComponent, 
    InventorySummaryGraphsComponent, 
    InventorySummaryTableComponent, 
    InventorySummaryOverviewComponent, 
    InventorySummaryMotorDetailsComponent, DepartmentOverviewComponent, NameplateDataTableComponent, LoadCharacteristicsTableComponent, OperationDataTableComponent, ManualSpecificationsTableComponent, BatchAnalysisTableComponent, PurchaseInformationTableComponent, TorqueTableComponent, OtherTableComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    FormsModule
  ],
  exports: [
    MotorInventorySummaryComponent
  ]
})
export class MotorInventorySummaryModule { }
