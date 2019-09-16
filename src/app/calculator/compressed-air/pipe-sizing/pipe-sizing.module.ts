import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipeSizingComponent } from './pipe-sizing.component';
import { PipeSizingFormComponent } from './pipe-sizing-form/pipe-sizing-form.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
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
