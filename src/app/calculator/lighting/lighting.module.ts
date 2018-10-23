import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingComponent } from './lighting.component';
import { LightingReplacementModule } from './lighting-replacement/lighting-replacement.module';

@NgModule({
  imports: [
    CommonModule,
    LightingReplacementModule
  ],
  declarations: [LightingComponent],
  exports: [LightingComponent]
})
export class LightingModule { }
