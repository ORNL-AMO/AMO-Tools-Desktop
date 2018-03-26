import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { AirVelocityComponent } from './air-velocity.component';
import { AirVelocityFormComponent } from './air-velocity-form/air-velocity-form.component';
import { AirVelocityHelpComponent } from './air-velocity-help/air-velocity-help.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
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
