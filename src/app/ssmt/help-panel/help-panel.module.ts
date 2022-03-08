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
import { SsmtResultsPanelModule } from '../ssmt-results-panel/ssmt-results-panel.module';
import { Co2HelpTextModule } from '../../shared/co2-help-text/co2-help-text.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SsmtResultsPanelModule,
    Co2HelpTextModule
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
