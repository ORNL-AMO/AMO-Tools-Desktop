import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Co2SavingsPhastComponent } from './co2-savings-phast.component';
import { Co2SavingsPhastService } from './co2-savings-phast.service';



@NgModule({
  declarations: [
    Co2SavingsPhastComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [
    Co2SavingsPhastService
  ],
  exports: [
    Co2SavingsPhastComponent
  ]
})
export class Co2SavingsPhastModule { }
