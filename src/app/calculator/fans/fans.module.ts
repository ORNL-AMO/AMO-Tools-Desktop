import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fsat203Module } from './fsat-203/fsat-203.module';
import { FansComponent } from './fans.component';

@NgModule({
  imports: [
    CommonModule,
    Fsat203Module
  ],
  declarations: [FansComponent],
  exports: [FansComponent]
})
export class FansModule { }
