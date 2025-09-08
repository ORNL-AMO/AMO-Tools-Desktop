import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PumpMotorIntegrationService } from './pump-motor-integration.service';
import { ReactiveFormsModule } from '@angular/forms';
import { InventoryIntegrationComponent } from './inventory-integration/inventory-integration.component';
import { IntegrationStateComponent } from './integration-status/integration-status.component';
import { IntegrationStateService } from './integration-state.service';
import { IntegrationHelpComponent } from './integration-help/integration-help.component';
import { PsatIntegrationService } from './psat-integration.service';
import { CreateAssessmentModalModule } from '../create-assessment-modal/create-assessment-modal.module';
import { ConnectedAssessmentComponent } from './connected-assessment/connected-assessment.component';
import { ConnectedAssessmentStatusComponent } from './connected-assessment-status/connected-assessment-status.component';



@NgModule({
  declarations: [
    InventoryIntegrationComponent,
    IntegrationStateComponent,
    IntegrationHelpComponent,
    ConnectedAssessmentComponent,
    ConnectedAssessmentStatusComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CreateAssessmentModalModule
  ],
  providers: [
    PumpMotorIntegrationService,
    PsatIntegrationService,
    IntegrationStateService
  ],
  exports: [
    IntegrationStateComponent, 
    InventoryIntegrationComponent,
    IntegrationHelpComponent,
    ConnectedAssessmentComponent,
    ConnectedAssessmentStatusComponent,
  ]
})
export class ConnectedInventoryModule { }
