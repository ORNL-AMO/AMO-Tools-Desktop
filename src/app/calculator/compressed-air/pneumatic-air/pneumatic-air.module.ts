import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { PneumaticAirComponent } from './pneumatic-air.component';
import { PneumaticAirFormComponent } from './pneumatic-air-form/pneumatic-air-form.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    PneumaticAirComponent,
    PneumaticAirFormComponent
  ],
  exports: [
    PneumaticAirComponent
  ]
})
export class PneumaticAirModule { }
