import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpPanelComponent } from './help-panel.component';
import { SystemBasicsHelpComponent } from './system-basics-help/system-basics-help.component';
import { PumpFluidHelpComponent } from './pump-fluid-help/pump-fluid-help.component';
import { MotorHelpComponent } from './motor-help/motor-help.component';
import { FieldDataHelpComponent } from './field-data-help/field-data-help.component';
import { ModifyConditionsHelpComponent } from './modify-conditions-help/modify-conditions-help.component';

import { HelpPanelService } from './help-panel.service';
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    HelpPanelComponent,
    SystemBasicsHelpComponent,
    PumpFluidHelpComponent,
    MotorHelpComponent,
    FieldDataHelpComponent,
    ModifyConditionsHelpComponent
  ],
  providers: [
    HelpPanelService
  ],
  exports: [
    HelpPanelComponent
  ]
})
export class HelpPanelModule { }
