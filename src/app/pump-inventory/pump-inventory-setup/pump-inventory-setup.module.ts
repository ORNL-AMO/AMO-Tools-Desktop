import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PumpCatalogModule } from './pump-catalog/pump-catalog.module';
import { PumpInventorySetupComponent } from './pump-inventory-setup.component';
import { PlantSetupComponent } from './plant-setup/plant-setup.component';
import { DepartmentSetupComponent } from './department-setup/department-setup.component';
import { DepartmentCatalogTableComponent } from './department-catalog-table/department-catalog-table.component';
import { HelpPanelModule } from '../help-panel/help-panel.module';
import { PumpPropertiesModule } from './pump-properties/pump-properties.module';
import { ConfirmDeleteModalModule } from '../../shared/confirm-delete-modal/confirm-delete-modal.module';
import { AssessmentCo2SavingsModule } from '../../shared/assessment-co2-savings/assessment-co2-savings.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsModule } from '../../settings/settings.module';



@NgModule({
  declarations: [
    PumpInventorySetupComponent, 
    PlantSetupComponent, 
    DepartmentSetupComponent, 
    DepartmentCatalogTableComponent
  ],
  imports: [
    CommonModule,
    PumpCatalogModule,
    HelpPanelModule, 
    PumpPropertiesModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule,
    AssessmentCo2SavingsModule,
    ConfirmDeleteModalModule
  ], 
  exports: [PumpInventorySetupComponent]
})
export class PumpInventorySetupModule { }
