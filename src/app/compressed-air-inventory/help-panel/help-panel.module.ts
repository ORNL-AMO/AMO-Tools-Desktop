import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpPanelComponent } from './help-panel.component';
import { ConnectedInventoryModule } from '../../shared/connected-inventory/connected-inventory-module';
import { PerformancePointsHelpComponent } from './performance-points-help/performance-points-help.component';
import { NameplateHelpComponent } from './nameplate-help/nameplate-help.component';
import { MotorHelpComponent } from './motor-help/motor-help.component';
import { FieldMeasurementsHelpComponent } from './field-measurements-help/field-measurements-help.component';
import { DesignDetailsHelpComponent } from './design-details-help/design-details-help.component';
import { ControlsHelpComponent } from './controls-help/controls-help.component';
import { CentrifugalHelpComponent } from './centrifugal-help/centrifugal-help.component';



@NgModule({
  declarations: [
    HelpPanelComponent,
    PerformancePointsHelpComponent,
    NameplateHelpComponent,
    MotorHelpComponent,
    FieldMeasurementsHelpComponent,
    DesignDetailsHelpComponent,
    ControlsHelpComponent,
    CentrifugalHelpComponent
  ],
  imports: [
    CommonModule,    
    ConnectedInventoryModule
  ],
  exports: [
    HelpPanelComponent
  ]
})
export class HelpPanelModule { }
