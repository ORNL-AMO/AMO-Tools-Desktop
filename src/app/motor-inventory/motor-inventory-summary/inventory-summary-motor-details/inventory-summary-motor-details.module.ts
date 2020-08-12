import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { InventorySummaryMotorDetailsComponent } from './inventory-summary-motor-details.component';
import { MotorItemDetailComponent } from './motor-item-detail/motor-item-detail.component';



@NgModule({
  declarations: [
    InventorySummaryMotorDetailsComponent,
    MotorItemDetailComponent
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
