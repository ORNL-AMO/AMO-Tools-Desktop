import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AirVelocityComponent } from './air-velocity.component';
import { AirVelocityFormComponent } from './air-velocity-form/air-velocity-form.component';
import { AirVelocityHelpComponent } from './air-velocity-help/air-velocity-help.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    AirVelocityComponent,
    AirVelocityFormComponent,
    AirVelocityHelpComponent
  ],
  exports: [
    AirVelocityComponent
  ]
})
export class AirVelocityModule { }
