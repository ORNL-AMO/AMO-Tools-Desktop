import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { CoolingTowerFanInput, CoolingTowerFanOutput } from '../../../shared/models/chillers';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { CoolingTowerFanFormService } from './cooling-tower-fan-form.service';

declare var chillersAddon: any;

@Injectable()
export class CoolingTowerFanService {

  coolingTowerFanInput: BehaviorSubject<CoolingTowerFanInput>;
  coolingTowerFanOutput: BehaviorSubject<CoolingTowerFanOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;

  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService, private coolingTowerFanFormService: CoolingTowerFanFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.coolingTowerFanInput = new BehaviorSubject<CoolingTowerFanInput>(undefined);
    this.coolingTowerFanOutput = new BehaviorSubject<CoolingTowerFanOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
  }

  initDefaultEmptyInputs() {
    let emptyInput: CoolingTowerFanInput = {
      towerType: 0,
      numCells: 1,
      waterFlowRate: undefined,
      ratedFanPower: undefined,
      waterLeavingTemp: undefined,
      waterEnteringTemp: undefined,
      operatingTempWetBulb: undefined,
      operatingHours: undefined,
      baselineSpeedType: 0,
      modSpeedType: 0,
    };
    this.coolingTowerFanInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: CoolingTowerFanOutput = {
      baselinePower: 0,
      baselineEnergy: 0,
      modPower: 0,
      modEnergy: 0,
      savingsEnergy: 0,
    };
    this.coolingTowerFanOutput.next(emptyOutput);
  }

  calculate(settings: Settings): void {
    let coolingTowerFanInput: CoolingTowerFanInput = this.coolingTowerFanInput.getValue();
    let inputCopy: CoolingTowerFanInput = JSON.parse(JSON.stringify(coolingTowerFanInput));
    let validInput: boolean;
    validInput = this.coolingTowerFanFormService.getCoolingTowerFanForm(inputCopy).valid;
    
    if(!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
      console.log('inputs', inputCopy);
      inputCopy = this.convertInputUnits(inputCopy, settings);
      let coolingTowerFanOutput: CoolingTowerFanOutput = chillersAddon.coolingTowerFanEnergyConsumption(inputCopy);
      console.log('output', coolingTowerFanOutput);
      coolingTowerFanOutput = this.convertResultUnits(coolingTowerFanOutput, settings);
      this.coolingTowerFanOutput.next(coolingTowerFanOutput);
    }
  }

  generateExampleData(settings: Settings) {
    // Example
    let exampleInput: CoolingTowerFanInput = {
      towerType: 0,
      numCells: 1,
      waterFlowRate: 924.90,
      ratedFanPower: 59.5119,
      waterLeavingTemp: 81.6495,
      waterEnteringTemp: 87.98386,
      operatingTempWetBulb: 76,
      operatingHours: 7000,
      baselineSpeedType: 0,
      modSpeedType: 1,
    };

    // Example returns
    // baselinePower: 55.149962
    // baselineEnergy: 41.141872,
    // modPower: 50.503133
    // modEnergy: 37.675337
    // savingsEnergy: 3.466535

    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }
    this.coolingTowerFanInput.next(exampleInput);
  }
  
  convertExampleUnits(input: CoolingTowerFanInput): CoolingTowerFanInput {
    input.waterEnteringTemp = this.convertUnitsService.value(input.waterEnteringTemp).from('F').to('C');
    input.waterEnteringTemp = this.roundVal(input.waterEnteringTemp, 2);

    input.waterLeavingTemp = this.convertUnitsService.value(input.waterLeavingTemp).from('F').to('C');
    input.waterLeavingTemp = this.roundVal(input.waterLeavingTemp, 2);

    input.operatingTempWetBulb = this.convertUnitsService.value(input.operatingTempWetBulb).from('F').to('C');
    input.operatingTempWetBulb = this.roundVal(input.operatingTempWetBulb, 2);

    input.waterFlowRate = this.convertUnitsService.value(input.waterFlowRate).from('gpm').to('m3/s');
    input.waterFlowRate = this.roundVal(input.waterFlowRate, 2);

    input.ratedFanPower = this.convertUnitsService.value(input.ratedFanPower).from('kW').to('hp');
    input.ratedFanPower = this.roundVal(input.ratedFanPower, 2);


    return input;
  }

  convertInputUnits(input: CoolingTowerFanInput, settings: Settings): CoolingTowerFanInput {
    if (settings.unitsOfMeasure == "Metric") {
      input.waterLeavingTemp = this.convertUnitsService.value(input.waterLeavingTemp).from('C').to('F');
      input.waterEnteringTemp = this.convertUnitsService.value(input.waterEnteringTemp).from('C').to('F');
      input.operatingTempWetBulb = this.convertUnitsService.value(input.operatingTempWetBulb).from('C').to('F');
      
      input.ratedFanPower = this.convertUnitsService.value(input.ratedFanPower).from('kW').to('hp');
    }
    return input;
  }

  convertResultUnits(output: CoolingTowerFanOutput, settings: Settings): CoolingTowerFanOutput {
    if (settings.unitsOfMeasure == "Metric") {
      output.baselinePower = this.convertUnitsService.value(output.baselinePower).from('hp').to('kW');
      output.baselinePower = this.roundVal(output.baselinePower, 2);
      
      output.modPower = this.convertUnitsService.value(output.modPower).from('hp').to('kW');
      output.modPower = this.roundVal(output.modPower, 2);
    }

    return output;
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
