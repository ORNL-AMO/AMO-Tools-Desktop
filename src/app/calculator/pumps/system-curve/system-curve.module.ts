import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SystemCurveComponent } from './system-curve.component';
import { SystemCurveFormComponent } from './system-curve-form/system-curve-form.component';
import { SystemCurveGraphComponent } from './system-curve-graph/system-curve-graph.component';
import { SystemCurveService } from './system-curve.service';
import { SharedModule } from '../../../shared/shared.module';
import { SystemCurveHelpComponent } from './system-curve-help/system-curve-help.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    SystemCurveComponent,
    SystemCurveFormComponent,
    SystemCurveGraphComponent,
    SystemCurveHelpComponent
  ],
  exports: [
    SystemCurveComponent,
    SystemCurveFormComponent
  ],
  providers: [
    SystemCurveService
  ]
})
export class SystemCurveModule { }
