import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlowdownRateModalComponent } from './blowdown-rate-modal.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    BlowdownRateModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    BlowdownRateModalComponent
  ]
})
export class BlowdownRateModalModule { }
