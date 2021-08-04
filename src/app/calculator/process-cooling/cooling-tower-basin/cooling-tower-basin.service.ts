import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { CoolingTowerBasinInput, CoolingTowerBasinOutput } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';
import { CoolingTowerBasinFormService } from './cooling-tower-basin-form.service';

declare var chillersAddon;

@Injectable()
export class CoolingTowerBasinService {

  coolingTowerBasinInput: BehaviorSubject<CoolingTowerBasinInput>;
  coolingTowerBasinOutput: BehaviorSubject<CoolingTowerBasinOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;

  constructor(private convertUnitsService: ConvertUnitsService, private coolingTowerBasinFormService: CoolingTowerBasinFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.coolingTowerBasinInput = new BehaviorSubject<CoolingTowerBasinInput>(undefined);
    this.coolingTowerBasinOutput = new BehaviorSubject<CoolingTowerBasinOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
  }

  initDefaultEmptyInputs() {
    let emptyInput: CoolingTowerBasinInput = {
      ratedCapacity: 0,
      ratedTempSetPoint: 0,
      ratedTempDryBulb: 0,
      ratedWindSpeed: 0,
      panLossRatio: .011,
      operatingTempDryBulb: 0,
      operatingWindSpeed: 0,
      operatingHours: 0,
      baselineTempSetPoint: 0,
      modTempSetPoint: 0
    };
    this.coolingTowerBasinInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: CoolingTowerBasinOutput = {
      baselinePower: 0,
      baselineEnergy: 0,
      modPower: 0,
      modEnergy: 0,
      savingsEnergy: 0
    };
    this.coolingTowerBasinOutput.next(emptyOutput);
  }

  calculate(settings: Settings): void {
    let coolingTowerBasinInput: CoolingTowerBasinInput = this.coolingTowerBasinInput.getValue();
    let inputCopy: CoolingTowerBasinInput = JSON.parse(JSON.stringify(coolingTowerBasinInput));
    let validInput: boolean;
    validInput = this.coolingTowerBasinFormService.getCoolingTowerBasinForm(inputCopy).valid;
    
    if(!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
      inputCopy = this.convertInputUnits(inputCopy, settings);
      let coolingTowerBasinOutput: CoolingTowerBasinOutput = chillersAddon.coolingTowerBasinHeaterEnergyConsumption(inputCopy);
      coolingTowerBasinOutput = this.convertResultUnits(coolingTowerBasinOutput, settings);
      this.coolingTowerBasinOutput.next(coolingTowerBasinOutput);
    }
  }

  generateExampleData(settings: Settings) {
    let exampleInput: CoolingTowerBasinInput = {
      ratedCapacity: 1201.67,
      ratedTempSetPoint: 40,
      ratedTempDryBulb: -10,
      ratedWindSpeed: 45,
      panLossRatio: .011,
      operatingTempDryBulb: 28,
      operatingWindSpeed: 9.21,
      operatingHours: 1,
      baselineTempSetPoint: 40,
      modTempSetPoint: 39
    };

    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }
    this.coolingTowerBasinInput.next(exampleInput);
  }
  
  convertExampleUnits(input: CoolingTowerBasinInput): CoolingTowerBasinInput {
    input.ratedTempSetPoint = this.convertUnitsService.value(input.ratedTempSetPoint).from('F').to('C');
    input.ratedTempSetPoint = this.roundVal(input.ratedTempSetPoint, 2);

    input.ratedTempDryBulb = this.convertUnitsService.value(input.ratedTempDryBulb).from('F').to('C');
    input.ratedTempDryBulb = this.roundVal(input.ratedTempDryBulb, 2);
    
    input.ratedWindSpeed = this.convertUnitsService.value(input.ratedWindSpeed).from('mph').to('km/h');
    input.ratedWindSpeed = this.roundVal(input.ratedWindSpeed, 2);

    input.operatingTempDryBulb = this.convertUnitsService.value(input.operatingTempDryBulb).from('F').to('C');
    input.operatingTempDryBulb = this.roundVal(input.operatingTempDryBulb, 2);

    input.operatingWindSpeed = this.convertUnitsService.value(input.operatingWindSpeed).from('mph').to('km/h');
    input.operatingWindSpeed = this.roundVal(input.operatingWindSpeed, 2);

    input.baselineTempSetPoint = this.convertUnitsService.value(input.baselineTempSetPoint).from('F').to('C');
    input.baselineTempSetPoint = this.roundVal(input.baselineTempSetPoint, 2);

    input.modTempSetPoint = this.convertUnitsService.value(input.modTempSetPoint).from('F').to('C');
    input.modTempSetPoint = this.roundVal(input.modTempSetPoint, 2);

    input.ratedCapacity = this.convertUnitsService.value(input.ratedCapacity).from('tons').to('kW');
    input.ratedCapacity = this.roundVal(input.ratedCapacity, 2);

    return input;
  }

  convertInputUnits(input: CoolingTowerBasinInput, settings: Settings): CoolingTowerBasinInput {
    if (settings.unitsOfMeasure == "Metric") {
      input.ratedCapacity = this.convertUnitsService.value(input.ratedCapacity).from('kW').to('tons');
      input.ratedTempSetPoint = this.convertUnitsService.value(input.ratedTempSetPoint).from('C').to('F');
      input.ratedTempDryBulb = this.convertUnitsService.value(input.ratedTempDryBulb).from('C').to('F');
      input.operatingTempDryBulb = this.convertUnitsService.value(input.operatingTempDryBulb).from('C').to('F');
      input.baselineTempSetPoint = this.convertUnitsService.value(input.baselineTempSetPoint).from('C').to('F');
      input.modTempSetPoint = this.convertUnitsService.value(input.modTempSetPoint).from('C').to('F');
    }
    if (settings.unitsOfMeasure == 'Imperial') {
      input.operatingWindSpeed = this.convertUnitsService.value(input.operatingWindSpeed).from('mph').to('km/h');
      input.ratedWindSpeed = this.convertUnitsService.value(input.ratedWindSpeed).from('mph').to('km/h');
    }
    return input;
  }

  convertResultUnits(output: CoolingTowerBasinOutput, settings: Settings): CoolingTowerBasinOutput {
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
