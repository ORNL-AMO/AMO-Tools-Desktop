import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { OperatingHours } from '../../../shared/models/operations';
import { AtmosphereLoss, AtmosphereLossOutput, AtmosphereLossResults } from '../../../shared/models/phast/losses/atmosphereLoss';
import { Settings } from '../../../shared/models/settings';
import { AtmosphereFormService } from './atmosphere-form.service';

@Injectable()
export class AtmosphereService {

  baselineData: BehaviorSubject<AtmosphereLoss>;
  modificationData: BehaviorSubject<AtmosphereLoss>;
  output: BehaviorSubject<AtmosphereLossOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  energySourceType: BehaviorSubject<string>;

  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private atmosphereFormService: AtmosphereFormService, private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<AtmosphereLoss>(undefined);
    this.modificationData = new BehaviorSubject<AtmosphereLoss>(undefined);
    this.output = new BehaviorSubject<AtmosphereLossOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculate(settings: Settings) {
    let baselineAtmosphereLoss = this.baselineData.getValue();
    let modificationAtmosphereLoss = this.modificationData.getValue();
    let baselineResults: AtmosphereLossResults;
    let modificationResults: AtmosphereLossResults;

    this.initDefaultEmptyOutput();
    let output: AtmosphereLossOutput = this.output.getValue();
    output.energyUnit = this.getAnnualEnergyUnit(baselineAtmosphereLoss.energySourceType, settings);

    let validBaseline = this.atmosphereFormService.getAtmosphereForm(baselineAtmosphereLoss, false).valid;
    if (validBaseline) {
      baselineResults = this.getAtmosphereLossResult(baselineAtmosphereLoss, settings);
      if (baselineResults) {
        output.baseline = baselineResults;
      }
    }

    if (modificationAtmosphereLoss) {
      let validModification = this.atmosphereFormService.getAtmosphereForm(modificationAtmosphereLoss, false).valid;
      if (validModification) {
        modificationResults = this.getAtmosphereLossResult(modificationAtmosphereLoss, settings);
        if (modificationResults) {
          output.modification = modificationResults;
        }
      }
    }

    if (baselineResults && modificationResults) {
      output.fuelSavings = baselineResults.fuelUse - modificationResults.fuelUse;
      output.costSavings = baselineResults.fuelCost - modificationResults.fuelCost;
    }
    this.output.next(output);
  }

  getAtmosphereLossResult(atmosphereLossData: AtmosphereLoss, settings: Settings): AtmosphereLossResults {
    let result: AtmosphereLossResults = {
      atmosphereLoss: 0,
      grossLoss: 0,
      fuelUse: 0,
      fuelCost: 0
    }
    let energyUnit = this.getAnnualEnergyUnit(atmosphereLossData.energySourceType, settings);

    if (atmosphereLossData) {
      result.atmosphereLoss = this.phastService.atmosphere(atmosphereLossData, settings, energyUnit);
      result.grossLoss =  (result.atmosphereLoss / atmosphereLossData.availableHeat) * 100;
      result.fuelUse = result.grossLoss * atmosphereLossData.hoursPerYear;
      result.fuelCost = result.grossLoss * atmosphereLossData.hoursPerYear * atmosphereLossData.fuelCost;
    }
    return result;
  }

  initDefaultEmptyInputs() {
    let emptyBaselineData: AtmosphereLoss = {
      atmosphereGas: 1,
      specificHeat: 0,
      inletTemperature: 0,
      outletTemperature: 0,
      flowRate: 0,
      correctionFactor: 0,
      heatLoss: 0,
      name: '',
      energySourceType: 'Fuel',
      fuelCost: 0,
      hoursPerYear: 8760,    
      availableHeat: 0,  
    };
    this.baselineData.next(emptyBaselineData);
    this.modificationData.next(undefined);
    this.energySourceType.next('Fuel');

  }

  initDefaultEmptyOutput() {
     let output: AtmosphereLossOutput = {
      baseline: {atmosphereLoss: 0, grossLoss: 0, fuelCost: 0, fuelUse: 0},
      modification: {atmosphereLoss: 0, grossLoss: 0, fuelCost: 0, fuelUse: 0},
      fuelSavings: 0,
      costSavings: 0
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: AtmosphereLoss = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    let modification: AtmosphereLoss = currentBaselineCopy;
    this.modificationData.next(modification);
  }

  generateExampleData(settings: Settings) {
    let baselineExample: AtmosphereLoss = {
      atmosphereGas: 1,
      specificHeat: .0185,
      inletTemperature: 30,
      outletTemperature: 1000,
      flowRate: 120000,
      correctionFactor: 1,
      heatLoss: 0,
      name: '',
      energySourceType: 'Fuel',
      fuelCost: 3.99,
      hoursPerYear: 8760,    
      availableHeat: 100,    
    };
    this.baselineData.next(baselineExample);

    let modExample: AtmosphereLoss = {
      atmosphereGas: 1,
      specificHeat: .0185,
      inletTemperature: 30,
      outletTemperature: 900,
      flowRate: 120000,
      correctionFactor: 1,
      heatLoss: 0,
      name: '',
      energySourceType: 'Fuel',
      fuelCost: 3.99,
      hoursPerYear: 8760,    
      availableHeat: 100,  
    };
    
    this.modificationData.next(modExample);
    this.energySourceType.next('Fuel');
    this.generateExample.next(true);
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

}