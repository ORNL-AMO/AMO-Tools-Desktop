import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CalculatorComponent } from './calculator.component';

@NgModule({
  declarations: [
    CalculatorComponent
  ],
  exports: [
  ],
  imports: [
    RouterModule
  ],
  providers: []
})

export class CalculatorModule { }
