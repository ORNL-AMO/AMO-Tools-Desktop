import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemAndEquipmentCurveComponent } from './system-and-equipment-curve.component';
import { SystemAndEquipmentCurveService } from './system-and-equipment-curve.service';
import { SystemCurveComponent } from './system-curve/system-curve.component';
import { EquipmentCurveComponent } from './equipment-curve/equipment-curve.component';
import { FanSystemCurveFormComponent } from './system-curve/fan-system-curve-form/fan-system-curve-form.component';
import { PumpSystemCurveFormComponent } from './system-curve/pump-system-curve-form/pump-system-curve-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { PumpSystemCurveFormService } from './system-curve/pump-system-curve-form.service';
import { FanSystemCurveFormService } from './system-curve/fan-system-curve-form.service';
import { SystemAndEquipmentCurveHelpComponent } from './system-and-equipment-curve-help/system-and-equipment-curve-help.component';
import { FanCurveHelpComponent } from './system-and-equipment-curve-help/fan-curve-help/fan-curve-help.component';
import { FanSystemCurveHelpComponent } from './system-and-equipment-curve-help/fan-system-curve-help/fan-system-curve-help.component';
import { PumpSystemCurveHelpComponent } from './system-and-equipment-curve-help/pump-system-curve-help/pump-system-curve-help.component';
import { PumpCurveHelpComponent } from './system-and-equipment-curve-help/pump-curve-help/pump-curve-help.component';
import { ByDataFormComponent } from './equipment-curve/by-data-form/by-data-form.component';
import { ByEquationFormComponent } from './equipment-curve/by-equation-form/by-equation-form.component';
import { EquipmentCurveFormComponent } from './equipment-curve/equipment-curve-form/equipment-curve-form.component';
import { EquipmentCurveService } from './equipment-curve/equipment-curve.service';

@NgModule({
  declarations: [
    SystemAndEquipmentCurveComponent,
    SystemCurveComponent,
    EquipmentCurveComponent,
    FanSystemCurveFormComponent,
    PumpSystemCurveFormComponent, 
    SystemAndEquipmentCurveHelpComponent, 
    FanCurveHelpComponent, 
    FanSystemCurveHelpComponent, 
    PumpSystemCurveHelpComponent, 
    PumpCurveHelpComponent, ByDataFormComponent, ByEquationFormComponent, EquipmentCurveFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedPipesModule
  ],
  providers: [
    SystemAndEquipmentCurveService,
    PumpSystemCurveFormService,
    FanSystemCurveFormService,
    EquipmentCurveService
  ],
  exports: [
    SystemAndEquipmentCurveComponent
  ]
})
export class SystemAndEquipmentCurveModule { }
