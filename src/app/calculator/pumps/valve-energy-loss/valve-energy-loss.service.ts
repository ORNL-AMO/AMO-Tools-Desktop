import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ValveEnergyLossInputs, ValveEnergyLossOutputs, ValveEnergyLossResults } from '../../../shared/models/calculators';
import { OperatingHours } from '../../../shared/models/operations';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { StandaloneService } from '../../standalone.service';
import { ValveEnergyLossFormService } from './valve-energy-loss-form/valve-energy-loss-form.service';

@Injectable()
export class ValveEnergyLossService {

  baselineData: BehaviorSubject<ValveEnergyLossInputs>;
  modificationData: BehaviorSubject<ValveEnergyLossInputs>;
  results: BehaviorSubject<ValveEnergyLossResults>;
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;
  modalOpen: BehaviorSubject<boolean>;

  constructor(private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService, private valveEnergyLossFormService: ValveEnergyLossFormService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<ValveEnergyLossInputs>(undefined);
    this.modificationData = new BehaviorSubject<ValveEnergyLossInputs>(undefined);

    this.results = new BehaviorSubject<ValveEnergyLossResults>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculateEnergyLoss(settings: Settings): ValveEnergyLossResults {
    let baselineInputs: ValveEnergyLossInputs = this.baselineData.getValue();
    let modificationInputs: ValveEnergyLossInputs = this.modificationData.getValue();
    baselineInputs = this.convertInputs(baselineInputs, settings);
    modificationInputs = this.convertInputs(modificationInputs, settings);
    let results: ValveEnergyLossResults = this.standaloneService.valveEnergyLossCalc(baselineInputs, modificationInputs);
    this.convertResults(results, settings);
    this.results.next(results);
    return results;
  }

  generateExampleData(settings: Settings) {
    // Generate example data based on the provided settings
    let baselineExampleInputs: ValveEnergyLossInputs = {
      hoursOperation: 8760,
      electricalRate: 0.05,
      efficiencyPump: 85,
      efficiencyMotor: 95,
      SG: 1,
      flowRate: 5000,
      upstreamPressure: 50,
      upstreamDiameter: 5,
      upstreamHeight: 5,
      valveDiameter: 8,
      downstreamPressure: 45,
      downstreamDiameter: 6,
      downstreamHeight: 2,
      pipeSizeFactor: 1.5,
    };
    let modificationExampleInputs: ValveEnergyLossInputs = {
      hoursOperation: 6140,
      electricalRate: 0.07,
      efficiencyPump: 87,
      efficiencyMotor: 96,
      SG: 1,
      flowRate: 4000,
      upstreamPressure: 60,
      upstreamDiameter: 5,
      upstreamHeight: 5,
      valveDiameter: 8,
      downstreamPressure: 45,
      downstreamDiameter: 6,
      downstreamHeight: 2,
      pipeSizeFactor: 1.5,
    };
    this.modificationData.next(modificationExampleInputs);
    this.baselineData.next(baselineExampleInputs);
    this.generateExample.next(true);
  }

  generateExampleResults() {
    let baselineOutputs: ValveEnergyLossOutputs = {
      headLoss: 14.54,
      powerLossFrictional: 18.38,
      powerLossElectrical: 16.97,
      annualEnergyLoss: 148657,
      annualEnergyCost: 7433.83,
    };
    let modificationOutputs: ValveEnergyLossOutputs = {
      headLoss: 37.31,
      powerLossFrictional: 38.04,
      powerLossElectrical: 33.96,
      annualEnergyLoss: 208540,
      annualEnergyCost: 14597.79,
    };
    let results: ValveEnergyLossResults = {
      baselineOutputs: baselineOutputs,
      modificationOutputs: modificationOutputs,
    };
    this.results.next(results);
  }

  initDefaultEmptyOutput() {
    let emptyOutputs: ValveEnergyLossOutputs = {
      headLoss: 0,
      powerLossFrictional: 0,
      powerLossElectrical: 0,
      annualEnergyLoss: 0,
      annualEnergyCost: 0,
    };
    let results: ValveEnergyLossResults = {
      baselineOutputs: emptyOutputs,
      modificationOutputs: emptyOutputs,
    };
    this.results.next(results);
  }

  initDefaultInputs(treasureHuntHours?: number) {
    let emptyInputs: ValveEnergyLossInputs = {
      hoursOperation: treasureHuntHours ? treasureHuntHours : 8760,
      electricalRate: 0.05,
      efficiencyPump: 85,
      efficiencyMotor: 95,
      SG: 1,
      flowRate: 5000,
      upstreamPressure: 50,
      upstreamDiameter: 5,
      upstreamHeight: 5,
      valveDiameter: 8,
      downstreamPressure: 45,
      downstreamDiameter: 6,
      downstreamHeight: 2,
      pipeSizeFactor: 1.5,
    };
    this.baselineData.next(emptyInputs);
  }

  initEmptyInputs(treasureHuntHours?: number) {
    let emptyInputs: ValveEnergyLossInputs = {
      hoursOperation: treasureHuntHours ? treasureHuntHours : 8760,
      electricalRate: 0,
      efficiencyPump: 0,
      efficiencyMotor: 0,
      SG: 1,
      flowRate: 0,
      upstreamPressure: 0,
      upstreamDiameter: 0,
      upstreamHeight: 0,
      valveDiameter: 0,
      downstreamPressure: 0,
      downstreamDiameter: 0,
      downstreamHeight: 0,
      pipeSizeFactor: 0,
    };
    this.baselineData.next(emptyInputs);
  }

  initModification() {
    let currentBaseline: ValveEnergyLossInputs = this.baselineData.getValue();
    this.modificationData.next(currentBaseline);
  }

  convertInputs(inputs: ValveEnergyLossInputs, settings: Settings): ValveEnergyLossInputs {
    let convertedInputs: ValveEnergyLossInputs = { ...inputs };
    if (settings.unitsOfMeasure === 'Metric') {
      convertedInputs.flowRate = this.convertUnitsService.value(inputs.flowRate).from('L/min').to('gpm');

      convertedInputs.upstreamPressure = this.convertUnitsService.value(inputs.upstreamPressure).from('bar').to('psi');
      convertedInputs.downstreamPressure = this.convertUnitsService.value(inputs.downstreamPressure).from('bar').to('psi');

      convertedInputs.upstreamDiameter = this.convertUnitsService.value(inputs.upstreamDiameter).from('cm').to('in');
      convertedInputs.downstreamDiameter = this.convertUnitsService.value(inputs.downstreamDiameter).from('cm').to('in');

      convertedInputs.upstreamHeight = this.convertUnitsService.value(inputs.upstreamHeight).from('m').to('ft');
      convertedInputs.downstreamHeight = this.convertUnitsService.value(inputs.downstreamHeight).from('m').to('ft');
      
      convertedInputs.valveDiameter = this.convertUnitsService.value(inputs.valveDiameter).from('cm').to('in');
    }
    return convertedInputs;
  }

  convertResults(results: ValveEnergyLossResults, settings: Settings): ValveEnergyLossResults {
    let convertedResults: ValveEnergyLossResults = { ...results };
    if (settings.unitsOfMeasure === 'Metric') {
      convertedResults.baselineOutputs.headLoss = this.convertUnitsService.value(results.baselineOutputs.headLoss).from('ft').to('m');
      convertedResults.modificationOutputs.headLoss = this.convertUnitsService.value(results.modificationOutputs.headLoss).from('ft').to('m');

      convertedResults.baselineOutputs.powerLossFrictional = this.convertUnitsService.value(results.baselineOutputs.powerLossFrictional).from('hp').to('kW');
      convertedResults.modificationOutputs.powerLossFrictional = this.convertUnitsService.value(results.modificationOutputs.powerLossFrictional).from('hp').to('kW');
    }
    return convertedResults;
  }

}
