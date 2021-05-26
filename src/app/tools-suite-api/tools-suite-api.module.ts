import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PumpsSuiteApiService } from './pumps-suite-api.service';
import { SuiteApiEnumService } from './suite-api-enum.service';
import { FansSuiteApiService } from './fans-suite-api.service';
import { WasteWaterSuiteApiService } from './waste-water-suite-api.service';
import { ChillersSuiteApiService } from './chillers-suite-api.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    PumpsSuiteApiService,
    SuiteApiEnumService,
    FansSuiteApiService,
    ChillersSuiteApiService,
    WasteWaterSuiteApiService
  ]
})
export class ToolsSuiteApiModule { }
