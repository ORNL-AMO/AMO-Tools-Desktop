import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemAndEquipmentCurveComponent } from './system-and-equipment-curve.component';
import { SystemAndEquipmentCurveService } from './system-and-equipment-curve.service';
import { SystemCurveComponent } from './system-curve/system-curve.component';
import { EquipmentCurveComponent } from './equipment-curve/equipment-curve.component';
import { FanSystemCurveFormComponent } from './system-curve/fan-system-curve-form/fan-system-curve-form.component';
import { PumpSystemCurveFormComponent } from './system-curve/pump-system-curve-form/pump-system-curve-form.component';
import { PumpCurveFormComponent } from './equipment-curve/pump-curve-form/pump-curve-form.component';
import { FanCurveFormComponent } from './equipment-curve/fan-curve-form/fan-curve-form.component';

@NgModule({
  declarations: [
    SystemAndEquipmentCurveComponent,
    SystemCurveComponent,
    EquipmentCurveComponent,
    FanSystemCurveFormComponent,
    PumpSystemCurveFormComponent, PumpCurveFormComponent, FanCurveFormComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    SystemAndEquipmentCurveService
  ],
  exports: [
    SystemAndEquipmentCurveComponent
  ]
})
export class SystemAndEquipmentCurveModule { }
