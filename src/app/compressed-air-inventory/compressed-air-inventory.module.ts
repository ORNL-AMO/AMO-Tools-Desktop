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



@NgModule({
  declarations: [
    CompressedAirInventoryComponent,
    CompressedAirInventoryBannerComponent,
    SummaryFilterComponent
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
