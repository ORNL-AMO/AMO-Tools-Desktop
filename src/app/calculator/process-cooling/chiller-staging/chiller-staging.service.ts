import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { ChillerStagingInput, ChillerStagingOutput } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';
import { ChillerStagingFormService } from './chiller-staging-form.service';
import { ChillerCalculatorSuiteApiService } from '../../../tools-suite-api/chiller-calculator-suite-api.service';


@Injectable()
export class ChillerStagingService {
  chillerStagingInput: BehaviorSubject<ChillerStagingInput>;
  chillerStagingOutput: BehaviorSubject<ChillerStagingOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;

  constructor(
    private chillersSuiteApiService: ChillerCalculatorSuiteApiService,
    private convertUnitsService: ConvertUnitsService,
    private chillerStagingFormService: ChillerStagingFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.chillerStagingInput = new BehaviorSubject<ChillerStagingInput>(undefined);
    this.chillerStagingOutput = new BehaviorSubject<ChillerStagingOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);   
  }

  initDefaultEmptyInputs(settings: Settings) {
    let emptyInput: ChillerStagingInput = {
      chillerType: 0,
      condenserCoolingType: 0,
      motorDriveType: 0,
      compressorConfigType: 0,
      electricityCost: settings.electricityCost,
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

  getDefaultEmptyOutput(): ChillerStagingOutput {
    let emptyOutput: ChillerStagingOutput = {
      baselineTotalPower: 0,
      baselineTotalEnergy: 0,
      modTotalPower: 0,
      modTotalEnergy: 0,
      savingsEnergy: 0,
      costSavings: 0,
      baselineCost: 0,
      modificationCost: 0,
      baselinePowerList: [],
      modPowerList: [],
    };

    return emptyOutput;
  }

  calculate(settings: Settings, inputs?: ChillerStagingInput) {
    let chillerStagingInput: ChillerStagingInput;
    let inputCopy: ChillerStagingInput;
    if (!inputs){
      chillerStagingInput = this.chillerStagingInput.getValue();
      inputCopy = JSON.parse(JSON.stringify(chillerStagingInput));
    } else {
      inputCopy = JSON.parse(JSON.stringify(inputs));
    }
    let validInput: boolean;
    validInput = this.chillerStagingFormService.getChillerStagingForm(inputCopy).valid;
    
    let chillerStagingOutput: ChillerStagingOutput
    if(!validInput) {
      chillerStagingOutput = this.getDefaultEmptyOutput()
    } else {
      inputCopy = this.convertInputUnits(inputCopy, settings);
      chillerStagingOutput = this.chillersSuiteApiService.chillerStagingEfficiency(inputCopy);
      if (chillerStagingOutput.baselinePowerList && chillerStagingOutput.modPowerList) {
        chillerStagingOutput.chillerLoadResults = [];
        chillerStagingOutput.baselinePowerList.forEach((baselineLoad: number, index) => {
          chillerStagingOutput.chillerLoadResults.push({baseline: baselineLoad, modification: chillerStagingOutput.modPowerList[index]});
        });
        chillerStagingOutput.baselineCost = chillerStagingOutput.baselineTotalEnergy * inputCopy.electricityCost;
        chillerStagingOutput.modificationCost = chillerStagingOutput.modTotalEnergy * inputCopy.electricityCost;
        chillerStagingOutput.costSavings = chillerStagingOutput.baselineCost - chillerStagingOutput.modificationCost;
      }
    }
    return chillerStagingOutput;
  }
  convertInputUnits(input: ChillerStagingInput, settings: Settings): ChillerStagingInput {
    if (settings.unitsOfMeasure == "Metric") {
      input.waterSupplyTemp = this.convertUnitsService.value(input.waterSupplyTemp).from('C').to('F');
      input.waterSupplyTemp = this.roundVal(input.waterSupplyTemp, 2);
      input.waterEnteringTemp = this.convertUnitsService.value(input.waterEnteringTemp).from('C').to('F');
      input.waterEnteringTemp = this.roundVal(input.waterEnteringTemp, 2);
    }
    return input;
  }

  generateExampleData(settings: Settings) {
    let exampleInput: ChillerStagingInput = {
      chillerType: 0,
      condenserCoolingType: 0,
      motorDriveType: 0,
      compressorConfigType: 1,
      electricityCost: settings.electricityCost,
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
