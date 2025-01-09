import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpPanelComponent } from './help-panel.component';
import { ConnectedInventoryModule } from '../../shared/connected-inventory/connected-inventory-module';



@NgModule({
  declarations: [
    HelpPanelComponent
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
