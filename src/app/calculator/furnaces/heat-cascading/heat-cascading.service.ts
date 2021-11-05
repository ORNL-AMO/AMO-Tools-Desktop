import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { HeatCascadingInput, HeatCascadingOutput } from '../../../shared/models/phast/heatCascading';
import { Settings } from '../../../shared/models/settings';
import { HeatCascadingFormService } from './heat-cascading-form.service';

declare var processHeatAddon;

@Injectable()
export class HeatCascadingService {

  heatCascadingInput: BehaviorSubject<HeatCascadingInput>;
  heatCascadingOutput: BehaviorSubject<HeatCascadingOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;

  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService, private heatCascadingFormService: HeatCascadingFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.heatCascadingInput = new BehaviorSubject<HeatCascadingInput>(undefined);
    this.heatCascadingOutput = new BehaviorSubject<HeatCascadingOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initDefaultEmptyInputs(settings: Settings) {
    let fuelTempf: number = 65;
    let ambientAirTempF: number = 60;
    let combAirMoisturePerc: number = 0;

    if (settings.unitsOfMeasure != 'Imperial') {
      fuelTempf = this.convertUnitsService.value(fuelTempf).from('F').to('C');
      fuelTempf = this.roundVal(fuelTempf, 2);

      ambientAirTempF = this.convertUnitsService.value(ambientAirTempF).from('F').to('C');
      ambientAirTempF = this.roundVal(ambientAirTempF, 2);
    }
    let emptyInput: HeatCascadingInput = {
      utilityType: 'Natural Gas',
      priFiringRate: undefined,
      priExhaustTemperature: undefined,
      priExhaustO2: undefined,
      priCombAirTemperature: undefined,
      priOpHours: undefined,
      fuelHV: 1032.44,
      fuelTempF: fuelTempf, 
      ambientAirTempF: ambientAirTempF, 
      combAirMoisturePerc: combAirMoisturePerc,
      secFiringRate: undefined,
      secExhaustTemperature: undefined,
      secExhaustO2: undefined,
      secCombAirTemperature: undefined,
      secAvailableHeat: undefined,
      secOpHours: undefined,
      fuelCost: undefined,
  
      materialTypeId: 1,
      gasFuelType: true,
      substance: 'Typical Natural Gas - US',
      CH4: 87,
      C2H6: 8.5,
      N2: 3.6,
      H2: .4,
      C3H8: 0,
      C4H10_CnH2n: 0,
      H2O: 0,
      CO: 0,
      CO2: .4,
      SO2: 0,
      O2: .1,
    };
    this.heatCascadingInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: HeatCascadingOutput = {
      priFlueVolume: 0,
      hxEnergyRate: 0,
      eqEnergSupply: 0,
      effOppHours: 0,
      energySavings: 0,
      costSavings: 0,
      priExcessAir: 0,
	    priAvailableHeat: 0,
	    secExcessAir: 0,
	    secAvailableHeat: 0,
    };
    this.heatCascadingOutput.next(emptyOutput);
  }

  calculate(settings: Settings): void {
    let heatCascadingInput: HeatCascadingInput = this.heatCascadingInput.getValue();
    let inputCopy: HeatCascadingInput = JSON.parse(JSON.stringify(heatCascadingInput));
    let validInput: boolean;
    validInput = this.heatCascadingFormService.getHeatCascadingForm(inputCopy).valid;
    
    if(!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
      inputCopy = this.convertInputUnits(inputCopy, settings);
      inputCopy = this.convertPercentInputs(inputCopy);
      let heatCascadingOutput: HeatCascadingOutput = processHeatAddon.cascadeHeatHighToLow(inputCopy);
      heatCascadingOutput = this.convertResultUnits(heatCascadingOutput, settings);
      heatCascadingOutput.priAvailableHeat = heatCascadingOutput.priAvailableHeat * 100;
      heatCascadingOutput.secAvailableHeat = heatCascadingOutput.secAvailableHeat * 100;
      heatCascadingOutput.priExcessAir = heatCascadingOutput.priExcessAir * 100;
      heatCascadingOutput.secExcessAir = heatCascadingOutput.secExcessAir * 100;
      heatCascadingOutput.costSavings = heatCascadingOutput.energySavings * inputCopy.fuelCost;
      heatCascadingOutput.baselineEnergy = inputCopy.secFiringRate * inputCopy.secOpHours;
      heatCascadingOutput.modificationEnergy = inputCopy.secFiringRate * inputCopy.secOpHours - heatCascadingOutput.energySavings;
      this.heatCascadingOutput.next(heatCascadingOutput);
    }
  }

