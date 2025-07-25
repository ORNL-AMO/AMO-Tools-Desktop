import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirInventoryComponent } from './compressed-air-inventory.component';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { RouterModule } from '@angular/router';
import { SettingsModule } from '../settings/settings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompressedAirInventoryService } from './compressed-air-inventory.service';
import { ImportExportModule } from '../shared/import-export/import-export.module';
import { CompressedAirInventoryBannerComponent } from './compressed-air-inventory-banner/compressed-air-inventory-banner.component';
import { CompressedAirInventorySetupModule } from './compressed-air-inventory-setup/compressed-air-inventory-setup.module';
import { CompressedAirInventorySummaryModule } from './compressed-air-inventory-summary/compressed-air-inventory-summary.module';
import { HelpPanelModule } from './help-panel/help-panel.module';
import { ConnectedInventoryModule } from '../shared/connected-inventory/connected-inventory-module';
import { ConfirmDeleteModalModule } from '../shared/confirm-delete-modal/confirm-delete-modal.module';
import { AssessmentCo2SavingsModule } from '../shared/assessment-co2-savings/assessment-co2-savings.module';
import { ExistingCompressorDbService } from './existing-compressor-db.service';
import { CompressorDataManagementService } from './compressor-data-management.service';
import { ConvertCompressedAirInventoryService } from './convert-compressed-air-inventory.service';
import { SummaryFilterComponent } from './compressed-air-inventory-banner/summary-filter/summary-filter.component';
import { SelectedOptionsComponent } from './compressed-air-inventory-banner/summary-filter/selected-options/selected-options.component';
import { SystemDropdownComponent } from './compressed-air-inventory-banner/summary-filter/system-dropdown/system-dropdown.component';
import { HorsepowerDropdownComponent } from './compressed-air-inventory-banner/summary-filter/horsepower-dropdown/horsepower-dropdown.component';
import { CompressorTypeDropdownComponent } from './compressed-air-inventory-banner/summary-filter/compressor-type-dropdown/compressor-type-dropdown.component';
import { ControlTypeDropdownComponent } from './compressed-air-inventory-banner/summary-filter/control-type-dropdown/control-type-dropdown.component';



@NgModule({
  declarations: [
    CompressedAirInventoryComponent,
    CompressedAirInventoryBannerComponent,
    SummaryFilterComponent,
    SelectedOptionsComponent,
    SystemDropdownComponent,
    CompressorTypeDropdownComponent,
    ControlTypeDropdownComponent,
    HorsepowerDropdownComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule,
    RouterModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,   
    ImportExportModule,
    CompressedAirInventorySetupModule,
    CompressedAirInventorySummaryModule,
    ConnectedInventoryModule,    
    HelpPanelModule,
    ConfirmDeleteModalModule,
    AssessmentCo2SavingsModule,
  ],
  providers: [
    CompressedAirInventoryService,
    ExistingCompressorDbService,
    CompressorDataManagementService,
    ConvertCompressedAirInventoryService
  ]
})
export class CompressedAirInventoryModule { }
