import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { SystemCapacityComponent } from './system-capacity.component';
import { SystemCapacityFormComponent } from './system-capacity-form/system-capacity-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    SystemCapacityComponent,
    SystemCapacityFormComponent
  ],
  exports: [
    SystemCapacityComponent
  ]
})
export class SystemCapacityModule { }
