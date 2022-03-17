import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MixedCo2EmissionsComponent } from './mixed-co2-emissions.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MixedCo2EmissionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    MixedCo2EmissionsComponent
  ]
})
export class MixedCo2EmissionsModule { }
