import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fsat203Module } from './fsat-203/fsat-203.module';
import { FansComponent } from './fans.component';
import { SystemCurveModule } from '../pumps/system-curve/system-curve.module';

@NgModule({
  imports: [
    CommonModule,
    Fsat203Module,
    SystemCurveModule
  ],
  declarations: [FansComponent],
  exports: [FansComponent]
})
export class FansModule { }
