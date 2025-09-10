import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { CondensingEconomizerInput, CondensingEconomizerOutput, CondensingEconomizerSuiteInput } from '../../../shared/models/steam/condensingEconomizer';
import { ProcessHeatingApiService } from '../../../tools-suite-api/process-heating-api.service';
import { CondensingEconomizerFormService } from './condensing-economizer-form.service';
import { roundVal } from '../../../shared/helperFunctions';

@Injectable()
export class CondensingEconomizerService {

  condensingEconomizerInput: BehaviorSubject<CondensingEconomizerInput>;
  condensingEconomizerOutput: BehaviorSubject<CondensingEconomizerOutput>;

  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;

  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService, 
    private processHeatingApiService: ProcessHeatingApiService, 
    private condensingEconomizerFormService: CondensingEconomizerFormService) {
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.condensingEconomizerInput = new BehaviorSubject<CondensingEconomizerInput>(undefined);
    this.condensingEconomizerOutput = new BehaviorSubject<CondensingEconomizerOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initDefaultEmptyInputs(settings: Settings) {
    let fuelCost: number = settings.fuelCost ? settings.fuelCost : 0;
    let fuelTemp: number = 65;

    if (settings.unitsOfMeasure != 'Imperial') {
      fuelTemp = this.convertUnitsService.value(fuelTemp).from('F').to('C');
      fuelTemp = roundVal(fuelTemp, 2);
    }

    let emptyInput: CondensingEconomizerInput = {
      operatingHours: 8760,
      fuelCost: fuelCost,
      materialTypeId: 1,
      oxygenCalculationMethod: 'Oxygen in Flue Gas',
      flueGasTemperature: undefined,
      modifiedFlueGasTemperature: undefined,
      combustionAirTemperature: undefined,
      fuelTemp: fuelTemp,
      flueGasO2: undefined,
      ambientAirTemperature: undefined,
      moistureInCombustionAir: undefined,
      heatInput: undefined,
      excessAir: 0,
      substance: undefined,
      CH4: undefined,
      C2H6: undefined,
      N2: undefined,
      H2: undefined,
      C3H8: undefined,
      C4H10_CnH2n: undefined,
      H2O: undefined,
      CO: undefined,
      CO2: undefined,
      SO2: undefined,
      O2: undefined
    };
    this.condensingEconomizerInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: CondensingEconomizerOutput = {
      excessAir: undefined,
      flowFlueGas: undefined,
      specHeat: undefined,
      fracCondensed: undefined,
      effThermal: undefined,
      effThermalLH: undefined,
      effLH: undefined,
      heatRecovery: undefined,
      sensibleHeatRecovery: undefined,
      heatRecoveryAnnual: undefined,
      sensibleHeatRecoveryAnnual: undefined,
    };
    this.condensingEconomizerOutput.next(emptyOutput);
  }

  calculate(settings: Settings): void {
    let condensingEconomizerInput: CondensingEconomizerInput = this.condensingEconomizerInput.getValue();
    let inputCopy: CondensingEconomizerInput = JSON.parse(JSON.stringify(condensingEconomizerInput));
    let validInput: boolean;

    validInput = this.condensingEconomizerFormService.getCondensingEconomizerForm(inputCopy, settings).valid;

    if (!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
      inputCopy = this.convertInputUnits(inputCopy, settings);
      let suiteInputInterface: CondensingEconomizerSuiteInput = this.getSuiteInputInterface(inputCopy);

      let condensingEconomizerOutput: CondensingEconomizerOutput = this.processHeatingApiService.airWaterCoolingUsingFlue(suiteInputInterface);
      condensingEconomizerOutput = this.convertResultUnits(condensingEconomizerOutput, settings);
      condensingEconomizerOutput.sensibleHeatRecoveryAnnual = condensingEconomizerOutput.sensibleHeatRecovery * inputCopy.operatingHours;
      condensingEconomizerOutput.heatRecoveryAnnual = condensingEconomizerOutput.heatRecovery * inputCopy.operatingHours;
      condensingEconomizerOutput.annualHeatRecovery = condensingEconomizerOutput.heatRecoveryAnnual + condensingEconomizerOutput.sensibleHeatRecoveryAnnual;
      condensingEconomizerOutput.costSavings = condensingEconomizerOutput.annualHeatRecovery * inputCopy.fuelCost;
      condensingEconomizerOutput.totalHeatRecovery = condensingEconomizerOutput.heatRecovery + condensingEconomizerOutput.sensibleHeatRecovery;
      this.condensingEconomizerOutput.next(condensingEconomizerOutput);
    }
  }

  generateExampleData(settings: Settings) {
    let fuelTemp: number = 60;

    let exampleInput: CondensingEconomizerInput = {
      operatingHours: 8000,
      materialTypeId: 1,
      oxygenCalculationMethod: 'Oxygen in Flue Gas',
      excessAir: 15,
      fuelCost: 5,
      flueGasTemperature: 300,
      modifiedFlueGasTemperature: 40,
      flueGasO2: 2.5,
      fuelTemp: fuelTemp,
      ambientAirTemperature: 60,
      combustionAirTemperature: 70,
      moistureInCombustionAir: 0,
      heatInput: 116,
      substance: undefined,
      CH4: undefined,
      C2H6: undefined,
      N2: undefined,
      H2: undefined,
      C3H8: undefined,
      C4H10_CnH2n: undefined,
      H2O: undefined,
      CO: undefined,
      CO2: undefined,
      SO2: undefined,
      O2: undefined
    };

    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }

    this.condensingEconomizerInput.next(exampleInput);
  }

  getSuiteInputInterface(inputs: CondensingEconomizerInput): CondensingEconomizerSuiteInput {
    return {
      heatInput: inputs.heatInput,
      tempFlueGasInF: inputs.flueGasTemperature,
      tempFlueGasOutF: inputs.modifiedFlueGasTemperature,
      tempCombAirF: inputs.combustionAirTemperature,
      fuelTempF: inputs.fuelTemp,
      percO2: inputs.flueGasO2,
      ambientAirTempF: inputs.ambientAirTemperature,
      moistCombAir: inputs.moistureInCombustionAir,
      substance: inputs.substance,
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
    }
  }

  convertPercentToFraction(percentInput: number): number {
    if (percentInput > 0) {
      return percentInput / 100;
    } else {
      return percentInput;
    }
  }

  convertFractionToPercent(value: number): number {
    if (value > 0) {
      return value * 100;
    } else {
      return value;
    }
  }

  convertExampleUnits(input: CondensingEconomizerInput): CondensingEconomizerInput {
    input.flueGasTemperature = this.convertUnitsService.value(input.flueGasTemperature).from('F').to('C');
    input.modifiedFlueGasTemperature = this.convertUnitsService.value(input.modifiedFlueGasTemperature).from('F').to('C');
    input.combustionAirTemperature = this.convertUnitsService.value(input.combustionAirTemperature).from('F').to('C');
    input.ambientAirTemperature = this.convertUnitsService.value(input.ambientAirTemperature).from('F').to('C');
    input.heatInput = this.convertUnitsService.value(input.heatInput).from('MMBtu').to('MJ');
    input.fuelTemp = this.convertUnitsService.value(input.fuelTemp).from('F').to('C');

    return input;
  }

  convertInputUnits(input: CondensingEconomizerInput, settings: Settings): CondensingEconomizerInput {
    input.flueGasO2 = this.convertPercentToFraction(input.flueGasO2);
    input.moistureInCombustionAir = this.convertPercentToFraction(input.moistureInCombustionAir);

    if (settings.unitsOfMeasure == "Metric") {
      input.fuelTemp = this.convertUnitsService.value(input.fuelTemp).from('C').to('F');
      input.flueGasTemperature = this.convertUnitsService.value(input.flueGasTemperature).from('C').to('F');
      input.modifiedFlueGasTemperature = this.convertUnitsService.value(input.modifiedFlueGasTemperature).from('C').to('F');
      input.ambientAirTemperature = this.convertUnitsService.value(input.ambientAirTemperature).from('C').to('F');
      input.combustionAirTemperature = this.convertUnitsService.value(input.combustionAirTemperature).from('C').to('F');
      input.heatInput = this.convertUnitsService.value(input.heatInput).from('MJ').to('MMBtu');
    }
    return input;
  }

  convertResultUnits(output: CondensingEconomizerOutput, settings: Settings): CondensingEconomizerOutput {
    output.excessAir = this.convertFractionToPercent(output.excessAir);
    output.effThermal = this.convertFractionToPercent(output.effThermal);
    output.effLH = this.convertFractionToPercent(output.effLH);
    output.effThermalLH = this.convertFractionToPercent(output.effThermalLH);
    output.fracCondensed = this.convertFractionToPercent(output.fracCondensed);

    if (settings.unitsOfMeasure == "Metric") {
      output.flowFlueGas = this.convertUnitsService.value(output.flowFlueGas).from('lb').to('kg');
      output.flowFlueGas = roundVal(output.flowFlueGas, 2);

      output.effThermal = this.convertUnitsService.value(output.effThermal).from('MMBtu').to('MJ');
      output.effThermal = roundVal(output.effThermal, 2);

      output.effThermalLH = this.convertUnitsService.value(output.effThermalLH).from('MMBtu').to('MJ');
      output.effThermalLH = roundVal(output.effThermalLH, 2);

      output.heatRecovery = this.convertUnitsService.value(output.heatRecovery).from('MMBtu').to('MJ');
      output.heatRecovery = roundVal(output.heatRecovery, 2);
    }
    return output;
  }
}