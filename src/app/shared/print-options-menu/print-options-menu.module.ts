import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintOptionsMenuComponent } from './print-options-menu.component';
import { AnimatedCheckmarkModule } from '../animated-checkmark/animated-checkmark.module';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [
    PrintOptionsMenuComponent
  ],
  imports: [
    CommonModule,
    AnimatedCheckmarkModule,
    ModalModule
  ],
  exports: [
    PrintOptionsMenuComponent
  ]
})
export class PrintOptionsMenuModule { }
