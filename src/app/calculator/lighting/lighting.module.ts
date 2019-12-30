import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingReplacementModule } from './lighting-replacement/lighting-replacement.module';
import { LightingListComponent } from './lighting-list/lighting-list.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    LightingReplacementModule,
    RouterModule
  ],
  declarations: [LightingListComponent],
  exports: [LightingListComponent]
})
export class LightingModule { }
