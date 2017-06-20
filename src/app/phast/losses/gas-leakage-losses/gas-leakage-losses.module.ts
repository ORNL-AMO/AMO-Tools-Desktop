import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { GasLeakageLossesComponent } from './gas-leakage-losses.component';
import { GasLeakageLossesFormComponent } from './gas-leakage-losses-form/gas-leakage-losses-form.component';
import { GasLeakageLossesService } from './gas-leakage-losses.service';
import { GasLeakageCompareService } from "./gas-leakage-compare.service";
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ],
  declarations: [
    GasLeakageLossesComponent,
    GasLeakageLossesFormComponent
  ],
  exports: [
    GasLeakageLossesComponent
  ],
  providers: [
    GasLeakageCompareService,
    GasLeakageLossesService
  ]
})
export class GasLeakageLossesModule { }
