import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PumpInventoryComponent } from './pump-inventory.component';
import { PumpInventoryService } from './pump-inventory.service';
import { PumpInventorySetupComponent } from './pump-inventory-setup/pump-inventory-setup.component';
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

@NgModule({
  declarations: [
    PumpInventoryComponent,
    PumpInventoryBannerComponent,
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
  ],
  providers: [
    PumpInventoryService,
    ConvertPumpInventoryService,
    ConvertUnitsService
  ]
})
export class PumpInventoryModule { }
