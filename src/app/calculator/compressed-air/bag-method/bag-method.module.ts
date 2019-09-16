import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BagMethodComponent } from './bag-method.component';
import { BagMethodFormComponent } from './bag-method-form/bag-method-form.component';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OperatingHoursModalModule
  ],
  declarations: [
    BagMethodComponent,
    BagMethodFormComponent
  ],
  exports: [
    BagMethodComponent
  ]
})
export class BagMethodModule { }
