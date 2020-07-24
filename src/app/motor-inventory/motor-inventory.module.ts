import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotorInventoryComponent } from './motor-inventory.component';
import { MotorInventoryBannerComponent } from './motor-inventory-banner/motor-inventory-banner.component';
import { RouterModule } from '@angular/router';
import { MotorInventorySetupComponent } from './motor-inventory-setup/motor-inventory-setup.component';
import { DepartmentSetupComponent } from './motor-inventory-setup/department-setup/department-setup.component';
import { PlantSetupComponent } from './motor-inventory-setup/plant-setup/plant-setup.component';
import { MotorInventoryCalculatorsComponent } from './motor-inventory-calculators/motor-inventory-calculators.component';
import { MotorInventorySummaryComponent } from './motor-inventory-summary/motor-inventory-summary.component';
import { BatchAnalysisComponent } from './batch-analysis/batch-analysis.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { SettingsModule } from '../settings/settings.module';
import { MotorInventoryService } from './motor-inventory.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DepartmentCatalogTableComponent } from './motor-inventory-setup/department-catalog-table/department-catalog-table.component';
import { ModalModule } from 'ngx-bootstrap';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { MotorCatalogModule } from './motor-inventory-setup/motor-catalog/motor-catalog.module';
import { MotorPropertiesModule } from './motor-inventory-setup/motor-properties/motor-properties.module';

@NgModule({
  declarations: [
    MotorInventoryComponent,
    MotorInventoryBannerComponent,
    MotorInventorySetupComponent,
    DepartmentSetupComponent,
    PlantSetupComponent,
    MotorInventoryCalculatorsComponent,
    MotorInventorySummaryComponent,
    BatchAnalysisComponent,
    HelpPanelComponent,
    DepartmentCatalogTableComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    SharedPipesModule,
    MotorCatalogModule,
    MotorPropertiesModule
  ],
  providers: [
    MotorInventoryService
  ]
})
export class MotorInventoryModule { }
