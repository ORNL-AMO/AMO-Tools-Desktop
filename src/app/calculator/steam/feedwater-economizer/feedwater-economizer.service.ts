import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { FeedwaterEconomizerInput, FeedwaterEconomizerOutput, FeedwaterEconomizerSuiteInput } from '../../../shared/models/steam/feedwaterEconomizer';
import { ProcessHeatingApiService } from '../../../tools-suite-api/process-heating-api.service';
import { FeedwaterEconomizerFormService } from './feedwater-economizer-form.service';

@Injectable()
export class FeedwaterEconomizerService {

  feedwaterEconomizerInput: BehaviorSubject<FeedwaterEconomizerInput>;
  feedwaterEconomizerOutput: BehaviorSubject<FeedwaterEconomizerOutput>;

  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;

  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService, 
    private processHeatingApiService: ProcessHeatingApiService, 
    private feedwaterEconomizerFormService: FeedwaterEconomizerFormService) {
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.feedwaterEconomizerInput = new BehaviorSubject<FeedwaterEconomizerInput>(undefined);
    this.feedwaterEconomizerOutput = new BehaviorSubject<FeedwaterEconomizerOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initDefaultEmptyInputs(settings: Settings) {
    let fuelCost: number = settings.fuelCost ? settings.fuelCost : 0;
    let fuelTemp: number = 65;

    if (settings.unitsOfMeasure != 'Imperial') {
      fuelTemp = this.convertUnitsService.value(fuelTemp).from('F').to('C');
      fuelTemp = this.roundVal(fuelTemp, 2);
    }

    let emptyInput: FeedwaterEconomizerInput = {
      operatingHours: 8760,
      fuelCost: fuelCost,
      materialTypeId: 1,
      oxygenCalculationMethod: 'Excess Air',
      substance: 'Gas',
      flueGasTemperature: undefined,
      flueGasO2: undefined,
      fuelTemp: fuelTemp,
      excessAir: 0,
      combustionAirTemperature: undefined,
      moistureInCombustionAir: undefined,
      ambientAirTemperature: undefined,
      energyRateInput: undefined,
      steamPressure: undefined,
      steamCondition: 0,
      steamTemperature: undefined,
      feedWaterTemperature: undefined,
      percBlowdown: undefined,
      hxEfficiency: undefined,
      higherHeatingVal: undefined,
    };
    this.feedwaterEconomizerInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: FeedwaterEconomizerOutput = {
      effBoiler: undefined,
      tempSteamSat: undefined,
      enthalpySteam: undefined,
      enthalpyFW: undefined,
      flowSteam: undefined,
      flowFW: undefined,
      flowFlueGas: undefined,
      heatCapacityFG: undefined,
      specHeatFG: undefined,
      heatCapacityFW: undefined,
      specHeatFW: undefined,
      ratingHeatRecFW: undefined,
      tempFlueGasOut: undefined,
      tempFWOut: undefined,
      energySavingsBoiler: undefined,
      costSavingsBoiler: undefined,
      energySavedTotal: undefined
    };
    this.feedwaterEconomizerOutput.next(emptyOutput);
  }

  calculate(settings: Settings): void {
    let feedwaterEconomizerInput: FeedwaterEconomizerInput = this.feedwaterEconomizerInput.getValue();
    let inputCopy: FeedwaterEconomizerInput = JSON.parse(JSON.stringify(feedwaterEconomizerInput));
    let validInput: boolean = this.feedwaterEconomizerFormService.getFeedwaterEconomizerForm(inputCopy, settings).valid;

    if (!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
      inputCopy = this.convertInputUnits(inputCopy, settings);
      let suiteInputInterface: FeedwaterEconomizerSuiteInput = this.getSuiteInputInterface(inputCopy);

      let feedwaterEconomizerOutput: FeedwaterEconomizerOutput = this.processHeatingApiService.waterHeatingUsingFlue(suiteInputInterface);
      feedwaterEconomizerOutput = this.convertResultUnits(feedwaterEconomizerOutput, settings);

      this.feedwaterEconomizerOutput.next(feedwaterEconomizerOutput);
    }
  }

  generateExampleData(settings: Settings) {
    let exampleInput: FeedwaterEconomizerInput = {
      operatingHours: 8000,
      materialTypeId: 1,
      oxygenCalculationMethod: 'Oxygen in Flue Gas',
      excessAir: 15,
      fuelCost: 5,
      ambientAirTemperature: 80,
      flueGasTemperature: 725,
      flueGasO2: 5,
      fuelTemp: 65,
      combustionAirTemperature: 80,
      moistureInCombustionAir: 1,
      energyRateInput: 53,
      steamPressure: 500,
      steamCondition: 1,
      steamTemperature: 500,
      feedWaterTemperature: 225,
      percBlowdown: 4,
      hxEfficiency: 62.5,
      higherHeatingVal: 1032.44,
    };

    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }

    this.feedwaterEconomizerInput.next(exampleInput);
  }

  getSuiteInputInterface(inputs: FeedwaterEconomizerInput): FeedwaterEconomizerSuiteInput {
    return {
      tempFlueGas: inputs.flueGasTemperature,
      percO2: inputs.flueGasO2,
      tempCombAir: inputs.combustionAirTemperature,
      moistCombAir: inputs.moistureInCombustionAir,
      ratingBoiler: inputs.energyRateInput,
      prSteam: inputs.steamPressure,
      condSteam: inputs.steamCondition,
      tempAmbientAir: inputs.ambientAirTemperature,
      tempSteam: inputs.steamTemperature || 0,
      tempFW: inputs.feedWaterTemperature,
      percBlowDown: inputs.percBlowdown,
      effHX: inputs.hxEfficiency,
      opHours: inputs.operatingHours,
      costFuel: inputs.fuelCost,
      fuelTempF: inputs.fuelTemp,
      hhvFuel: inputs.higherHeatingVal,
      CH4: inputs.CH4,
      C2H6: inputs.C2H6,
      N2: inputs.N2,
      H2: inputs.H2,
      C3H8: inputs.C3H8,
      C4H10_CnH2n: inputs.C4H10_CnH2n,
      H2O: inputs.H2O,
      CO: inputs.CO,
      CO2: inputs.CO2,
      SO2: inputs.SO2,
      O2: inputs.O2,
      substance: inputs.substance,
    }
  }

  convertPercentToFraction(percentInput: number): number {
    return percentInput > 0 ? percentInput / 100 : percentInput;
  }

  convertExampleUnits(input: FeedwaterEconomizerInput): FeedwaterEconomizerInput {
    input.flueGasTemperature = this.convertUnitsService.value(input.flueGasTemperature).from('F').to('C');
    input.combustionAirTemperature = this.convertUnitsService.value(input.combustionAirTemperature).from('F').to('C');
    input.steamTemperature = this.convertUnitsService.value(input.steamTemperature).from('F').to('C');
    input.feedWaterTemperature = this.convertUnitsService.value(input.feedWaterTemperature).from('F').to('C');
    input.energyRateInput = this.convertUnitsService.value(input.energyRateInput).from('MMBtu').to('kJ');
    input.steamPressure = this.convertUnitsService.value(input.steamPressure).from('psig').to('Pa');
    input.fuelTemp = this.convertUnitsService.value(input.fuelTemp).from('F').to('C');
    input.ambientAirTemperature = this.convertUnitsService.value(input.ambientAirTemperature).from('F').to('C');
    //todo
    input.higherHeatingVal = this.convertUnitsService.value(input.higherHeatingVal).from('btuscf').to('kJNm3');

    return input;
  }

  convertInputUnits(input: FeedwaterEconomizerInput, settings: Settings): FeedwaterEconomizerInput {
    input.hxEfficiency = this.convertPercentToFraction(input.hxEfficiency);
    input.percBlowdown = this.convertPercentToFraction(input.percBlowdown);
    input.flueGasO2 = this.convertPercentToFraction(input.flueGasO2);
    input.moistureInCombustionAir = this.convertPercentToFraction(input.moistureInCombustionAir);

    if (settings.unitsOfMeasure == 'Imperial') {
      input.energyRateInput = this.convertUnitsService.value(input.energyRateInput).from('MMBtu').to('GJ');
      input.steamPressure = this.convertUnitsService.value(input.steamPressure).from('psig').to('MPaa');
      input.higherHeatingVal = this.convertUnitsService.value(input.higherHeatingVal).from('btuscf').to('kJNm3');
    }
    if (settings.unitsOfMeasure == "Metric") {
      input.fuelTemp = this.convertUnitsService.value(input.fuelTemp).from('C').to('F');
      input.flueGasTemperature = this.convertUnitsService.value(input.flueGasTemperature).from('C').to('F');
      input.combustionAirTemperature = this.convertUnitsService.value(input.combustionAirTemperature).from('C').to('F');
      input.ambientAirTemperature = this.convertUnitsService.value(input.ambientAirTemperature).from('C').to('F');
      input.steamTemperature = this.convertUnitsService.value(input.steamTemperature).from('C').to('F');
      input.feedWaterTemperature = this.convertUnitsService.value(input.feedWaterTemperature).from('C').to('F');
      input.energyRateInput = this.convertUnitsService.value(input.energyRateInput).from('kJ').to('GJ');
      input.steamPressure = this.convertUnitsService.value(input.steamPressure).from('Pa').to('MPaa');
    }
    return input;
  }

  convertResultUnits(output: FeedwaterEconomizerOutput, settings: Settings): FeedwaterEconomizerOutput {
    output.effBoiler = output.effBoiler > 0 ? output.effBoiler * 100 : output.effBoiler;
    if (settings.unitsOfMeasure == 'Imperial') {
      output.tempSteamSat = this.convertUnitsService.value(output.tempSteamSat).from('K').to('F');
      output.tempSteamSat = this.roundVal(output.tempSteamSat, 2);

      output.enthalpySteam = this.convertUnitsService.value(output.enthalpySteam).from('kJkg').to('btuLb');
      output.enthalpySteam = this.roundVal(output.enthalpySteam, 2);

      output.enthalpyFW = this.convertUnitsService.value(output.enthalpyFW).from('kJkg').to('btuLb');
      output.enthalpyFW = this.roundVal(output.enthalpyFW, 2);

      output.flowSteam = this.convertUnitsService.value(output.flowSteam).from('kg').to('lb');
      output.flowSteam = this.roundVal(output.flowSteam, 2);

      output.flowFW = this.convertUnitsService.value(output.flowFW).from('kg').to('lb');
      output.flowFW = this.roundVal(output.flowFW, 2);

      output.flowFlueGas = this.convertUnitsService.value(output.flowFlueGas).from('kg').to('lb');
      output.flowFlueGas = this.roundVal(output.flowFlueGas, 2);

      output.heatCapacityFG = this.convertUnitsService.value(output.heatCapacityFG).from('kJ').to('Btu');
      output.heatCapacityFG = this.roundVal(output.heatCapacityFG, 2);

      output.specHeatFG = this.convertUnitsService.value(output.specHeatFG).from('kJkgK').to('btulbF');
      output.specHeatFG = this.roundVal(output.specHeatFG, 2);

      output.specHeatFW = this.convertUnitsService.value(output.specHeatFW).from('kJkgK').to('btulbF');
      output.specHeatFW = this.roundVal(output.specHeatFW, 2);

      output.heatCapacityFW = this.convertUnitsService.value(output.heatCapacityFW).from('kJ').to('Btu');
      output.heatCapacityFW = this.roundVal(output.heatCapacityFW, 2);

      output.ratingHeatRecFW = this.convertUnitsService.value(output.ratingHeatRecFW).from('kJ').to('Btu');
      output.ratingHeatRecFW = this.roundVal(output.ratingHeatRecFW, 2);

      output.tempFlueGasOut = this.convertUnitsService.value(output.tempFlueGasOut).from('K').to('F');
      output.tempFlueGasOut = this.roundVal(output.tempFlueGasOut, 2);

      output.tempFWOut = this.convertUnitsService.value(output.tempFWOut).from('K').to('F');
      output.tempFWOut = this.roundVal(output.tempFWOut, 2);
    }

    if (settings.unitsOfMeasure == "Metric") {
      output.tempSteamSat = this.convertUnitsService.value(output.tempSteamSat).from('K').to('C');
      output.tempSteamSat = this.roundVal(output.tempSteamSat, 2);

      output.tempFlueGasOut = this.convertUnitsService.value(output.tempFlueGasOut).from('K').to('C');
      output.tempFlueGasOut = this.roundVal(output.tempFlueGasOut, 2);

      output.tempFWOut = this.convertUnitsService.value(output.tempFWOut).from('K').to('C');
      output.tempFWOut = this.roundVal(output.tempFWOut, 2);

      output.energySavingsBoiler = this.convertUnitsService.value(output.energySavingsBoiler).from('MMBtu').to('GJ');
      output.energySavingsBoiler = this.roundVal(output.energySavingsBoiler, 2);
    }
    return output;
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

  getTreasureHuntFuelCost(energySourceType: string, settings: Settings) {
    switch (energySourceType) {
      case 'Natural Gas':
        return settings.fuelCost;
      case 'Other Fuel':
        return settings.otherFuelCost;
      case 'Electricity':
        return settings.electricityCost;
      case 'Steam':
        return settings.steamCost;
    }
  }

}
