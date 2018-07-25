import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StackLossComponent } from './stack-loss.component';
import { StackLossFormComponent } from './stack-loss-form/stack-loss-form.component';
import { StackLossHelpComponent } from './stack-loss-help/stack-loss-help.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StackLossByMassComponent } from './stack-loss-form/stack-loss-by-mass/stack-loss-by-mass.component';
import { StackLossByVolumeComponent } from './stack-loss-form/stack-loss-by-volume/stack-loss-by-volume.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ],
  declarations: [StackLossComponent, StackLossFormComponent, StackLossHelpComponent, StackLossByMassComponent, StackLossByVolumeComponent],
  exports: [StackLossComponent]
})
export class StackLossModule { }
