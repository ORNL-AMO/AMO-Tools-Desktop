import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PneumaticValveComponent } from './pneumatic-valve.component';
import { PneumaticValveFormComponent } from './pneumatic-valve-form/pneumatic-valve-form.component';
import { PneumaticValveService } from './pneumatic-valve.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    PneumaticValveComponent,
    PneumaticValveFormComponent
  ],
  exports: [
    PneumaticValveComponent
  ],
  providers: [
    PneumaticValveService
  ]
})
export class PneumaticValveModule { }
