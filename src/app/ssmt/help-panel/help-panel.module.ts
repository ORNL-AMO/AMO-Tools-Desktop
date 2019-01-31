import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoilerHelpComponent } from './boiler-help/boiler-help.component';
import { TurbineHelpComponent } from './turbine-help/turbine-help.component';
import { HeaderHelpComponent } from './header-help/header-help.component';
import { OperationsHelpComponent } from './operations-help/operations-help.component';
import { SystemBasicsHelpComponent } from './system-basics-help/system-basics-help.component';
import { HelpPanelComponent } from './help-panel.component';
import { ModifyConditionsNotesComponent } from './modify-conditions-notes/modify-conditions-notes.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    HelpPanelComponent,
    SystemBasicsHelpComponent,
    OperationsHelpComponent,
    HeaderHelpComponent,
    TurbineHelpComponent,
    BoilerHelpComponent,
    ModifyConditionsNotesComponent
  ],
  exports: [
    HelpPanelComponent,
    SystemBasicsHelpComponent,
    OperationsHelpComponent,
    HeaderHelpComponent,
    TurbineHelpComponent,
    BoilerHelpComponent
  ]
})
export class HelpPanelModule { }
