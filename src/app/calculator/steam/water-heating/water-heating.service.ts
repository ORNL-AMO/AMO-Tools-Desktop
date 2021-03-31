import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { WaterHeatingInput, WaterHeatingOutput } from '../../../shared/models/steam/waterHeating';
import { WaterHeatingFormService } from './water-heating-form.service';

declare var processHeatAddon;

@Injectable()
export class WaterHeatingService {

  waterHeatingInput: BehaviorSubject<WaterHeatingInput>;
  waterHeatingOutput: BehaviorSubject<WaterHeatingOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;

  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService, private waterHeatingFormService: WaterHeatingFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.waterHeatingInput = new BehaviorSubject<WaterHeatingInput>(undefined);
    this.waterHeatingOutput = new BehaviorSubject<WaterHeatingOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initDefaultEmptyInputs() {
    let emptyInput: WaterHeatingInput = {
      operatingHours: 8760,
      fuelCost: undefined,
      fuelCostBoiler: undefined,
      effBoiler: undefined,
      waterCost: undefined,
      treatCost: undefined,
      pressureSteamIn: undefined,
      flowSteamRate: undefined,
      hxEffectiveness: undefined,
      temperatureWaterIn: undefined,
      pressureWaterOut: undefined,
      flowWaterRate: undefined,
      effWaterHeater: undefined,
      heatingValueGas: undefined,
      tempMakeupWater: undefined,
      presMakeupWater: undefined
    };
    this.waterHeatingInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: WaterHeatingOutput = {
      enthalpySteamIn: 0,
      enthalpySteamOut: 0,
      bpTempWaterOut: 0,
      tempWaterOut: 0,
      enthalpyMakeupWater: 0,
      flowByPassSteam: 0,
      energySavingsDWH: 0,
      energySavingsBoiler: 0,
      energySavingsTotal: 0,
      waterSavings: 0,
      costSavings: 0,
      costSavingsBoiler: 0,
      costSavingsWNT: 0,
      bpTempWarningFlag: false
    };
    this.waterHeatingOutput.next(emptyOutput);
  }

  calculate(settings: Settings): void {
    let waterHeatingInput: WaterHeatingInput = this.waterHeatingInput.getValue();
    let inputCopy: WaterHeatingInput = JSON.parse(JSON.stringify(waterHeatingInput));
    let validInput: boolean;
    validInput = this.waterHeatingFormService.getWaterHeatingForm(inputCopy, settings).valid;
    
    if(!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
      inputCopy = this.convertInputUnits(inputCopy, settings);
      inputCopy = this.convertPercentInputs(inputCopy);

      let waterHeatingOutput: WaterHeatingOutput = processHeatAddon.waterHeatingUsingSteam(inputCopy);
      
      let heatGainRate = 1000 * 4.1796 * (waterHeatingOutput.tempWaterOut - inputCopy.temperatureWaterIn) * inputCopy.flowWaterRate;
      
      waterHeatingOutput.energySavingsDWH = heatGainRate * inputCopy.operatingHours / inputCopy.effWaterHeater;
      waterHeatingOutput.energySavingsBoiler = (inputCopy.flowSteamRate * (waterHeatingOutput.enthalpySteamOut - waterHeatingOutput.enthalpyMakeupWater) * inputCopy.operatingHours) / inputCopy.effBoiler;
      waterHeatingOutput.energySavingsTotal = waterHeatingOutput.energySavingsBoiler +  waterHeatingOutput.energySavingsDWH;
      
      // TODO check 1000
      // Is this makeupWaterSavings?
      waterHeatingOutput.waterSavings = (inputCopy.flowSteamRate * inputCopy.operatingHours) / 1000;
      // supposed to be DWH?
      waterHeatingOutput.costSavingsWNT = waterHeatingOutput.energySavingsDWH * inputCopy.fuelCost;
      waterHeatingOutput.costSavingsBoiler = waterHeatingOutput.energySavingsBoiler * inputCopy.fuelCostBoiler + waterHeatingOutput.waterSavings * (inputCopy.waterCost + inputCopy.treatCost);
      waterHeatingOutput.costSavings = waterHeatingOutput.costSavingsBoiler + waterHeatingOutput.costSavingsWNT;
      waterHeatingOutput = this.convertResultUnits(waterHeatingOutput, settings);
      
      console.log('output', waterHeatingOutput);
      this.waterHeatingOutput.next(waterHeatingOutput);
    }
  }



