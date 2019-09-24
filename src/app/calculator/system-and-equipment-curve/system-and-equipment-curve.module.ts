import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemAndEquipmentCurveComponent } from './system-and-equipment-curve.component';
import { SystemAndEquipmentCurveService } from './system-and-equipment-curve.service';
import { EquipmentCurveFormComponent } from './equipment-curve/equipment-curve-form/equipment-curve-form.component';
import { SystemCurveComponent } from './system-curve/system-curve.component';
import { EquipmentCurveComponent } from './equipment-curve/equipment-curve.component';
import { FanSystemCurveFormComponent } from './system-curve/fan-system-curve-form/fan-system-curve-form.component';
import { PumpSystemCurveFormComponent } from './system-curve/pump-system-curve-form/pump-system-curve-form.component';

@NgModule({
  declarations: [
    SystemAndEquipmentCurveComponent, 
    EquipmentCurveFormComponent, 
    SystemCurveComponent, 
    EquipmentCurveComponent, 
    FanSystemCurveFormComponent, 
    PumpSystemCurveFormComponent
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
