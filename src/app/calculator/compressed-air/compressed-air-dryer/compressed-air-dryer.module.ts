import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CompressedAirDryerComponent } from './compressed-air-dryer.component';
import { CompressedAirDryersSuiteApiService } from '../../../tools-suite-api/compressed-air-dryer-suite-api.service';

@NgModule({
  declarations: [
    CompressedAirDryerComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  exports: [
    CompressedAirDryerComponent,
  ],
  providers: [
    CompressedAirDryersSuiteApiService,
  ],
})
export class CompressedAirDryerModule { }
