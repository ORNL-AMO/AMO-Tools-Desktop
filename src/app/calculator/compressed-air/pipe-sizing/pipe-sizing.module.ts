import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { PipeSizingComponent } from './pipe-sizing.component';
import { PipeSizingFormComponent } from './pipe-sizing-form/pipe-sizing-form.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    PipeSizingComponent,
    PipeSizingFormComponent
  ],
  exports: [
    PipeSizingComponent
  ]
})
export class PipeSizingModule { }
