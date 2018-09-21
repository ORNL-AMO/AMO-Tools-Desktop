import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingReplacementComponent } from './lighting-replacement.component';
import { LightingReplacementFormComponent } from './lighting-replacement-form/lighting-replacement-form.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LightingReplacementComponent, LightingReplacementFormComponent],
  exports: [LightingReplacementComponent]
})
export class LightingReplacementModule { }
