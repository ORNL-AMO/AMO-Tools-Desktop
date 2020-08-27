import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BatchAnalysisPropertiesComponent } from './batch-analysis-properties/batch-analysis-properties.component';
import { LoadCharacteristicPropertiesComponent } from './load-characteristic-properties/load-characteristic-properties.component';
import { ManualSpecificationPropertiesComponent } from './manual-specification-properties/manual-specification-properties.component';
import { NameplateDataPropertiesComponent } from './nameplate-data-properties/nameplate-data-properties.component';
import { OperationDataPropertiesComponent } from './operation-data-properties/operation-data-properties.component';
import { OtherPropertiesComponent } from './other-properties/other-properties.component';
import { PurchaseInformationPropertiesComponent } from './purchase-information-properties/purchase-information-properties.component';
import { TorquePropertiesComponent } from './torque-properties/torque-properties.component';
import { MotorPropertiesComponent } from './motor-properties.component';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    MotorPropertiesComponent,
    LoadCharacteristicPropertiesComponent,
    ManualSpecificationPropertiesComponent,
    NameplateDataPropertiesComponent,
    OperationDataPropertiesComponent,
    OtherPropertiesComponent,
    PurchaseInformationPropertiesComponent,
    TorquePropertiesComponent,
    BatchAnalysisPropertiesComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    MotorPropertiesComponent
  ]
})
export class MotorPropertiesModule { }
