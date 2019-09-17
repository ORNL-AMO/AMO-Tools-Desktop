import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlowdownRateModalComponent } from './blowdown-rate-modal.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    BlowdownRateModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    BlowdownRateModalComponent
  ]
})
export class BlowdownRateModalModule { }
