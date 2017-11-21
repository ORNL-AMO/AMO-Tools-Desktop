import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PercentLoadEstimationFormComponent } from './percent-load-estimation-form/percent-load-estimation-form.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PercentLoadEstimationComponent} from "./percent-load-estimation.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    PercentLoadEstimationComponent,
    PercentLoadEstimationFormComponent
  ],
  exports: [
    PercentLoadEstimationComponent
  ]
})
export class PercentLoadEstimationModule { }
