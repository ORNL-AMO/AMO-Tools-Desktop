import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuxiliaryPowerCompareService } from './auxiliary-power-compare.service';
import { AuxiliaryPowerLossesService } from './auxiliary-power-losses.service';
import { AuxiliaryPowerLossesFormComponent } from './auxiliary-power-losses-form/auxiliary-power-losses-form.component';
import { AuxiliaryPowerLossesComponent } from './auxiliary-power-losses.component';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule
  ],
  declarations: [
    AuxiliaryPowerLossesComponent,
    AuxiliaryPowerLossesFormComponent
  ],
  providers: [
    AuxiliaryPowerCompareService,
    AuxiliaryPowerLossesService
  ],
  exports: [
    AuxiliaryPowerLossesComponent
  ]
})
export class AuxiliaryPowerLossesModule { }
