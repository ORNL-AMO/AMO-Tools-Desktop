import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SankeyScenarioPickerComponent } from './sankey-scenario-picker/sankey-scenario-picker.component';

@NgModule({
  declarations: [
    SankeyScenarioPickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    SankeyScenarioPickerComponent
  ]
})
export class SankeySharedModule { }
