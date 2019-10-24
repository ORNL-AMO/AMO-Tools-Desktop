import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PneumaticAirComponent } from './pneumatic-air.component';
import { PneumaticAirFormComponent } from './pneumatic-air-form/pneumatic-air-form.component';
import { PneumaticAirService } from './pneumatic-air.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    PneumaticAirComponent,
    PneumaticAirFormComponent
  ],
  exports: [
    PneumaticAirComponent
  ],
  providers: [
    PneumaticAirService
  ]
})
export class PneumaticAirModule { }
