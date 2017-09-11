import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { EnergyInputExhaustGasFormComponent } from './energy-input-exhaust-gas-form/energy-input-exhaust-gas-form.component';
import { EnergyInputExhaustGasLossesComponent } from './energy-input-exhaust-gas-losses.component';
import { EnergyInputExhaustGasCompareService } from './energy-input-exhaust-gas-compare.service';
import { EnergyInputExhaustGasService } from './energy-input-exhaust-gas.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [EnergyInputExhaustGasFormComponent, EnergyInputExhaustGasLossesComponent],
  providers: [EnergyInputExhaustGasCompareService, EnergyInputExhaustGasService],
  exports: [EnergyInputExhaustGasLossesComponent]
})
export class EnergyInputExhaustGasLossesModule { }
