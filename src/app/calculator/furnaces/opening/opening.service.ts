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
  baselineData: BehaviorSubject<Array<OpeningLoss>>;
  modificationData: BehaviorSubject<Array<OpeningLoss>>;
  output: BehaviorSubject<OpeningLossOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  energySourceType: BehaviorSubject<string>;
  treasureHuntFuelCost: BehaviorSubject<number>;
  
  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private convertUnitsService: ConvertUnitsService, 
              private openingFormService: OpeningFormService, 
              private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<Array<OpeningLoss>>(undefined);
    this.modificationData = new BehaviorSubject<Array<OpeningLoss>>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.treasureHuntFuelCost = new BehaviorSubject<number>(undefined);
    this.output = new BehaviorSubject<OpeningLossOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculate(settings: Settings) {
    let baselineOpeningLosses = this.baselineData.getValue();
    let modificationOpeningLosses = this.modificationData.getValue();
    let baselineResults: OpeningLossResults;
    let modificationResults: OpeningLossResults;

    this.initDefaultEmptyOutput();
    let output: OpeningLossOutput = this.output.getValue();
    if (baselineOpeningLosses.length > 0) {
      output.energyUnit = this.getAnnualEnergyUnit(baselineOpeningLosses[0].energySourceType, settings);
    }
    
    baselineOpeningLosses.forEach((loss, index) => {
      let baselineForm = this.openingFormService.getFormFromLoss(loss, false);
      loss.fuelCost = baselineOpeningLosses[0].fuelCost;
      baselineResults = this.getOpeningLossResult(loss, baselineForm, settings);
      output.baseline.losses.push(baselineResults);
      output.baseline.totalFuelUse += baselineResults.fuelUse;
      output.baseline.totalFuelCost += baselineResults.fuelCost;
      output.baseline.grossLoss += baselineResults.grossLoss;
      if (modificationOpeningLosses && modificationOpeningLosses[index]) {
        let modificationForm = this.openingFormService.getFormFromLoss(modificationOpeningLosses[index], false);
        modificationOpeningLosses[index].fuelCost = modificationOpeningLosses[0].fuelCost;
        modificationResults = this.getOpeningLossResult(modificationOpeningLosses[index], modificationForm, settings);
        if (modificationResults) {
          output.modification.losses.push(modificationResults);
          output.modification.totalFuelUse += modificationResults.fuelUse;
          output.modification.totalFuelCost += modificationResults.fuelCost;
          output.modification.grossLoss += modificationResults.grossLoss;
        }
      }
    });
    if (baselineResults && modificationResults) {
      output.fuelSavings = output.baseline.totalFuelUse - output.modification.totalFuelUse;
      output.costSavings = output.baseline.totalFuelCost - output.modification.totalFuelCost;
    }

    this.output.next(output);
  }

  getOpeningLossResult(openingLossData: OpeningLoss, openingForm: FormGroup, settings: Settings): OpeningLossResults {
    let energyUnit = this.getAnnualEnergyUnit(openingLossData.energySourceType, settings);
    let result: OpeningLossResults = {
      openingLoss: 0,
      grossLoss: 0,
      fuelUse: 0,
      fuelCost: 0,
      energyUnit: energyUnit
    }

    if (openingLossData && openingForm.valid) {
      let lossAmount: number;
      if (openingLossData.openingType === 'Rectangular (or Square)' && openingLossData.heightOfOpening) {
        let quadOpeningLoss: QuadOpeningLoss = this.openingFormService.getQuadLossFromForm(openingForm);
        lossAmount = this.phastService.openingLossesQuad(quadOpeningLoss, settings, energyUnit);
        result.openingLoss = openingLossData.numberOfOpenings * lossAmount;
      } else if (openingLossData.openingType === 'Round') {
        let circularOpeningLoss: CircularOpeningLoss = this.openingFormService.getCircularLossFromForm(openingForm);
        lossAmount = this.phastService.openingLossesCircular(circularOpeningLoss, settings, energyUnit);
      }
      result.openingLoss = openingLossData.numberOfOpenings * lossAmount;
      result.grossLoss =  (result.openingLoss / openingLossData.availableHeat) * 100;
      result.fuelUse = result.grossLoss * openingLossData.hoursPerYear;
      result.fuelCost = result.fuelUse * openingLossData.fuelCost;
    }
    return result;
  }

  addLoss(treasureHours: number, modificationExists: boolean) {
    let currentBaselineData: Array<OpeningLoss> = JSON.parse(JSON.stringify(this.baselineData.getValue()));
    let index = currentBaselineData.length;
    let baselineObj: OpeningLoss = this.initDefaultLoss(index, treasureHours, currentBaselineData[0]);
    currentBaselineData.push(baselineObj)
    this.baselineData.next(currentBaselineData);
    
    if (modificationExists) {
      let currentModificationData: Array<OpeningLoss> = this.modificationData.getValue();
      let modificationObj: OpeningLoss = this.initDefaultLoss(index, treasureHours, currentBaselineData[0]);
      currentModificationData.push(modificationObj);
      this.modificationData.next(currentModificationData);
    }
  }

  
  removeLoss(i: number) {
    let currentBaselineData: Array<OpeningLoss> = this.baselineData.getValue();
    currentBaselineData.splice(i, 1);
    this.baselineData.next(currentBaselineData);
    let currentModificationData: Array<OpeningLoss> = this.modificationData.getValue();
    if (currentModificationData) {
      currentModificationData.splice(i, 1);
      this.modificationData.next(currentModificationData);
    }
  }
  
  initDefaultEmptyInputs() {
    this.energySourceType.next('Fuel');

    let emptyBaselineData: OpeningLoss = this.initDefaultLoss(0);
    let baselineData: Array<OpeningLoss> = [emptyBaselineData];
    this.modificationData.next(undefined);
    this.baselineData.next(baselineData);
  }
  
  initTreasureHuntEmptyInputs(treasureHuntHours: number, settings: Settings) {
    this.energySourceType.next('Natural Gas');

    let emptyBaselineData: OpeningLoss = this.initDefaultLoss(0, treasureHuntHours, undefined, settings.fuelCost);
    let baselineData: Array<OpeningLoss> = [emptyBaselineData];
    this.modificationData.next(undefined);
    this.baselineData.next(baselineData);
  }

  updateDataArray(data: OpeningLoss, index: number, isBaseline: boolean) {
    let dataArray: Array<OpeningLoss>;
    if (isBaseline) {
      dataArray = this.baselineData.getValue();
    } else {
      dataArray = this.modificationData.getValue();
    }
    // dataArray won't exist during reset cycle w/ multiple subjects emitting
    if (dataArray && dataArray[index]) {
      Object.assign(dataArray[index], data);
    }

     if (isBaseline) {
      this.baselineData.next(dataArray);
    } else {
      this.modificationData.next(dataArray);
    }
  }

  initDefaultLoss(index: number, hoursPerYear = 8760, openingLoss?: OpeningLoss, fuelCost?: number) {
    let energySourceType = this.energySourceType.getValue();
    let availableHeat: number = 100;

    if (openingLoss) {
      fuelCost = openingLoss.fuelCost;
      availableHeat = openingLoss.availableHeat;
      hoursPerYear = openingLoss.hoursPerYear;
    }

    let defaultBaselineLoss: OpeningLoss = {
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
      fuelCost: fuelCost,
      hoursPerYear: hoursPerYear,
      energySourceType: energySourceType,
      availableHeat: availableHeat,
      name: 'Loss #' + (index + 1),
      
    };

    return defaultBaselineLoss;
  }

  getViewFactor(viewFactorInput: ViewFactorInput, settings: Settings) {
    return this.phastService.viewFactorCalculation(viewFactorInput, settings);
  }

  getViewFactorInput(input: FormGroup) {
    if (input.controls.openingType.value === 'Round') {
      return {
        openingShape: 0,
        thickness: input.controls.wallThickness.value,
        diameter: input.controls.lengthOfOpening.value
      };
    }
    return {
      openingShape: 1,
      thickness: input.controls.wallThickness.value,
      length: input.controls.lengthOfOpening.value,
      width: input.controls.heightOfOpening.value
    };
  }


  initDefaultEmptyOutput() {
     let output: OpeningLossOutput = {
      baseline: {totalFuelCost: 0, totalFuelUse: 0, grossLoss: 0, losses: []},
      modification: {totalFuelCost: 0, totalFuelUse: 0, grossLoss: 0, losses: []},
      fuelSavings: 0,
      costSavings: 0
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: Array<OpeningLoss> = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    this.modificationData.next(currentBaselineCopy);
  }

  generateExampleData(settings: Settings, inTreasureHunt: boolean) {
    let fuelCost: number =  3.99;
    let energySourceType: string = inTreasureHunt? "Other Fuel" : "Fuel"

    let ambientTemp: number = 75;
    let insideTemp: number = 2400;
    let thickness: number = 16;
    let lengthOfOpening: number = 420;
    let heightOfOpening: number = 60;

    if(settings.unitsOfMeasure != 'Imperial'){
      ambientTemp = this.convertUnitsService.value(ambientTemp).from('F').to('C');
      ambientTemp = Number(ambientTemp.toFixed(2));

      insideTemp = this.convertUnitsService.value(insideTemp).from('F').to('C');
      insideTemp = Number(insideTemp.toFixed(2));

      thickness = this.convertUnitsService.value(thickness).from('in').to('mm');
      thickness = Number(thickness.toFixed(2));

      lengthOfOpening = this.convertUnitsService.value(lengthOfOpening).from('in').to('mm');
      lengthOfOpening = Number(lengthOfOpening.toFixed(2));

      heightOfOpening = this.convertUnitsService.value(heightOfOpening).from('in').to('mm');
      heightOfOpening = Number(heightOfOpening.toFixed(2));
    }

    let baselineExample: OpeningLoss = {
      numberOfOpenings: 1,
      emissivity: .9,
      thickness: thickness,
      ambientTemperature: ambientTemp,
      insideTemperature: insideTemp,
      percentTimeOpen: 15,
      viewFactor: .868,
      openingType: 'Rectangular (or Square)',
      lengthOfOpening: lengthOfOpening,
      heightOfOpening: heightOfOpening,
      openingTotalArea: 0,
      heatLoss: 0,
      fuelCost: fuelCost,
      hoursPerYear: 8760,
      energySourceType: energySourceType,
      availableHeat: 100,
      name: 'Loss #1',
    };

    this.baselineData.next([baselineExample]);

    let modExample: OpeningLoss = {
      numberOfOpenings: 1,
      emissivity: .9,
      thickness: thickness,
      ambientTemperature: ambientTemp,
      insideTemperature: insideTemp,
      percentTimeOpen: 11,
      viewFactor: .868,
      openingType: 'Rectangular (or Square)',
      lengthOfOpening: lengthOfOpening,
      heightOfOpening: heightOfOpening,
      openingTotalArea: 0,
      heatLoss: 0,
      fuelCost: fuelCost,
      hoursPerYear: 8760,
      energySourceType: energySourceType,
      availableHeat: 100,
      name: 'Loss #1 (Lower Time Open)',
    };
    
    this.energySourceType.next(energySourceType);
    this.modificationData.next([modExample]);
    this.generateExample.next(true);
  }

  getAnnualEnergyUnit(energySourceType: string, settings: Settings) {
    let energyUnit: string = settings.energyResultUnit;
    if (energySourceType === 'Electricity') {
      energyUnit = settings.phastRollupElectricityUnit;
    } 
    if (energySourceType === 'Steam') {
      energyUnit = settings.phastRollupSteamUnit;;
    } 
    if (energySourceType === 'Fuel') {
      energyUnit = settings.phastRollupFuelUnit;;
    } 
    return energyUnit;
  }

  getTreasureHuntFuelCost(energySourceType: string, settings: Settings) {
    switch(energySourceType) {
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
