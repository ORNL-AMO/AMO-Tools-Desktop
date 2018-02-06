import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirComponent } from './compressed-air.component';
import { BagMethodComponent } from './bag-method/bag-method.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CompressedAirComponent,
    BagMethodComponent
  ],
  exports: [
    CompressedAirComponent
  ]
})
export class CompressedAirModule { }
