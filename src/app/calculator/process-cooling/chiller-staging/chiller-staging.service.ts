import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { ChillerStagingInput, ChillerStagingOutput } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';
import { ChillerStagingFormService } from './chiller-staging-form.service';

declare var chillersAddon;

@Injectable()
export class ChillerStagingService {
  chillerStagingInput: BehaviorSubject<ChillerStagingInput>;
  chillerStagingOutput: BehaviorSubject<ChillerStagingOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;s
  currentField: BehaviorSubject<string>;

  constructor(private convertUnitsService: ConvertUnitsService, private chillerStagingFormService: ChillerStagingFormService) { 
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
      console.log('input', inputCopy);
      // inputCopy = this.convertInputUnits(inputCopy, settings);
      let chillerStagingOutput: ChillerStagingOutput = chillersAddon.chillerStaging(inputCopy);
      console.log('output', chillerStagingOutput);
      // chillerStagingOutput = this.convertResultUnits(chillerStagingOutput, settings);
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

    // baselineTotalPower:820.5018
    // baselineTotalEnergy:820.5018
    // modTotalPower:603.9089
    // modTotalEnergy:603.9089
    // savingsEnergy:216.5928
    // baselinePowerList 273.5006,273.5006,273.5006
    // modPowerList 301.9545,301.9545,0

    if (settings.unitsOfMeasure == 'Metric') {
      // exampleInput = this.convertExampleUnits(exampleInput);
    }
    this.chillerStagingInput.next(exampleInput);
  }
  
  // convertExampleUnits(input: ChillerStagingInput): ChillerStagingInput {
  //   input.baselineWaterSupplyTemp = this.convertUnitsService.value(input.baselineWaterSupplyTemp).from('F').to('C');
  //   input.baselineWaterSupplyTemp = this.roundVal(input.baselineWaterSupplyTemp, 2);

  //   input.baselineWaterEnteringTemp = this.convertUnitsService.value(input.baselineWaterEnteringTemp).from('F').to('C');
  //   input.baselineWaterEnteringTemp = this.roundVal(input.baselineWaterEnteringTemp, 2);

  //   input.modWaterSupplyTemp = this.convertUnitsService.value(input.modWaterSupplyTemp).from('F').to('C');
  //   input.modWaterSupplyTemp = this.roundVal(input.modWaterSupplyTemp, 2);

  //   input.modWaterEnteringTemp = this.convertUnitsService.value(input.modWaterEnteringTemp).from('F').to('C');
  //   input.modWaterEnteringTemp = this.roundVal(input.modWaterEnteringTemp, 2);

    
  //   input.waterDeltaT = this.convertUnitsService.value(input.waterDeltaT).from('F').to('C');
  //   input.waterDeltaT = this.roundVal(input.waterDeltaT, 2);

  //   input.waterFlowRate = this.convertUnitsService.value(input.waterFlowRate).from('gpm').to('m3/s');
  //   input.waterFlowRate = this.roundVal(input.waterFlowRate, 2);

  //   input.ariCapacity = this.convertUnitsService.value(input.ariCapacity).from('kW').to('hp');
  //   input.ariCapacity = this.roundVal(input.ariCapacity, 2);


  //   return input;
  // }

  // convertInputUnits(input: ChillerStagingInput, settings: Settings): ChillerStagingInput {
  //   if (settings.unitsOfMeasure == "Metric") {
  //     input.baselineWaterSupplyTemp = this.convertUnitsService.value(input.baselineWaterSupplyTemp).from('C').to('F');
  //     input.baselineWaterEnteringTemp = this.convertUnitsService.value(input.baselineWaterEnteringTemp).from('C').to('F');
  //     input.modWaterSupplyTemp = this.convertUnitsService.value(input.modWaterSupplyTemp).from('C').to('F');
  //     input.modWaterEnteringTemp = this.convertUnitsService.value(input.modWaterEnteringTemp).from('C').to('F');
      
  //     input.waterDeltaT = this.convertUnitsService.value(input.waterDeltaT).from('C').to('F');
  //     input.waterFlowRate = this.convertUnitsService.value(input.waterFlowRate).from('m3/s').to('gpm');
  //     input.ariCapacity = this.convertUnitsService.value(input.ariCapacity).from('kW').to('hp');
  //   }
  //   return input;
  // }

  // convertResultUnits(output: ChillerStagingOutput, settings: Settings): ChillerStagingOutput {
  //   if (settings.unitsOfMeasure == "Imperial") {
  //     output.baselinePower = this.convertUnitsService.value(output.baselinePower).from('kW').to('hp');
  //     output.baselinePower = this.roundVal(output.baselinePower, 2);
      
  //     output.modPower = this.convertUnitsService.value(output.modPower).from('kW').to('hp');
  //     output.modPower = this.roundVal(output.modPower, 2);
  //   }
  //   if (settings.unitsOfMeasure == "Metric") {
  //     output.baselineActualCapacity = this.convertUnitsService.value(output.baselineActualCapacity).from('tons').to('kW');
  //     output.baselineActualCapacity = this.roundVal(output.baselineActualCapacity, 2);

  //     output.modActualCapacity = this.convertUnitsService.value(output.modActualCapacity).from('tons').to('kW');
  //     output.modActualCapacity = this.roundVal(output.modActualCapacity, 2);
  //   }
  //   return output;
  // }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
