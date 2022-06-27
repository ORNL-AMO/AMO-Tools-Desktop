import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { ChillerStagingInput, ChillerStagingOutput } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';
import { ChillersSuiteApiService } from '../../../tools-suite-api/chillers-suite-api.service';
import { ChillerStagingFormService } from './chiller-staging-form.service';


@Injectable()
export class ChillerStagingService {
  chillerStagingInput: BehaviorSubject<ChillerStagingInput>;
  chillerStagingOutput: BehaviorSubject<ChillerStagingOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;

  constructor(
    private chillersSuiteApiService: ChillersSuiteApiService,
    private chillerStagingFormService: ChillerStagingFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.chillerStagingInput = new BehaviorSubject<ChillerStagingInput>(undefined);
    this.chillerStagingOutput = new BehaviorSubject<ChillerStagingOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);   
  }

  initDefaultEmptyInputs() {
    let emptyInput: ChillerStagingInput = {
      chillerType: 0,
      condenserCoolingType: 0,
      motorDriveType: 0,
      compressorConfigType: 0,
      ariCapacity: 0,
      ariEfficiency: 0,
      maxCapacityRatio: 0,
      coolingLoad: 0,
      operatingHours: 0,
      waterSupplyTemp: 0,
      waterEnteringTemp: 0,
      baselineLoadList: [0],
      modLoadList: [0]
    };
    this.chillerStagingInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: ChillerStagingOutput = {
      baselineTotalPower: 0,
      baselineTotalEnergy: 0,
      modTotalPower: 0,
      modTotalEnergy: 0,
      savingsEnergy: 0,
      baselinePowerList: [],
      modPowerList: [],
    };
    this.chillerStagingOutput.next(emptyOutput);
  }

  calculate(settings: Settings): void {
    let chillerStagingInput: ChillerStagingInput = this.chillerStagingInput.getValue();
    let inputCopy: ChillerStagingInput = JSON.parse(JSON.stringify(chillerStagingInput));
    let validInput: boolean;
    validInput = this.chillerStagingFormService.getChillerStagingForm(inputCopy).valid;
    
    if(!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
      let chillerStagingOutput: ChillerStagingOutput = this.chillersSuiteApiService.chillerStagingEfficiency(inputCopy);
      if (chillerStagingOutput.baselinePowerList && chillerStagingOutput.modPowerList) {
        chillerStagingOutput.chillerLoadResults = [];
        chillerStagingOutput.baselinePowerList.forEach((baselineLoad: number, index) => {
          chillerStagingOutput.chillerLoadResults.push({baseline: baselineLoad, modification: chillerStagingOutput.modPowerList[index]});
        });
      }
      this.chillerStagingOutput.next(chillerStagingOutput);
    }
  }

  generateExampleData(settings: Settings) {
    let exampleInput: ChillerStagingInput = {
      chillerType: 0,
      condenserCoolingType: 0,
      motorDriveType: 0,
      compressorConfigType: 1,
      ariCapacity: 1000,
      ariEfficiency: 0.676,
      maxCapacityRatio: 1.0,
      coolingLoad: 0,
      operatingHours: 1.0,
      waterSupplyTemp: 42,
      waterEnteringTemp: 82.12,
      baselineLoadList: [300, 300, 300],
      modLoadList: [450, 450, 0],
    };

    this.chillerStagingInput.next(exampleInput);
  }
  
  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
