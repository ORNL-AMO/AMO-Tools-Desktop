import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ReceiverTankComponent } from './receiver-tank.component';
import { GeneralMethodComponent } from './general-method/general-method.component';
import { GeneralMethodFormComponent } from './general-method/general-method-form/general-method-form.component';

import { DedicatedStorageComponent } from './dedicated-storage/dedicated-storage.component';
import { DedicatedStorageFormComponent } from './dedicated-storage/dedicated-storage-form/dedicated-storage-form.component';
import { AirCapacityComponent } from './air-capacity/air-capacity.component';
import { AirCapacityFormComponent } from './air-capacity/air-capacity-form/air-capacity-form.component';
import { DelayMethodComponent } from './delay-method/delay-method.component';
import { DelayMethodFormComponent } from './delay-method/delay-method-form/delay-method-form.component';
import { MeteredStorageComponent } from './metered-storage/metered-storage.component';
import { MeteredStorageFormComponent } from './metered-storage/metered-storage-form/metered-storage-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    ReceiverTankComponent,
    GeneralMethodComponent,
    GeneralMethodFormComponent,
    DedicatedStorageComponent,
    DedicatedStorageFormComponent,
    AirCapacityComponent,
    AirCapacityFormComponent,
    DelayMethodComponent,
    DelayMethodFormComponent,
    MeteredStorageComponent,
    MeteredStorageFormComponent
  ],
  exports: [
    ReceiverTankComponent
  ]
})
export class ReceiverTankModule { }
