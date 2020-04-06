import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintOptionsMenuComponent } from './print-options-menu.component';
import { AnimatedCheckmarkModule } from '../animated-checkmark/animated-checkmark.module';
import { ModalModule } from 'ngx-bootstrap';
import { PrintOptionsMenuService } from './print-options-menu.service';

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
  ],
  providers: [
    PrintOptionsMenuService
  ]
})
export class PrintOptionsMenuModule { }
