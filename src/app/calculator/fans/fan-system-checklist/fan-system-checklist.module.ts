import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanSystemChecklistComponent } from './fan-system-checklist.component';
import { FanSystemChecklistFormService } from './fan-system-checklist-form.service';
import { FanSystemChecklistService } from './fan-system-checklist.service';
import { FanSystemChecklistFormComponent } from './fan-system-checklist-form/fan-system-checklist-form.component';
import { FanSystemChecklistResultsComponent } from './fan-system-checklist-results/fan-system-checklist-results.component';
import { FanSystemChecklistHelpComponent } from './fan-system-checklist-help/fan-system-checklist-help.component';



@NgModule({
  declarations: [
    FanSystemChecklistComponent,
    FanSystemChecklistFormComponent, 
    FanSystemChecklistResultsComponent, 
    FanSystemChecklistHelpComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FanSystemChecklistComponent
  ],
  providers: [
    FanSystemChecklistFormService,
    FanSystemChecklistService
  ]
})
export class FanSystemChecklistModule { }
