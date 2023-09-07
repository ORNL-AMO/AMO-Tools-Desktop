import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotorCatalogService } from './motor-catalog.service';
import { SelectMotorModalComponent } from './select-motor-modal/select-motor-modal.component';
import { MotorBasicsComponent } from './motor-basics/motor-basics.component';
import { FilterMotorsComponent } from './select-motor-modal/filter-motors/filter-motors.component';
import { MotorOptionsTableComponent } from './select-motor-modal/motor-options-table/motor-options-table.component';
import { FilterMotorOptionsPipe } from './select-motor-modal/filter-motor-options.pipe';
import { BatchAnalysisDataComponent } from './batch-analysis-data/batch-analysis-data.component';
import { LoadCharacteristicDataComponent } from './load-characteristic-data/load-characteristic-data.component';
import { ManualSpecificationDataComponent } from './manual-specification-data/manual-specification-data.component';
import { NameplateDataComponent } from './nameplate-data/nameplate-data.component';
import { OperationsDataComponent } from './operations-data/operations-data.component';
import { BatchAnalysisDataService } from './batch-analysis-data/batch-analysis-data.service';
import { MotorCatalogComponent } from './motor-catalog.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { MotorBasicsService } from './motor-basics/motor-basics.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { PercentLoadEstimationModule } from '../../../calculator/motors/percent-load-estimation/percent-load-estimation.module';
import { DeleteMotorModalComponent } from './delete-motor-modal/delete-motor-modal.component';
import { ConnectedInventoryModule } from '../../../shared/connected-inventory/connected-inventory-module';

@NgModule({
  declarations: [
    MotorCatalogComponent,
    SelectMotorModalComponent,
    MotorBasicsComponent,
    FilterMotorsComponent,
    MotorOptionsTableComponent,
    FilterMotorOptionsPipe,
    BatchAnalysisDataComponent,
    LoadCharacteristicDataComponent,
    ManualSpecificationDataComponent,
    NameplateDataComponent,
    OperationsDataComponent,
    TorqueDataComponent,
    OtherDataComponent,
    PurchaseInformationDataComponent,
    DeleteMotorModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    PercentLoadEstimationModule,
    ConnectedInventoryModule
  ],
  providers: [
    BatchAnalysisDataService,
    MotorCatalogService,
    ManualSpecificationDataService,
    NameplateDataService,
    OperationsDataService,
    OtherDataService,
    PurchaseInformationDataService,
    TorqueDataService,
    LoadCharacteristicDataService,
    MotorBasicsService
  ],
  exports: [
    MotorCatalogComponent
  ]
})
export class MotorCatalogModule { }
