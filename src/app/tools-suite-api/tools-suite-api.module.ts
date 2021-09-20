import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PumpsSuiteApiService } from './pumps-suite-api.service';
import { SuiteApiEnumService } from './suite-api-enum.service';
import { FansSuiteApiService } from './fans-suite-api.service';
import { SqlDbApiService } from './sql-db-api.service';
import { ProcessHeatingApiService } from './process-heating-api.service';
import { WasteWaterSuiteApiService } from './waste-water-suite-api.service';
import { ChillersSuiteApiService } from './chillers-suite-api.service';
import { StandaloneSuiteApiService } from './standalone-suite-api.service';
import { CalculatorSuiteApiService } from './calculator-suite-api.service';
import { CompressedAirSuiteApiService } from './compressed-air-suite-api.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    PumpsSuiteApiService,
    SuiteApiEnumService,
    ProcessHeatingApiService,
    FansSuiteApiService,
    SqlDbApiService,
    ChillersSuiteApiService,
    WasteWaterSuiteApiService,
    StandaloneSuiteApiService,
    CalculatorSuiteApiService,
    CompressedAirSuiteApiService
  ]
})
export class ToolsSuiteApiModule { }
