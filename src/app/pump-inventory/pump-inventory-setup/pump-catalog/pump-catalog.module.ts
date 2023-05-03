import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PumpCatalogComponent } from './pump-catalog.component';
import { PumpCatalogService } from './pump-catalog.service';
import { FluidCatalogComponent } from './fluid-catalog/fluid-catalog.component';
import { NameplateDataCatalogComponent } from './nameplate-data-catalog/nameplate-data-catalog.component';
import { PumpEquipmentCatalogComponent } from './pump-equipment-catalog/pump-equipment-catalog.component';
import { PumpStatusCatalogComponent } from './pump-status-catalog/pump-status-catalog.component';
import { PumpMotorCatalogComponent } from './pump-motor-catalog/pump-motor-catalog.component';
import { FieldMeasurementsCatalogComponent } from './field-measurements-catalog/field-measurements-catalog.component';
import { SystemCatalogComponent } from './system-catalog/system-catalog.component';
import { PumpBasicsComponent } from './pump-basics/pump-basics.component';
import { PumpBasicsService } from './pump-basics/pump-basics.service';
import { FieldMeasurementsCatalogService } from './field-measurements-catalog/field-measurements-catalog.service';
import { FluidCatalogService } from './fluid-catalog/fluid-catalog.service';
import { NameplateDataCatalogService } from './nameplate-data-catalog/nameplate-data-catalog.service';
import { PumpEquipmentCatalogService } from './pump-equipment-catalog/pump-equipment-catalog.service';
import { PumpMotorCatalogService } from './pump-motor-catalog/pump-motor-catalog.service';
import { PumpStatusCatalogService } from './pump-status-catalog/pump-status-catalog.service';
import { SystemCatalogService } from './system-catalog/system-catalog.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ConfirmDeleteModalModule } from '../../../shared/confirm-delete-modal/confirm-delete-modal.module';



@NgModule({
  declarations: [
    PumpCatalogComponent,
    FluidCatalogComponent,
    NameplateDataCatalogComponent,
    PumpEquipmentCatalogComponent,
    PumpStatusCatalogComponent,
    PumpMotorCatalogComponent,
    FieldMeasurementsCatalogComponent,
    SystemCatalogComponent,
    PumpBasicsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    ConfirmDeleteModalModule, 
  ],
  providers: [
    PumpCatalogService,
    PumpBasicsService,
    FieldMeasurementsCatalogService,
    FluidCatalogService,
    NameplateDataCatalogService,
    PumpEquipmentCatalogService,
    PumpMotorCatalogService,
    PumpStatusCatalogService,
    SystemCatalogService
  ],
  exports: [
    PumpCatalogComponent
  ]
})
export class PumpCatalogModule { }
