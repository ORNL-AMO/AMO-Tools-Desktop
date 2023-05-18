import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotorIntegrationService } from './motor-integration.service';
import { ReactiveFormsModule } from '@angular/forms';
import { InventoryIntegrationComponent } from './inventory-integration/inventory-integration.component';
import { IntegrationStateComponent } from './integration-status/integration-status.component';
import { IntegrationStateService } from './integration-state.service';
import { IntegrationHelpComponent } from './integration-help/integration-help.component';



@NgModule({
  declarations: [
    InventoryIntegrationComponent,
    IntegrationStateComponent,
    IntegrationHelpComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [
    MotorIntegrationService,
    IntegrationStateService
  ],
  exports: [
    IntegrationStateComponent, 
    InventoryIntegrationComponent,
    IntegrationHelpComponent
  ]
})
export class AssessmentIntegrationModule { }
