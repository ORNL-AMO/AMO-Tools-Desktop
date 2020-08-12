import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { InventorySummaryMotorDetailsComponent } from './inventory-summary-motor-details.component';
import { MotorItemDetailComponent } from './motor-item-detail/motor-item-detail.component';
import { OtherDetailsComponent } from './motor-item-detail/other-details/other-details.component';
import { TorqueDetailsComponent } from './motor-item-detail/torque-details/torque-details.component';
import { PurchaseInfoDetailsComponent } from './motor-item-detail/purchase-info-details/purchase-info-details.component';
import { NameplateDetailsComponent } from './motor-item-detail/nameplate-details/nameplate-details.component';
import { LoadCharacteristicDetailsComponent } from './motor-item-detail/load-characteristic-details/load-characteristic-details.component';
import { BatchAnalysisDetailsComponent } from './motor-item-detail/batch-analysis-details/batch-analysis-details.component';
import { ManualSpecificationsDetailsComponent } from './motor-item-detail/manual-specifications-details/manual-specifications-details.component';
import { OperationsDetailsComponent } from './motor-item-detail/operations-details/operations-details.component';



@NgModule({
  declarations: [
    InventorySummaryMotorDetailsComponent,
    MotorItemDetailComponent,
    OtherDetailsComponent,
    TorqueDetailsComponent,
    PurchaseInfoDetailsComponent,
    NameplateDetailsComponent,
    LoadCharacteristicDetailsComponent,
    BatchAnalysisDetailsComponent,
    ManualSpecificationsDetailsComponent,
    OperationsDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule
  ],
  exports: [
    InventorySummaryMotorDetailsComponent
  ]
})
export class InventorySummaryMotorDetailsModule { }
