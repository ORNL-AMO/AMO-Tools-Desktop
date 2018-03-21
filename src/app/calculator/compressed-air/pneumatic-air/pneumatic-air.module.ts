import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { PneumaticAirComponent } from './pneumatic-air.component';
import { PneumaticAirFormComponent } from './pneumatic-air-form/pneumatic-air-form.component';
import { PneumaticAirHelpComponent } from './pneumatic-air-help/pneumatic-air-help.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    PneumaticAirComponent,
    PneumaticAirFormComponent,
    PneumaticAirHelpComponent
  ],
  exports: [
    PneumaticAirComponent
  ]
})
export class PneumaticAirModule { }
