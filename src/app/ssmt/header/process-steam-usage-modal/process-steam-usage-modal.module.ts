import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { ProcessSteamUsageModalComponent } from './process-steam-usage-modal.component';

@NgModule({
  declarations: [
    ProcessSteamUsageModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedPipesModule
  ],
  exports: [
    ProcessSteamUsageModalComponent
  ]
})
export class ProcessSteamUsageModalModule { }
