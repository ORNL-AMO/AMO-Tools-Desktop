import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhonePipe } from './phone.pipe';
import { SettingsLabelPipe } from './settings-label.pipe';
import { SigFigsPipe } from './sig-figs.pipe';



@NgModule({
  declarations: [
    PhonePipe,
    SettingsLabelPipe,
    SigFigsPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PhonePipe,
    SettingsLabelPipe,
    SigFigsPipe
  ]
})
export class SharedPipesModule { }
