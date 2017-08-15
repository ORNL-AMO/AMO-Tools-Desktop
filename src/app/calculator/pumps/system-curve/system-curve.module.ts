import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SystemCurveComponent } from './system-curve.component';
import { SystemCurveFormComponent } from './system-curve-form/system-curve-form.component';
import { SystemCurveGraphComponent } from './system-curve-graph/system-curve-graph.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    SystemCurveComponent,
    SystemCurveFormComponent,
    SystemCurveGraphComponent
  ],
   exports: [
     SystemCurveComponent
   ]
})
export class SystemCurveModule { }
