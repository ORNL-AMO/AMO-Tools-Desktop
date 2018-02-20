import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompressedAirComponent } from './compressed-air.component';
import { BagMethodComponent } from './bag-method/bag-method.component';
import { SharedModule } from '../../shared/shared.module';
import { BagMethodFormComponent } from './bag-method/bag-method-form/bag-method-form.component';
import { FlowFactorComponent } from './flow-factor/flow-factor.component';
import { FlowFactorFormComponent } from './flow-factor/flow-factor-form/flow-factor-form.component';
import { PneumaticAirComponent } from './pneumatic-air/pneumatic-air.component';
import { PneumaticAirFormComponent } from './pneumatic-air/pneumatic-air-form/pneumatic-air-form.component';
import { ReceiverTankComponent } from './receiver-tank/receiver-tank.component';
import { GeneralMethodComponent } from './receiver-tank/general-method/general-method.component';
import { GeneralMethodFormComponent } from './receiver-tank/general-method/general-method-form/general-method-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    CompressedAirComponent,
    BagMethodComponent,
    BagMethodFormComponent,
    FlowFactorComponent,
    FlowFactorFormComponent,
    PneumaticAirComponent,
    PneumaticAirFormComponent,
    ReceiverTankComponent,
    GeneralMethodComponent,
    GeneralMethodFormComponent
  ],
  exports: [
    CompressedAirComponent
  ]
})
export class CompressedAirModule { }
