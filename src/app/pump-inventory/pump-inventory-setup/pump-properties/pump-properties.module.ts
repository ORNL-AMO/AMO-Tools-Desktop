import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PumpPropertiesComponent } from './pump-properties.component';
import { FluidPropertiesComponent } from './fluid-properties/fluid-properties.component';
import { SystemPropertiesComponent } from './system-properties/system-properties.component';
import { PumpMotorPropertiesComponent } from './pump-motor-properties/pump-motor-properties.component';
import { ReplacementInformationComponent } from './replacement-information/replacement-information.component';
import { PurchaseInformationComponent } from './purchase-information/purchase-information.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SettingsModule } from '../../../settings/settings.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { PumpEquipmentPropertiesComponent } from './pump-equipment-properties/pump-equipment-properties.component';
import { FieldMeasurementsPropertiesComponent } from './field-measurements-properties/field-measurements-properties.component';
import { NameplateDataPropertiesComponent } from './nameplate-data-properties/nameplate-data-properties.component';
import { PumpStatusPropertiesComponent } from './pump-status-properties/pump-status-properties.component';



@NgModule({
  declarations: [
    PumpPropertiesComponent,
    FluidPropertiesComponent,
    SystemPropertiesComponent,
    PumpMotorPropertiesComponent,
    ReplacementInformationComponent,
    PurchaseInformationComponent,
    PumpEquipmentPropertiesComponent,
    FieldMeasurementsPropertiesComponent,
    NameplateDataPropertiesComponent,
    PumpStatusPropertiesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule,
  ],
  exports: [
    PumpPropertiesComponent
  ]
})
export class PumpPropertiesModule { }
