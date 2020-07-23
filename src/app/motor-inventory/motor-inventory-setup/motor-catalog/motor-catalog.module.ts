import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotorCatalogService } from './motor-catalog.service';
import { SelectMotorModalComponent } from './select-motor-modal/select-motor-modal.component';
import { MotorBasicsComponent } from './motor-basics/motor-basics.component';
import { FilterMotorsComponent } from './select-motor-modal/filter-motors/filter-motors.component';
import { MotorOptionsTableComponent } from './select-motor-modal/motor-options-table/motor-options-table.component';
import { FilterMotorOptionsPipe } from './select-motor-modal/filter-motor-options.pipe';
import { RequiredMotorDataComponent } from './required-motor-data/required-motor-data.component';
import { BatchAnalysisDataComponent } from './batch-analysis-data/batch-analysis-data.component';
import { LoadCharacteristicDataComponent } from './load-characteristic-data/load-characteristic-data.component';
import { ManualSpecificationDataComponent } from './manual-specification-data/manual-specification-data.component';
import { NameplateDataComponent } from './nameplate-data/nameplate-data.component';
import { OperationsDataComponent } from './operations-data/operations-data.component';
import { BatchAnalysisDataService } from './batch-analysis-data/batch-analysis-data.service';
import { RequiredMotorDataService } from './required-motor-data/required-motor-data.service';
import { MotorCatalogComponent } from './motor-catalog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ManualSpecificationDataService } from './manual-specification-data/manual-specification-data.service';
import { NameplateDataService } from './nameplate-data/nameplate-data.service';
import { OperationsDataService } from './operations-data/operations-data.service';
import { TorqueDataComponent } from './torque-data/torque-data.component';
import { OtherDataComponent } from './other-data/other-data.component';
import { PurchaseInformationDataComponent } from './purchase-information-data/purchase-information-data.component';
import { OtherDataService } from './other-data/other-data.service';
import { PurchaseInformationDataService } from './purchase-information-data/purchase-information-data.service';
import { TorqueDataService } from './torque-data/torque-data.service';
import { LoadCharacteristicDataService } from './load-characteristic-data/load-characteristic-data.service';

@NgModule({
  declarations: [
    MotorCatalogComponent,
    SelectMotorModalComponent,
    MotorBasicsComponent,
    FilterMotorsComponent,
    MotorOptionsTableComponent,
    FilterMotorOptionsPipe,
    RequiredMotorDataComponent,
    BatchAnalysisDataComponent,
    LoadCharacteristicDataComponent,
    ManualSpecificationDataComponent,
    NameplateDataComponent,
    OperationsDataComponent,
    TorqueDataComponent,
    OtherDataComponent,
    PurchaseInformationDataComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [
    BatchAnalysisDataService,
    RequiredMotorDataService,
    MotorCatalogService,
    ManualSpecificationDataService,
    NameplateDataService,
    OperationsDataService,
    OtherDataService,
    PurchaseInformationDataService,
    TorqueDataService,
    LoadCharacteristicDataService
  ],
  exports: [
    MotorCatalogComponent
  ]
})
export class MotorCatalogModule { }
