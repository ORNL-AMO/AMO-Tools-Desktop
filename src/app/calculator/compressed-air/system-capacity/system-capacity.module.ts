import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemCapacityComponent } from './system-capacity.component';
import { SystemCapacityFormComponent } from './system-capacity-form/system-capacity-form.component';
import { SystemCapacityService } from './system-capacity.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    SystemCapacityComponent,
    SystemCapacityFormComponent
  ],
  exports: [
    SystemCapacityComponent
  ],
  providers: [
    SystemCapacityService
  ]
})
export class SystemCapacityModule { }
