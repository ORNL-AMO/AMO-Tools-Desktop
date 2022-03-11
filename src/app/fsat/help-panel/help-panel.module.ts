import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpPanelComponent } from './help-panel.component';
import { HelpPanelService } from './help-panel.service';
import { FsatBasicsHelpComponent } from './fsat-basics-help/fsat-basics-help.component';
import { SystemBasicsHelpComponent } from './system-basics-help/system-basics-help.component';
import { FanFieldDataHelpComponent } from './fan-field-data-help/fan-field-data-help.component';
import { FanMotorHelpComponent } from './fan-motor-help/fan-motor-help.component';
import { FanSetupHelpComponent } from './fan-setup-help/fan-setup-help.component';
import { FsatFluidHelpComponent } from './fsat-fluid-help/fsat-fluid-help.component';
import { ModifyConditionsNotesComponent } from './modify-conditions-notes/modify-conditions-notes.component';
import { FsatResultsModule } from '../fsat-results/fsat-results.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { GasDensityResultsModule } from '../../shared/gas-density-results/gas-density-results.module';
import { FanOperationsHelpComponent } from './fan-operations-help/fan-operations-help.component';
import { Co2HelpTextModule } from '../../shared/co2-help-text/co2-help-text.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FsatResultsModule,
    GasDensityResultsModule,
    Co2HelpTextModule
  ],
  declarations: [
    HelpPanelComponent,
    SystemBasicsHelpComponent,
    FsatBasicsHelpComponent,
    FanFieldDataHelpComponent,
    FanMotorHelpComponent,
    FanSetupHelpComponent,
    FsatFluidHelpComponent,
    ModifyConditionsNotesComponent,
    FanOperationsHelpComponent
  ],
  providers: [
    HelpPanelService
  ],
  exports: [
    HelpPanelComponent,
    SystemBasicsHelpComponent,
    FsatBasicsHelpComponent,
    FanFieldDataHelpComponent,
    FanMotorHelpComponent,
    FanSetupHelpComponent,
    FsatFluidHelpComponent,
    ModifyConditionsNotesComponent
  ]
})
export class HelpPanelModule { }