  generateExampleData(settings: Settings) {
    let exampleInput: WaterHeatingInput = {
      operatingHours: 8760,
      fuelCost: 6,
      fuelCostBoiler: 6,
      effBoiler: 80,
      waterCost: .002,
      treatCost: .002,
      pressureSteamIn: 8,
      flowSteamRate: 750,
      hxEffectiveness: 72,
      temperatureWaterIn: 55,
      pressureWaterOut: 60,
      flowWaterRate: 12,
      effWaterHeater: 72,
      heatingValueGas: 1015,
      tempMakeupWater: 55,
      presMakeupWater: 15
    };

    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }
    this.waterHeatingInput.next(exampleInput);
  }

  convertPercentInputs(inputs: WaterHeatingInput): WaterHeatingInput {
    inputs.effBoiler = inputs.effBoiler > 0? inputs.effBoiler / 100 : inputs.effBoiler;
    inputs.effWaterHeater = inputs.effWaterHeater > 0? inputs.effWaterHeater / 100 : inputs.effWaterHeater;
    inputs.hxEffectiveness = inputs.hxEffectiveness > 0? inputs.hxEffectiveness / 100 : inputs.hxEffectiveness;
    return inputs;
  }

  
  convertExampleUnits(input: WaterHeatingInput): WaterHeatingInput {
      input.pressureSteamIn = this.convertUnitsService.value(input.pressureSteamIn).from('psig').to('Pa');
      input.pressureSteamIn = this.roundVal(input.pressureSteamIn, 2);

      input.flowSteamRate = this.convertUnitsService.value(input.flowSteamRate).from('lb').to('kg');
      input.flowSteamRate = this.roundVal(input.flowSteamRate, 2);

      input.temperatureWaterIn = this.convertUnitsService.value(input.temperatureWaterIn).from('F').to('C');
      input.temperatureWaterIn = this.roundVal(input.temperatureWaterIn, 2);

      input.pressureWaterOut = this.convertUnitsService.value(input.pressureWaterOut).from('psig').to('Pa');
      input.pressureWaterOut = this.roundVal(input.pressureWaterOut, 2);

      input.flowWaterRate = this.convertUnitsService.value(input.flowWaterRate).from('gpm').to('m3/s');
      input.flowWaterRate = this.roundVal(input.flowWaterRate, 2);

      input.tempMakeupWater = this.convertUnitsService.value(input.tempMakeupWater).from('F').to('C');
      input.tempMakeupWater = this.roundVal(input.tempMakeupWater, 2);
      
      input.presMakeupWater = this.convertUnitsService.value(input.presMakeupWater).from('psig').to('Pa');
      input.presMakeupWater = this.roundVal(input.presMakeupWater, 2);

      input.heatingValueGas = this.convertUnitsService.value(input.heatingValueGas).from('btuSCF').to('kJNm3');
      input.heatingValueGas = this.roundVal(input.heatingValueGas, 2);
  
    return input;
  }

  convertInputUnits(input: WaterHeatingInput, settings: Settings): WaterHeatingInput {
    if (settings.unitsOfMeasure == 'Imperial') {
      input.pressureSteamIn = this.convertUnitsService.value(input.pressureSteamIn).from('psig').to('MPaa');
      input.flowSteamRate = this.convertUnitsService.value(input.flowSteamRate).from('lb').to('kg');
      input.temperatureWaterIn = this.convertUnitsService.value(input.temperatureWaterIn).from('F').to('K');
      input.pressureWaterOut = this.convertUnitsService.value(input.pressureWaterOut).from('psig').to('MPaa');
      input.flowWaterRate = this.convertUnitsService.value(input.flowWaterRate).from('gpm').to('m3/h');
      input.tempMakeupWater = this.convertUnitsService.value(input.tempMakeupWater).from('F').to('K');
      input.presMakeupWater = this.convertUnitsService.value(input.presMakeupWater).from('psig').to('MPaa');
    }

    if (settings.unitsOfMeasure == "Metric") {
      input.pressureSteamIn = this.convertUnitsService.value(input.pressureSteamIn).from('Pa').to('MPaa');
      input.pressureSteamIn = this.roundVal(input.pressureSteamIn, 2);

      input.temperatureWaterIn = this.convertUnitsService.value(input.temperatureWaterIn).from('C').to('K');
      input.temperatureWaterIn = this.roundVal(input.temperatureWaterIn, 2);

      input.pressureWaterOut = this.convertUnitsService.value(input.pressureWaterOut).from('Pa').to('MPaa');
      input.pressureWaterOut = this.roundVal(input.pressureWaterOut, 2);

      input.flowWaterRate = this.convertUnitsService.value(input.flowWaterRate).from('m3/s').to('m3/h');
      input.flowWaterRate = this.roundVal(input.flowWaterRate, 2);

      input.heatingValueGas = this.convertUnitsService.value(input.heatingValueGas).from('kJNm3').to('btuSCF');
      input.heatingValueGas = this.roundVal(input.heatingValueGas, 2);

      input.tempMakeupWater = this.convertUnitsService.value(input.tempMakeupWater).from('C').to('K');
      input.tempMakeupWater = this.roundVal(input.tempMakeupWater, 2);

      input.presMakeupWater = this.convertUnitsService.value(input.presMakeupWater).from('Pa').to('MPaa');
      input.presMakeupWater = this.roundVal(input.presMakeupWater, 2);
    }

    return input;
  }

  convertResultUnits(output: WaterHeatingOutput, settings: Settings): WaterHeatingOutput {
    if (settings.unitsOfMeasure == 'Imperial') {
      output.enthalpySteamIn = this.convertUnitsService.value(output.enthalpySteamIn).from('kJkg').to('btuLb');
      output.enthalpySteamIn = this.roundVal(output.enthalpySteamIn, 2);

      output.enthalpySteamOut = this.convertUnitsService.value(output.enthalpySteamOut).from('kJ').to('Btu');
      output.enthalpySteamOut = this.roundVal(output.enthalpySteamOut, 2);

      output.bpTempWaterOut = this.convertUnitsService.value(output.bpTempWaterOut).from('K').to('F');
      output.bpTempWaterOut = this.roundVal(output.bpTempWaterOut, 2);

      output.tempWaterOut = this.convertUnitsService.value(output.tempWaterOut).from('K').to('F');
      output.tempWaterOut = this.roundVal(output.tempWaterOut, 2);
      
      output.flowByPassSteam = this.convertUnitsService.value(output.flowByPassSteam).from('kg').to('lb');
      output.flowByPassSteam = this.roundVal(output.flowByPassSteam, 2);
    }

    if (settings.unitsOfMeasure == "Metric") {
      output.bpTempWaterOut = this.convertUnitsService.value(output.bpTempWaterOut).from('K').to('C');
      output.bpTempWaterOut = this.roundVal(output.bpTempWaterOut, 2);

      output.tempWaterOut = this.convertUnitsService.value(output.tempWaterOut).from('K').to('C');
      output.tempWaterOut = this.roundVal(output.tempWaterOut, 2);
    }
    return output;
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
