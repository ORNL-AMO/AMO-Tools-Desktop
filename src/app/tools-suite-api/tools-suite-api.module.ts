import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PumpsSuiteApiService } from './pumps-suite-api.service';
import { SuiteApiEnumService } from './suite-api-enum.service';
import { FansSuiteApiService } from './fans-suite-api.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    PumpsSuiteApiService,
    SuiteApiEnumService,
    FansSuiteApiService
  ]
})
export class ToolsSuiteApiModule { }
