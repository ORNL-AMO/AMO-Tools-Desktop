import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { EnergyInputComponent } from './energy-input.component';
import { EnergyInputFormComponent } from './energy-input-form/energy-input-form.component';
import { EnergyInputCompareService } from './energy-input-compare.service';
import { EnergyInputService } from './energy-input.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    EnergyInputComponent,
    EnergyInputFormComponent
  ],
  providers: [
    EnergyInputCompareService,
    EnergyInputService
  ],
  exports: [
    EnergyInputComponent
  ]
})
export class EnergyInputModule { }
