import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PumpInventoryComponent } from './pump-inventory.component';
import { PumpInventoryService } from './pump-inventory.service';
import { PumpInventoryBannerComponent } from './pump-inventory-banner/pump-inventory-banner.component';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { RouterModule } from '@angular/router';
import { SettingsModule } from '../settings/settings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PumpCatalogModule } from './pump-inventory-setup/pump-catalog/pump-catalog.module';
import { AssessmentCo2SavingsModule } from '../shared/assessment-co2-savings/assessment-co2-savings.module';
import { HelpPanelModule } from './help-panel/help-panel.module';
import { ConfirmDeleteModalModule } from '../shared/confirm-delete-modal/confirm-delete-modal.module';
import { PumpInventorySetupModule } from './pump-inventory-setup/pump-inventory-setup.module';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { ConvertPumpInventoryService } from './convert-pump-inventory.service';
import { PumpInventorySummaryModule } from './pump-inventory-summary/pump-inventory-summary.module';
import { SummaryFilterComponent } from './pump-inventory-banner/summary-filter/summary-filter.component';
import { DepartmentDropdownComponent } from './pump-inventory-banner/summary-filter/department-dropdown/department-dropdown.component';
import { PumpTypesDropdownComponent } from './pump-inventory-banner/summary-filter/pump-types-dropdown/pump-types-dropdown.component';
import { RatedPowerDropdownComponent } from './pump-inventory-banner/summary-filter/rated-power-dropdown/rated-power-dropdown.component';
import { StatusDropdownComponent } from './pump-inventory-banner/summary-filter/status-dropdown/status-dropdown.component';
import { SelectedOptionsComponent } from './pump-inventory-banner/summary-filter/selected-options/selected-options.component';
import { AssessmentIntegrationModule } from '../shared/assessment-integration/assessment-integration.module';

@NgModule({
  declarations: [
    PumpInventoryComponent,
    PumpInventoryBannerComponent,
    SummaryFilterComponent,
    DepartmentDropdownComponent,
    PumpTypesDropdownComponent,
    RatedPowerDropdownComponent,
    StatusDropdownComponent,
    SelectedOptionsComponent,
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    RouterModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule,
    PumpCatalogModule,
    PumpInventorySetupModule,
    AssessmentCo2SavingsModule,
    HelpPanelModule,
    ConfirmDeleteModalModule,
    PumpInventorySummaryModule,
    AssessmentIntegrationModule
  ],
  providers: [
    PumpInventoryService,
    ConvertPumpInventoryService,
    ConvertUnitsService
  ]
})
export class PumpInventoryModule { }
