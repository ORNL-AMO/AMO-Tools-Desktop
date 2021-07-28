import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { WasteHeatInput, WasteHeatOutput } from '../../../shared/models/phast/wasteHeat';
import { Settings } from '../../../shared/models/settings';
import { WasteHeatFormService } from './waste-heat-form.service';

declare var processHeatAddon;

@Injectable()
export class WasteHeatService {

  wasteHeatInput: BehaviorSubject<WasteHeatInput>;
  wasteHeatOutput: BehaviorSubject<WasteHeatOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;

  constructor(private convertUnitsService: ConvertUnitsService, private wasteHeatFormService: WasteHeatFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.wasteHeatInput = new BehaviorSubject<WasteHeatInput>(undefined);
    this.wasteHeatOutput = new BehaviorSubject<WasteHeatOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initDefaultEmptyInputs(treasureHuntElectricityCost?: number) {
    let emptyInput: WasteHeatInput = {
      oppHours: 8760,
      cost: treasureHuntElectricityCost,
      availableHeat: undefined,
      heatInput: undefined,
      hxEfficiency: undefined,
      chillerInTemperature: undefined,
      chillerOutTemperature: undefined,
      copChiller: undefined,
      chillerEfficiency: undefined,
      copCompressor: undefined
    };
    this.wasteHeatInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: WasteHeatOutput = {
      recoveredHeat: 0,
      hotWaterFlow: 0,
      tonsRefrigeration: 0,
      capacityChiller: 0,
      electricalEnergy: 0,
      annualEnergy: 0,
      annualCost: 0
    };
    this.wasteHeatOutput.next(emptyOutput);
  }

  calculate(settings: Settings): void {
    let wasteHeatInput: WasteHeatInput = this.wasteHeatInput.getValue();
    let inputCopy: WasteHeatInput = JSON.parse(JSON.stringify(wasteHeatInput));
    let validInput: boolean;
    validInput = this.wasteHeatFormService.getWasteHeatForm(inputCopy, settings).valid;
    
    if(!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
        inputCopy = this.convertInputUnits(inputCopy, settings);
        let wasteHeatOutput: WasteHeatOutput = processHeatAddon.waterHeatingUsingExhaust(inputCopy);
        wasteHeatOutput = this.convertResultUnits(wasteHeatOutput, settings);

        wasteHeatOutput.annualEnergy = wasteHeatOutput.electricalEnergy * inputCopy.oppHours;
        wasteHeatOutput.annualCost = wasteHeatOutput.annualEnergy * inputCopy.cost;
        this.wasteHeatOutput.next(wasteHeatOutput);
    }
  }

  generateExampleData(settings: Settings) {
    let exampleInput: WasteHeatInput = {
      oppHours: 7500,
      cost: .075,
      availableHeat: 69,
      heatInput: 6,
      hxEfficiency: 70,
      chillerInTemperature: 190,
      chillerOutTemperature: 170,
      copChiller: .73,
      chillerEfficiency: 88,
      copCompressor: 5
    };

    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }
    this.wasteHeatInput.next(exampleInput);
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

  convertResultUnits(output: WasteHeatOutput, settings: Settings): WasteHeatOutput {
    output.electricalEnergy = this.convertUnitsService.value(output.electricalEnergy).from('btuhr').to('kW');
    output.electricalEnergy = this.roundVal(output.electricalEnergy, 2);
    if (settings.unitsOfMeasure == "Metric") {
      output.recoveredHeat = this.convertUnitsService.value(output.recoveredHeat).from('Btu').to('GJ');
      output.recoveredHeat = this.roundVal(output.recoveredHeat, 2);

      output.hotWaterFlow = this.convertUnitsService.value(output.hotWaterFlow).from('gal/h').to('m3/h');
      output.hotWaterFlow = this.roundVal(output.hotWaterFlow, 2);

      output.tonsRefrigeration = this.convertUnitsService.value(output.tonsRefrigeration).from('tons').to('kW');
      output.tonsRefrigeration = this.roundVal(output.tonsRefrigeration, 2);

      output.capacityChiller = this.convertUnitsService.value(output.capacityChiller).from('tons').to('kW');
      output.capacityChiller = this.roundVal(output.capacityChiller, 2);

    } else {
      output.recoveredHeat = this.convertUnitsService.value(output.recoveredHeat).from('Btu').to('MMBtu');
      output.recoveredHeat = this.roundVal(output.recoveredHeat, 2);

      output.hotWaterFlow = this.convertUnitsService.value(output.hotWaterFlow).from('gal/h').to('gpm');
      output.hotWaterFlow = this.roundVal(output.hotWaterFlow, 2);
    }
    return output;
  }

  roundVal(val: number, digits: number): number {
    let rounded = Number(val.toFixed(digits));
    return rounded;
  }

}