  generateExampleData(settings: Settings) {
    let fuelTempf: number = 65;
    let ambientAirTempF: number = 60;
    let combAirMoisturePerc: number = 0;

    let exampleInput: HeatCascadingInput = {
      utilityType: 'Natural Gas',
      priFiringRate: 12,
      priExhaustTemperature: 1475,
      priExhaustO2: 7,
      priCombAirTemperature: 80,
      priOpHours: 8000,
      fuelHV: 1032.44,
      fuelTempF: fuelTempf, 
      ambientAirTempF: ambientAirTempF, 
      combAirMoisturePerc: combAirMoisturePerc,
  
      secFiringRate: 9.5,
      secExhaustTemperature: 225,
      secExhaustO2: 17.5,
      secCombAirTemperature: 80,
      secAvailableHeat: 100,
      secOpHours: 7000,
      fuelCost: 5,
      
      materialTypeId: 1,
      gasFuelType: true,
      substance: 'Typical Natural Gas - US',
      CH4: 87,
      C2H6: 8.5,
      N2: 3.6,
      H2: .4,
      C3H8: 0,
      C4H10_CnH2n: 0,
      H2O: 0,
      CO: 0,
      CO2: .4,
      SO2: 0,
      O2: .1,
    };


    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }
    this.heatCascadingInput.next(exampleInput);
  }

  convertPercentInputs(inputs: HeatCascadingInput): HeatCascadingInput {
    inputs.priExhaustO2 = inputs.priExhaustO2 > 0? inputs.priExhaustO2 / 100 : inputs.priExhaustO2;
    inputs.secExhaustO2 = inputs.secExhaustO2 > 0? inputs.secExhaustO2 / 100 : inputs.secExhaustO2;
    inputs.combAirMoisturePerc = inputs.combAirMoisturePerc > 0? inputs.combAirMoisturePerc / 100 : inputs.combAirMoisturePerc;
    inputs.secAvailableHeat = inputs.secAvailableHeat > 0? inputs.secAvailableHeat / 100 : inputs.secAvailableHeat;
    return inputs;
  }

  
  convertExampleUnits(input: HeatCascadingInput): HeatCascadingInput {
      input.priExhaustTemperature = this.convertUnitsService.value(input.priExhaustTemperature).from('F').to('C');
      input.priExhaustTemperature = this.roundVal(input.priExhaustTemperature, 2);

      input.priCombAirTemperature = this.convertUnitsService.value(input.priCombAirTemperature).from('F').to('C');
      input.priCombAirTemperature = this.roundVal(input.priCombAirTemperature, 2);
      
      input.secExhaustTemperature = this.convertUnitsService.value(input.secExhaustTemperature).from('F').to('C');
      input.secExhaustTemperature = this.roundVal(input.secExhaustTemperature, 2);

      input.secCombAirTemperature = this.convertUnitsService.value(input.secCombAirTemperature).from('F').to('C');
      input.secCombAirTemperature = this.roundVal(input.secCombAirTemperature, 2);

      input.fuelTempF = this.convertUnitsService.value(input.fuelTempF).from('F').to('C');
      input.fuelTempF = this.roundVal(input.fuelTempF, 2);

      input.ambientAirTempF = this.convertUnitsService.value(input.ambientAirTempF).from('F').to('C');
      input.ambientAirTempF = this.roundVal(input.ambientAirTempF, 2);

      input.priFiringRate = this.convertUnitsService.value(input.priFiringRate).from('MMBtu').to('GJ');
      input.priFiringRate = this.roundVal(input.priFiringRate, 2);

      input.secFiringRate = this.convertUnitsService.value(input.secFiringRate).from('MMBtu').to('GJ');
      input.secFiringRate = this.roundVal(input.secFiringRate, 2);

      //kJNm3?
      input.fuelHV = this.convertUnitsService.value(input.fuelHV).from('btuSCF').to('MJNm3');
      input.fuelHV = this.roundVal(input.fuelHV, 2);
  
    return input;
  }

  convertInputUnits(input: HeatCascadingInput, settings: Settings): HeatCascadingInput {
    if (settings.unitsOfMeasure == "Metric") {
      input.priExhaustTemperature = this.convertUnitsService.value(input.priExhaustTemperature).from('C').to('F');
      input.priExhaustTemperature = this.roundVal(input.priExhaustTemperature, 2);

      input.priCombAirTemperature = this.convertUnitsService.value(input.priCombAirTemperature).from('C').to('F');
      input.priCombAirTemperature = this.roundVal(input.priCombAirTemperature, 2);
      
      input.secExhaustTemperature = this.convertUnitsService.value(input.secExhaustTemperature).from('C').to('F');
      input.secExhaustTemperature = this.roundVal(input.secExhaustTemperature, 2);

      input.secCombAirTemperature = this.convertUnitsService.value(input.secCombAirTemperature).from('C').to('F');
      input.secCombAirTemperature = this.roundVal(input.secCombAirTemperature, 2);

      input.priFiringRate = this.convertUnitsService.value(input.priFiringRate).from('GJ').to('MMBtu');
      input.priFiringRate = this.roundVal(input.priFiringRate, 2);

      input.secFiringRate = this.convertUnitsService.value(input.secFiringRate).from('GJ').to('MMBtu');
      input.secFiringRate = this.roundVal(input.secFiringRate, 2);

      input.fuelTempF = this.convertUnitsService.value(input.fuelTempF).from('C').to('F');
      input.fuelTempF = this.roundVal(input.fuelTempF, 2);

      input.ambientAirTempF = this.convertUnitsService.value(input.ambientAirTempF).from('C').to('F');
      input.ambientAirTempF = this.roundVal(input.ambientAirTempF, 2);

      //kJNm3?
      input.fuelHV = this.convertUnitsService.value(input.fuelHV).from('MJNm3').to('btuSCF');
      input.fuelHV = this.roundVal(input.fuelHV, 2);

    }
    return input;
  }

  convertResultUnits(output: HeatCascadingOutput, settings: Settings): HeatCascadingOutput {
    if (settings.unitsOfMeasure == "Metric") {
      output.energySavings = this.convertUnitsService.value(output.energySavings).from('MMBtu').to('GJ');
      output.energySavings = this.roundVal(output.energySavings, 2);

      output.hxEnergyRate = this.convertUnitsService.value(output.hxEnergyRate).from('MMBtu').to('GJ');
      output.hxEnergyRate = this.roundVal(output.hxEnergyRate, 2);

      output.eqEnergSupply = this.convertUnitsService.value(output.eqEnergSupply).from('MMBtu').to('GJ');
      output.eqEnergSupply = this.roundVal(output.eqEnergSupply, 2);

      output.priFlueVolume = this.convertUnitsService.value(output.priFlueVolume).from('ft3').to('m3');
      output.priFlueVolume = this.roundVal(output.priFlueVolume, 4);
      
    }
    return output;
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}
