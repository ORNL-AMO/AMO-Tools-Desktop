import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotorIntegrationService } from './motor-integration.service';
import { ReactiveFormsModule } from '@angular/forms';
import { InventoryIntegrationComponent } from './inventory-integration/inventory-integration.component';
import { IntegrationStateComponent } from './integration-status/integration-status.component';
import { IntegrationStateService } from './integration-state.service';
import { IntegrationHelpComponent } from './integration-help/integration-help.component';
import { PsatIntegrationService } from './psat-integration.service';
import { AssessmentIntegrationComponent } from './assessment-integration/assessment-integration.component';
import { AssessmentIntegrationStatusComponent } from './assessment-integration-status/assessment-integration-status.component';
import { CreateAssessmentModalModule } from '../create-assessment-modal/create-assessment-modal.module';



@NgModule({
  declarations: [
    InventoryIntegrationComponent,
    IntegrationStateComponent,
    IntegrationHelpComponent,
    AssessmentIntegrationComponent,
    AssessmentIntegrationStatusComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CreateAssessmentModalModule
  ],
  providers: [
    MotorIntegrationService,
    PsatIntegrationService,
    IntegrationStateService
  ],
  exports: [
    IntegrationStateComponent, 
    InventoryIntegrationComponent,
    IntegrationHelpComponent,
    AssessmentIntegrationComponent,
    AssessmentIntegrationStatusComponent
  ]
})
export class AssessmentIntegrationModule { }
