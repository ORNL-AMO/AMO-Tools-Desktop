import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { BagMethodComponent } from './bag-method.component';
import { BagMethodFormComponent } from './bag-method-form/bag-method-form.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
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
