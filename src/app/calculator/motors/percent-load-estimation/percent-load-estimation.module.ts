import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../../shared/shared.module";

import { PercentLoadEstimationGraphComponent } from './percent-load-estimation-graph/percent-load-estimation-graph.component';
import { PercentLoadEstimationComponent } from "./percent-load-estimation.component";
import { PercentLoadEstimationFormComponent } from './percent-load-estimation-form/percent-load-estimation-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    PercentLoadEstimationComponent,
    PercentLoadEstimationFormComponent,
    PercentLoadEstimationGraphComponent
  ],
  exports: [
    PercentLoadEstimationComponent
  ]
})
export class PercentLoadEstimationModule { }
