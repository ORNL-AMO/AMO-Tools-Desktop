import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorDragBarComponent } from './calculator-drag-bar.component';
import { CalculatorDragBarService } from './calculator-drag-bar.service';



@NgModule({
  declarations: [
    CalculatorDragBarComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    CalculatorDragBarService
  ],
  exports: [
    CalculatorDragBarComponent
  ]
})
export class CalculatorDragBarModule { }
