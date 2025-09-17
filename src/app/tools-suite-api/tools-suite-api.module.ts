import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PumpsSuiteApiService } from './pumps-suite-api.service';
import { FansSuiteApiService } from './fans-suite-api.service';
import { ProcessHeatingApiService } from './process-heating-api.service';
import { WasteWaterSuiteApiService } from './waste-water-suite-api.service';
import { StandaloneSuiteApiService } from './standalone-suite-api.service';
import { SteamSuiteApiService } from './steam-suite-api.service';
import { CalculatorSuiteApiService } from './calculator-suite-api.service';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { CompressedAirSuiteApiService } from './compressed-air-suite-api.service';
import { SviSuiteApiService } from './svi-suite-api.service';
import { WaterSuiteApiService } from './water-suite-api.service';
import { ChillerCalculatorSuiteApiService } from './chiller-calculator-suite-api.service';
import { MotorDataApiService } from './motor-data-api.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    PumpsSuiteApiService,
    SuiteApiHelperService,
    ProcessHeatingApiService,
    FansSuiteApiService,
    ChillerCalculatorSuiteApiService,
    WasteWaterSuiteApiService,
    StandaloneSuiteApiService,
    SteamSuiteApiService,
    CalculatorSuiteApiService,
    CompressedAirSuiteApiService,
    SviSuiteApiService,
    WaterSuiteApiService,
    MotorDataApiService
  ]
})
export class ToolsSuiteApiModule { }
