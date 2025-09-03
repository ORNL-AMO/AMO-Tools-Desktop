import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ValveEnergyLossInputs, ValveEnergyLossResults } from '../../../shared/models/calculators';
import { OperatingHours } from '../../../shared/models/operations';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

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

  constructor(private convertUnitsService: ConvertUnitsService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<ValveEnergyLossInputs>(undefined);
    this.modificationData = new BehaviorSubject<ValveEnergyLossInputs>(undefined);

    this.results = new BehaviorSubject<ValveEnergyLossResults>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculateEnergyLoss(inputs: ValveEnergyLossInputs): ValveEnergyLossResults {
    // TODO call to suite API 
    let results: ValveEnergyLossResults = {
      headLoss: 0,
      powerLossFrictional: 0,
      powerLossElectrical: 0,
      annualEnergyLoss: 0,
      annualEnergyCost: 0,
    };
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
      downstreamHeight: 4,
      pipeSizeFactor: 1.5,
    };
    this.baselineData.next(baselineExampleInputs);

    let modificationExampleInputs: ValveEnergyLossInputs = {
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
      downstreamHeight: 4,
      pipeSizeFactor: 1.5,
    };
    this.baselineData.next(modificationExampleInputs);
  }

  generateExampleResults() {
    let results: ValveEnergyLossResults = {
      headLoss: 14.54,
      powerLossFrictional: 18.38,
      powerLossElectrical: 16.97,
      annualEnergyLoss: 148657,
      annualEnergyCost: 7433.83,
    };
    this.results.next(results);
  }

  initDefaultEmptyOutput() {
    let result: ValveEnergyLossResults = {
      headLoss: 0,
      powerLossFrictional: 0,
      powerLossElectrical: 0,
      annualEnergyLoss: 0,
      annualEnergyCost: 0,
    };
    this.results.next(result);
  }


  initDefaultEmptyInputs(treasureHuntHours?: number) {
    let emptyInputs: ValveEnergyLossInputs = {
      hoursOperation: treasureHuntHours ? treasureHuntHours : 8760,
      electricalRate: 0,
      efficiencyPump: 0,
      efficiencyMotor: 0,
      SG: 0,
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
}
