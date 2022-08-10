import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntervalHourLabelPipe } from './interval-hour-label.pipe';



@NgModule({
  declarations: [
    IntervalHourLabelPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    IntervalHourLabelPipe
  ]
})
export class IntervalHourLabelModule { }
