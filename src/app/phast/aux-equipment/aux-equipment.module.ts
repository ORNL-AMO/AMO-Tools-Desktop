import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuxEquipmentFormComponent } from './aux-equipment-form/aux-equipment-form.component';
import { AuxEquipmentHelpComponent } from './aux-equipment-help/aux-equipment-help.component';
import { AuxEquipmentResultsComponent } from './aux-equipment-results/aux-equipment-results.component';
import { AuxEquipmentComponent } from './aux-equipment.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule
  ],
  declarations: [
    AuxEquipmentFormComponent,
    AuxEquipmentHelpComponent,
    AuxEquipmentResultsComponent,
    AuxEquipmentComponent
  ],
  exports: [
    AuxEquipmentComponent
  ]
})
export class AuxEquipmentModule { }
