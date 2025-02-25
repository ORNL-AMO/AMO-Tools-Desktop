import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirInventorySetupComponent } from './compressed-air-inventory-setup.component';
import { SettingsModule } from '../../settings/settings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssessmentCo2SavingsModule } from '../../shared/assessment-co2-savings/assessment-co2-savings.module';
import { ConfirmDeleteModalModule } from '../../shared/confirm-delete-modal/confirm-delete-modal.module';
import { ConnectedInventoryModule } from '../../shared/connected-inventory/connected-inventory-module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { PlantSetupComponent } from './plant-setup/plant-setup.component';
import { HelpPanelModule } from '../help-panel/help-panel.module';
import { DepartmentSetupComponent } from './department-setup/department-setup.component';
import { DepartmentCatalogTableComponent } from './department-catalog-table/department-catalog-table.component';
import { CompressedAirPropertiesModule } from './compressed-air-properties/compressed-air-properties.module';
import { CompressedAirCatalogModule } from './compressed-air-catalog/compressed-air-catalog.module';
import { SystemCapacityInventoryModalComponent } from './plant-setup/system-capacity-inventory-modal/system-capacity-inventory-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SystemCapacityModule } from '../../calculator/compressed-air/system-capacity/system-capacity.module';
import { EndUsesSetupComponent } from './end-uses-setup/end-uses-setup.component';



@NgModule({
  declarations: [
    CompressedAirInventorySetupComponent,
    PlantSetupComponent,
    DepartmentSetupComponent,
    DepartmentCatalogTableComponent,
    SystemCapacityInventoryModalComponent,
    EndUsesSetupComponent,
  ],
  imports: [
    CommonModule,
    SettingsModule,
    FormsModule,
    ModalModule,
    ReactiveFormsModule,
    SharedPipesModule,
    AssessmentCo2SavingsModule,
    ConfirmDeleteModalModule,
    ConnectedInventoryModule,
    HelpPanelModule,
    CompressedAirPropertiesModule,
    CompressedAirCatalogModule,
    SystemCapacityModule
  ],
  exports: [
    CompressedAirInventorySetupComponent
  ]
})
export class CompressedAirInventorySetupModule { }
