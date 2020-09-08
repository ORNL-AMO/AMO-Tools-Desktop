import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotorInventoryComponent } from './motor-inventory.component';
import { MotorInventoryBannerComponent } from './motor-inventory-banner/motor-inventory-banner.component';
import { RouterModule } from '@angular/router';
import { MotorInventorySetupComponent } from './motor-inventory-setup/motor-inventory-setup.component';
import { DepartmentSetupComponent } from './motor-inventory-setup/department-setup/department-setup.component';
import { PlantSetupComponent } from './motor-inventory-setup/plant-setup/plant-setup.component';
import { MotorInventoryCalculatorsComponent } from './motor-inventory-calculators/motor-inventory-calculators.component';
import { BatchAnalysisComponent } from './batch-analysis/batch-analysis.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { SettingsModule } from '../settings/settings.module';
import { MotorInventoryService } from './motor-inventory.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DepartmentCatalogTableComponent } from './motor-inventory-setup/department-catalog-table/department-catalog-table.component';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { MotorCatalogModule } from './motor-inventory-setup/motor-catalog/motor-catalog.module';
import { MotorPropertiesModule } from './motor-inventory-setup/motor-properties/motor-properties.module';
import { MotorInventorySummaryModule } from './motor-inventory-summary/motor-inventory-summary.module';
import { SummaryFilterModule } from './motor-inventory-banner/summary-filter/summary-filter.module';
import { HelpPanelModule } from './help-panel/help-panel.module';
import { BatchAnalysisTableComponent } from './batch-analysis/batch-analysis-table/batch-analysis-table.component';

@NgModule({
  declarations: [
    MotorInventoryComponent,
    MotorInventoryBannerComponent,
    MotorInventorySetupComponent,
    DepartmentSetupComponent,
    PlantSetupComponent,
    MotorInventoryCalculatorsComponent,
    BatchAnalysisComponent,
    DepartmentCatalogTableComponent,
    BatchAnalysisTableComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule,
    MotorCatalogModule,
    MotorPropertiesModule,
    MotorInventorySummaryModule,
    SummaryFilterModule,
    HelpPanelModule
  ],
  providers: [
    MotorInventoryService
  ]
})
export class MotorInventoryModule { }
