import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpPanelComponent } from './help-panel.component';
import { ConnectedInventoryModule } from '../../shared/connected-inventory/connected-inventory-module';
import { PumpEquipmentHelpComponent } from './pump-equipment-help/pump-equipment-help.component';
import { PumpMotorHelpComponent } from './pump-motor-help/pump-motor-help.component';
import { PumpStatusHelpComponent } from './pump-status-help/pump-status-help.component';
import { PumpSystemHelpComponent } from './pump-system-help/pump-system-help.component';
import { PumpFluidHelpComponent } from './pump-fluid-help/pump-fluid-help.component';
import { PumpNameplateDataHelpComponent } from './pump-nameplate-data-help/pump-nameplate-data-help.component';
import { PumpFieldHelpComponent } from './pump-field-help/pump-field-help.component';



@NgModule({
  declarations: [
    HelpPanelComponent, 
    PumpEquipmentHelpComponent, 
    PumpMotorHelpComponent, 
    PumpStatusHelpComponent, 
    PumpSystemHelpComponent, 
    PumpFluidHelpComponent, 
    PumpNameplateDataHelpComponent, 
    PumpFieldHelpComponent
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
