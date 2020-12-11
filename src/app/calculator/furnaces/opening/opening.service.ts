import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { CircularOpeningLoss, OpeningLoss, OpeningLossOutput, OpeningLossResults, QuadOpeningLoss, ViewFactorInput } from '../../../shared/models/phast/losses/openingLoss';
import { Settings } from '../../../shared/models/settings';
import { OpeningFormService } from './opening-form.service';

@Injectable()
export class OpeningService {
  baselineData: BehaviorSubject<OpeningLoss>;
  modificationData: BehaviorSubject<OpeningLoss>;
  output: BehaviorSubject<OpeningLossOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  energySourceType: BehaviorSubject<string>;

  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private convertUnitsService: ConvertUnitsService, 
              private openingFormService: OpeningFormService, 
              private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<OpeningLoss>(undefined);
    this.modificationData = new BehaviorSubject<OpeningLoss>(undefined);
    this.output = new BehaviorSubject<OpeningLossOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculate(settings: Settings) {
    let baselineOpeningLoss = this.baselineData.getValue();
    let modificationOpeningLoss = this.modificationData.getValue();
    let baselineResults: OpeningLossResults;
    let modificationResults: OpeningLossResults;

    this.initDefaultEmptyOutput();
    let output: OpeningLossOutput = this.output.getValue();
    output.energyUnit = this.getAnnualEnergyUnit(baselineOpeningLoss.energySourceType, settings);

    let baselineForm = this.openingFormService.getFormFromLoss(baselineOpeningLoss, false);
    if (baselineForm.valid) {
      baselineResults = this.getOpeningLossResult(baselineOpeningLoss, baselineForm, settings);
      if (baselineResults) {
        output.baseline = baselineResults;
      }
    }

    if (modificationOpeningLoss) {
      let modificationForm = this.openingFormService.getFormFromLoss(modificationOpeningLoss, false);
      if (modificationForm.valid) {
        modificationResults = this.getOpeningLossResult(modificationOpeningLoss, modificationForm, settings);
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

  getOpeningLossResult(openingLossData: OpeningLoss, openingForm: FormGroup, settings: Settings): OpeningLossResults {
    let result: OpeningLossResults = {
      openingLoss: 0,
      grossLoss: 0,
      fuelUse: 0,
      fuelCost: 0
    }
    if (openingLossData) {
      if (openingLossData.openingType === 'Rectangular (or Square)' && openingLossData.heightOfOpening) {
        let quadOpeningLoss: QuadOpeningLoss = this.openingFormService.getQuadLossFromForm(openingForm);
        let lossAmount = this.phastService.openingLossesQuad(quadOpeningLoss, settings);
        result.openingLoss = openingLossData.numberOfOpenings * lossAmount;
      } else if (openingLossData.openingType === 'Round') {
        let circularOpeningLoss: CircularOpeningLoss = this.openingFormService.getCircularLossFromForm(openingForm);
        let lossAmount = this.phastService.openingLossesCircular(circularOpeningLoss, settings);
        result.openingLoss = openingLossData.numberOfOpenings * lossAmount;
      } 
      result.grossLoss =  (result.openingLoss / openingLossData.availableHeat) * 100;
      result.fuelUse = result.grossLoss * openingLossData.hoursPerYear;
      result.fuelCost = result.grossLoss * openingLossData.hoursPerYear * openingLossData.fuelCost;
    }
    return result;
  }

  initDefaultEmptyInputs() {
    let emptyBaselineData: OpeningLoss = {
      numberOfOpenings: 1,
      emissivity: .9,
      thickness: 0,
      ambientTemperature: 0,
      insideTemperature: 0,
      percentTimeOpen: 0,
      viewFactor: 0,
      openingType: 'Rectangular (or Square)',
      lengthOfOpening: 0,
      heightOfOpening: 0,
      openingTotalArea: 0,
      heatLoss: 0,
      fuelCost: 0,
      hoursPerYear: 8760,
      energySourceType: 'Fuel',
      availableHeat: 100,
      name: ''
    };
    this.baselineData.next(emptyBaselineData);
    this.modificationData.next(undefined);
    this.energySourceType.next('Fuel');

  }

  getViewFactor(viewFactorInput: ViewFactorInput, settings: Settings) {
    return this.phastService.viewFactorCalculation(viewFactorInput, settings);
  }

  initDefaultEmptyOutput() {
     let output: OpeningLossOutput = {
      baseline: {openingLoss: 0, grossLoss: 0, fuelCost: 0, fuelUse: 0},
      modification: {openingLoss: 0, grossLoss: 0, fuelCost: 0, fuelUse: 0},
      fuelSavings: 0,
      costSavings: 0
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: OpeningLoss = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    let modification: OpeningLoss = currentBaselineCopy;
    this.modificationData.next(modification);
  }

  generateExampleData(settings: Settings) {
    // TODO conversion
    let baselineExample: OpeningLoss = {
      numberOfOpenings: 1,
      emissivity: .9,
      thickness: 16,
      ambientTemperature: 70,
      insideTemperature: 2400,
      percentTimeOpen: 15,
      viewFactor: .868,
      openingType: 'Rectangular (or Square)',
      lengthOfOpening: 420,
      heightOfOpening: 60,
      openingTotalArea: 0,
      heatLoss: 0,
      fuelCost: 3.99,
      hoursPerYear: 8760,
      energySourceType: 'Fuel',
      availableHeat: 100,
    };
    this.baselineData.next(baselineExample);

    let modExample: OpeningLoss = {
      numberOfOpenings: 1,
      emissivity: .9,
      thickness: 16,
      ambientTemperature: 70,
      insideTemperature: 2400,
      percentTimeOpen: 11,
      viewFactor: .868,
      openingType: 'Rectangular (or Square)',
      lengthOfOpening: 420,
      heightOfOpening: 60,
      openingTotalArea: 0,
      heatLoss: 0,
      fuelCost: 3.99,
      hoursPerYear: 8760,
      energySourceType: 'Fuel',
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