import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { WasteHeatInput, WasteHeatOutput, WasteHeatResults } from '../../../shared/models/phast/wasteHeat';
import { Settings } from '../../../shared/models/settings';
import { WasteHeatFormService } from './waste-heat-form.service';

declare var processHeatAddon;

@Injectable()
export class WasteHeatService {

  baselineData: BehaviorSubject<WasteHeatInput>;
  modificationData: BehaviorSubject<WasteHeatInput>;
  wasteHeatOutput: BehaviorSubject<WasteHeatOutput>;
  energySourceType: BehaviorSubject<string>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;

  constructor(private convertUnitsService: ConvertUnitsService, private wasteHeatFormService: WasteHeatFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.baselineData = new BehaviorSubject<WasteHeatInput>(undefined);
    this.modificationData = new BehaviorSubject<WasteHeatInput>(undefined);
    this.wasteHeatOutput = new BehaviorSubject<WasteHeatOutput>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>('default');
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initDefaultEmptyInputs(operationHours: number = 8760) {
    let emptyInput: WasteHeatInput = {
      oppHours: operationHours,
      cost: undefined,
      availableHeat: undefined,
      energySourceType: 'Natural Gas',
      heatInput: undefined,
      hxEfficiency: undefined,
      chillerInTemperature: undefined,
      chillerOutTemperature: undefined,
      copChiller: undefined,
      chillerEfficiency: undefined,
      copCompressor: undefined
    };
    this.baselineData.next(emptyInput);
    this.modificationData.next(undefined);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: WasteHeatOutput = {
      baseline: {
        recoveredHeat: 0,
        hotWaterFlow: 0,
        tonsRefrigeration: 0,
        capacityChiller: 0,
        electricalEnergy: 0,
        annualEnergy: 0,
        annualCost: 0
      },
      modification: {
        recoveredHeat: 0,
        hotWaterFlow: 0,
        tonsRefrigeration: 0,
        capacityChiller: 0,
        electricalEnergy: 0,
        annualEnergy: 0,
        annualCost: 0
      },
    };
    this.wasteHeatOutput.next(emptyOutput);
  }

  calculate(settings: Settings) {
    this.initDefaultEmptyOutputs();
    let output: WasteHeatOutput = this.wasteHeatOutput.getValue();
    
    let baselineWasteHeatInput: WasteHeatInput = this.baselineData.getValue();
    let modificationWasteHeatInput: WasteHeatInput = this.modificationData.getValue();

    let validBaseline = this.wasteHeatFormService.getWasteHeatForm(baselineWasteHeatInput, settings).valid;
    let validModification: boolean;
    if (modificationWasteHeatInput) {
      validModification = this.wasteHeatFormService.getWasteHeatForm(modificationWasteHeatInput, settings).valid;
    }

    if (validBaseline) {
      output.energyUnit = this.getAnnualEnergyUnit(this.energySourceType.getValue(), settings);
      let baselineResults: WasteHeatResults = this.getWasteHeatResults(baselineWasteHeatInput, settings);
      output.baseline = baselineResults;

      let modificationResults: WasteHeatResults;
      if (modificationWasteHeatInput && validModification) {
        modificationResults = this.getWasteHeatResults(modificationWasteHeatInput, settings);
        output.modification = modificationResults;
      }
      if (baselineResults && modificationResults) {
        output.annualEnergySavings = baselineResults.annualEnergy - modificationResults.annualEnergy;
        output.annualCostSavings = baselineResults.annualCost - modificationResults.annualCost;
      }
    }
    this.wasteHeatOutput.next(output);
  }

  getWasteHeatResults(wasteHeatInput: WasteHeatInput, settings: Settings): WasteHeatResults {
    let inputCopy = JSON.parse(JSON.stringify(wasteHeatInput));
    inputCopy = this.convertInputUnits(inputCopy, settings);
    let wasteHeatResults: WasteHeatResults = processHeatAddon.waterHeatingUsingExhaust(inputCopy);
    wasteHeatResults = this.convertResultUnits(wasteHeatResults, settings);
    wasteHeatResults.annualEnergy = wasteHeatResults.electricalEnergy * inputCopy.oppHours;
    wasteHeatResults.annualCost = wasteHeatResults.annualEnergy * inputCopy.cost;
    return wasteHeatResults;
  }

  generateExampleData(settings: Settings) {
    let exampleBaseline: WasteHeatInput = {
      oppHours: 7500,
      cost: .075,
      availableHeat: 69,
      energySourceType: 'Natural Gas',
      heatInput: 6,
      hxEfficiency: 70,
      chillerInTemperature: 190,
      chillerOutTemperature: 170,
      copChiller: .73,
      chillerEfficiency: 88,
      copCompressor: 5
    };
    
    let exampleMod = JSON.parse(JSON.stringify(exampleBaseline));
    exampleMod.hxEfficiency = 85;

    if (settings.unitsOfMeasure == 'Metric') {
      exampleBaseline = this.convertExampleUnits(exampleBaseline);
      exampleMod = this.convertExampleUnits(exampleMod);
    }
    this.baselineData.next(exampleBaseline);
    this.modificationData.next(exampleMod);
    
  }

  
  convertExampleUnits(input: WasteHeatInput): WasteHeatInput {
    input.heatInput = this.convertUnitsService.value(input.heatInput).from('MMBtu').to('GJ');
    input.heatInput = this.roundVal(input.heatInput, 2);

    input.chillerInTemperature = this.convertUnitsService.value(input.chillerInTemperature).from('F').to('C');
    input.chillerInTemperature = this.roundVal(input.chillerInTemperature, 2);

    input.chillerOutTemperature = this.convertUnitsService.value(input.chillerOutTemperature).from('F').to('C');
    input.chillerOutTemperature = this.roundVal(input.chillerOutTemperature, 2);
  
    return input;
  }

  convertInputUnits(input: WasteHeatInput, settings: Settings): WasteHeatInput {
    input.hxEfficiency = input.hxEfficiency > 0? input.hxEfficiency / 100 : input.hxEfficiency;
    input.chillerEfficiency = input.chillerEfficiency > 0? input.chillerEfficiency / 100 : input.chillerEfficiency;
    input.availableHeat = input.availableHeat > 0? input.availableHeat / 100 : input.availableHeat;

    if (settings.unitsOfMeasure == "Metric") {
      input.heatInput = this.convertUnitsService.value(input.heatInput).from('GJ').to('Btu');
      input.heatInput = this.roundVal(input.heatInput, 2);

      input.chillerInTemperature = this.convertUnitsService.value(input.chillerInTemperature).from('C').to('F');
      input.chillerInTemperature = this.roundVal(input.chillerInTemperature, 2);

      input.chillerOutTemperature = this.convertUnitsService.value(input.chillerOutTemperature).from('C').to('F');
      input.chillerOutTemperature = this.roundVal(input.chillerOutTemperature, 2);
    } else {
      input.heatInput = this.convertUnitsService.value(input.heatInput).from('MMBtu').to('Btu');
    }
    return input;
  }

  convertResultUnits(result: WasteHeatResults, settings: Settings): WasteHeatResults {
    result.electricalEnergy = this.convertUnitsService.value(result.electricalEnergy).from('btuhr').to('kW');
    result.electricalEnergy = this.roundVal(result.electricalEnergy, 2);
    if (settings.unitsOfMeasure == "Metric") {
      result.recoveredHeat = this.convertUnitsService.value(result.recoveredHeat).from('Btu').to('GJ');
      result.recoveredHeat = this.roundVal(result.recoveredHeat, 2);

      result.hotWaterFlow = this.convertUnitsService.value(result.hotWaterFlow).from('gal/h').to('m3/h');
      result.hotWaterFlow = this.roundVal(result.hotWaterFlow, 2);

      result.tonsRefrigeration = this.convertUnitsService.value(result.tonsRefrigeration).from('tons').to('kW');
      result.tonsRefrigeration = this.roundVal(result.tonsRefrigeration, 2);

      result.capacityChiller = this.convertUnitsService.value(result.capacityChiller).from('tons').to('kW');
      result.capacityChiller = this.roundVal(result.capacityChiller, 2);

    } else {
      result.recoveredHeat = this.convertUnitsService.value(result.recoveredHeat).from('Btu').to('MMBtu');
      result.recoveredHeat = this.roundVal(result.recoveredHeat, 2);

      result.hotWaterFlow = this.convertUnitsService.value(result.hotWaterFlow).from('gal/h').to('gpm');
      result.hotWaterFlow = this.roundVal(result.hotWaterFlow, 2);
    }
    return result;
  }

  initModification() {
    let currentBaselineData: WasteHeatInput = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    let modification: WasteHeatInput = currentBaselineCopy;
    this.modificationData.next(modification);
  }

  
  getAnnualEnergyUnit(energySourceType: string, settings: Settings) {
    let energyUnit: string = settings.energyResultUnit;
    if (energySourceType === 'Electricity') {
      energyUnit = 'kWh';
    } else if (settings.unitsOfMeasure === 'Metric') {
      energyUnit = 'GJ';
    } else {
      energyUnit = 'MMBtu';
    }
    return energyUnit;
  }


  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}

