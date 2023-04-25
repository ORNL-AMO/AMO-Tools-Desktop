import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpPanelComponent } from './help-panel.component';



@NgModule({
  declarations: [HelpPanelComponent],
  imports: [
    CommonModule
  ],
  exports: [
    HelpPanelComponent
  ]
})
export class HelpPanelModule { }
