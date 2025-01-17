import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirInventorySetupComponent } from './compressed-air-inventory-setup.component';
import { SettingsModule } from '../../settings/settings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssessmentCo2SavingsModule } from '../../shared/assessment-co2-savings/assessment-co2-savings.module';
import { ConfirmDeleteModalModule } from '../../shared/confirm-delete-modal/confirm-delete-modal.module';
import { ConnectedInventoryModule } from '../../shared/connected-inventory/connected-inventory-module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';



@NgModule({
  declarations: [
    CompressedAirInventorySetupComponent
  ],
  imports: [
    CommonModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule,
    AssessmentCo2SavingsModule,
    ConfirmDeleteModalModule,
    ConnectedInventoryModule
  ],
  exports: [
    CompressedAirInventorySetupComponent
  ]
})
export class CompressedAirInventorySetupModule { }
