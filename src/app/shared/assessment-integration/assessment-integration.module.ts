import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentIntegrationComponent } from './assessment-integration.component';
import { AssessmentIntegrationService } from './assessment-integration.service';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AssessmentIntegrationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [
    AssessmentIntegrationService
  ],
  exports: [
    AssessmentIntegrationComponent
  ]
})
export class AssessmentIntegrationModule { }
