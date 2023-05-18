import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpPanelComponent } from './help-panel.component';
import { AssessmentIntegrationModule } from '../../shared/assessment-integration/assessment-integration.module';



@NgModule({
  declarations: [HelpPanelComponent],
  imports: [
    CommonModule,
    AssessmentIntegrationModule
  ],
  exports: [
    HelpPanelComponent
  ]
})
export class HelpPanelModule { }
