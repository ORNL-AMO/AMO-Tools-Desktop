import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingReplacementComponent } from './lighting-replacement.component';
import { LightingReplacementFormComponent } from './lighting-replacement-form/lighting-replacement-form.component';
import { LightingReplacementService } from './lighting-replacement.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LightingReplacementResultsComponent } from './lighting-replacement-results/lighting-replacement-results.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [LightingReplacementComponent, LightingReplacementFormComponent, LightingReplacementResultsComponent],
  exports: [LightingReplacementComponent],
  providers: [
    LightingReplacementService
  ]
})
export class LightingReplacementModule { }
