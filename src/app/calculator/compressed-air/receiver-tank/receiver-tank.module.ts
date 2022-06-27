import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceiverTankComponent } from './receiver-tank.component';
import { GeneralMethodFormComponent } from './general-method-form/general-method-form.component';
import { DedicatedStorageFormComponent } from './dedicated-storage-form/dedicated-storage-form.component';
import { AirCapacityFormComponent } from './air-capacity-form/air-capacity-form.component';
import { DelayMethodFormComponent } from './delay-method-form/delay-method-form.component';
import { MeteredStorageFormComponent } from './metered-storage-form/metered-storage-form.component';
import { AirCapacityHelpComponent } from './air-capacity-help/air-capacity-help.component';
import { DedicatedStorageHelpComponent } from './dedicated-storage-help/dedicated-storage-help.component';
import { DelayMethodHelpComponent } from './delay-method-help/delay-method-help.component';
import { GeneralMethodHelpComponent } from './general-method-help/general-method-help.component';
import { MeteredStorageHelpComponent } from './metered-storage-help/metered-storage-help.component';
import { ReceiverTankService } from './receiver-tank.service';
import { CompressorCycleFormComponent } from './compressor-cycle-form/compressor-cycle-form.component';
import { CompressorCycleHelpComponent } from './compressor-cycle-help/compressor-cycle-help.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    ReceiverTankComponent,
    GeneralMethodFormComponent,
    DedicatedStorageFormComponent,
    AirCapacityFormComponent,
    DelayMethodFormComponent,
    MeteredStorageFormComponent,
    AirCapacityHelpComponent,
    DedicatedStorageHelpComponent,
    DelayMethodHelpComponent,
    GeneralMethodHelpComponent,
    MeteredStorageHelpComponent,
    CompressorCycleFormComponent,
    CompressorCycleHelpComponent
  ],
  exports: [
    ReceiverTankComponent
  ],
  providers: [
    ReceiverTankService
  ]
})
export class ReceiverTankModule { }
