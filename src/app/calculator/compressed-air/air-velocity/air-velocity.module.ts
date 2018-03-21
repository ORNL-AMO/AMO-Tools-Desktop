import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { AirVelocityComponent } from './air-velocity.component';
import { AirVelocityFormComponent } from './air-velocity-form/air-velocity-form.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    AirVelocityComponent,
    AirVelocityFormComponent
  ],
  exports: [
    AirVelocityComponent
  ]
})
export class AirVelocityModule { }
