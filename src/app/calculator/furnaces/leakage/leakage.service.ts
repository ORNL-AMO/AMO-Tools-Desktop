import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { LeakageLoss, LeakageLossOutput, LeakageLossResults } from '../../../shared/models/phast/losses/leakageLoss';
import { Settings } from '../../../shared/models/settings';
import { LeakageFormService } from './leakage-form.service';

@Injectable()
export class LeakageService {

  baselineData: BehaviorSubject<Array<LeakageLoss>>;
  modificationData: BehaviorSubject<Array<LeakageLoss>>;
  output: BehaviorSubject<LeakageLossOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  energySourceType: BehaviorSubject<string>;
  treasureHuntFuelCost: BehaviorSubject<number>;

  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;

  modalOpen: BehaviorSubject<boolean>;
  defaultEnergySourceType: string;
  constructor(private leakageFormService: LeakageFormService, private convertUnitsService: ConvertUnitsService, private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<Array<LeakageLoss>>(undefined);
    this.modificationData = new BehaviorSubject<Array<LeakageLoss>>(undefined);
    this.output = new BehaviorSubject<LeakageLossOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.treasureHuntFuelCost = new BehaviorSubject<number>(undefined);

    this.defaultEnergySourceType = 'Fuel';
  }

  calculate(settings: Settings) {
    let baselineLeakageLosses: Array<LeakageLoss> = this.baselineData.getValue();
    let modificationLeakageLosses: Array<LeakageLoss> = this.modificationData.getValue();
    let baselineResults: LeakageLossResults;
    let modificationResults: LeakageLossResults;

    this.initDefaultEmptyOutput();
    let output: LeakageLossOutput = this.output.getValue();
    
    let validBaseline = this.checkValidInputData(baselineLeakageLosses);
    let validModification: boolean;
    if (modificationLeakageLosses) {
      validModification = this.checkValidInputData(modificationLeakageLosses);
    }

    if (validBaseline) {
      output.energyUnit = this.getAnnualEnergyUnit(baselineLeakageLosses[0].energySourceType, settings);
      baselineLeakageLosses.forEach((loss, index) => {
        loss.fuelCost = baselineLeakageLosses[0].fuelCost;
        baselineResults = this.getLeakageLossResult(loss, settings);
        if (baselineResults) {
          output.baseline.losses.push(baselineResults);
          output.baseline.totalFuelUse += baselineResults.fuelUse;
          output.baseline.totalFuelCost += baselineResults.fuelCost;
          output.baseline.grossLoss += baselineResults.grossLoss;
        }

        if (validModification && modificationLeakageLosses[index]) {
          modificationLeakageLosses[index].fuelCost = modificationLeakageLosses[0].fuelCost;
          modificationResults = this.getLeakageLossResult(modificationLeakageLosses[index], settings);
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
    }

    this.output.next(output);
  }

  checkValidInputData(losses: Array<LeakageLoss>):boolean {
    if (losses.length > 0) {
      losses.forEach(data => {
        let form = this.leakageFormService.initFormFromLoss(data);
        if (!form.valid) {
          return false;
        }
      })
      return true;
    } else {
      return false;
    }
  }

  getLeakageLossResult(leakageLossData: LeakageLoss, settings: Settings): LeakageLossResults {
    let energyUnit = this.getAnnualEnergyUnit(leakageLossData.energySourceType, settings);
    
    let result: LeakageLossResults = {
      leakageLoss: 0,
      grossLoss: 0,
      fuelUse: 0,
      fuelCost: 0,
      energyUnit: energyUnit
    }
    
    if (leakageLossData) {
      result.leakageLoss = this.phastService.leakageLosses(leakageLossData, settings, energyUnit);
      result.grossLoss =  (result.leakageLoss / leakageLossData.availableHeat) * 100;
      result.fuelUse = result.grossLoss * leakageLossData.hoursPerYear;
      result.fuelCost = result.fuelUse * leakageLossData.fuelCost;
    }
    return result;
  }

  initDefaultEmptyInputs() {
    this.energySourceType.next('Fuel');
    let emptyBaselineData: LeakageLoss = this.initDefaultLoss(0);
    let baselineData: Array<LeakageLoss> = [emptyBaselineData];
    this.modificationData.next(undefined);
    this.energySourceType.next(this.defaultEnergySourceType);
    this.baselineData.next(baselineData);
  }

  initTreasureHuntEmptyInputs(treasureHuntHours: number, settings: Settings) {
    this.energySourceType.next('Natural Gas');
    let emptyBaselineData: LeakageLoss = this.initDefaultLoss(0, treasureHuntHours, undefined, settings.fuelCost);
    let baselineData: Array<LeakageLoss> = [emptyBaselineData];
    this.modificationData.next(undefined);
    this.energySourceType.next(this.defaultEnergySourceType);
    this.baselineData.next(baselineData);
  }

  initDefaultLoss(index: number, hoursPerYear: number = 8760, leakageLoss?: LeakageLoss, fuelCost?: number) {
    let energySourceType = this.energySourceType.getValue();
    let availableHeat: number = 100;

    if (leakageLoss) {
      fuelCost = leakageLoss.fuelCost;
      availableHeat = leakageLoss.availableHeat;
      hoursPerYear = leakageLoss.hoursPerYear;
    }

    let defaultBaselineData: LeakageLoss = {
      draftPressure: 0,
      openingArea: 0,
      leakageGasTemperature: 0,
      ambientTemperature: 0,
      coefficient: .8052,
      specificGravity: 1.0,
      correctionFactor: 1.0,
      name: 'Loss #' + (index + 1),
      energySourceType: energySourceType,
      fuelCost: fuelCost,
      hoursPerYear: hoursPerYear,    
      availableHeat: availableHeat,  
    };

    return defaultBaselineData;
  }

  initDefaultEmptyOutput() {
     let output: LeakageLossOutput = {
      baseline: {totalFuelUse: 0, grossLoss: 0, totalFuelCost: 0, losses: []},
      modification: {totalFuelUse: 0, grossLoss: 0, totalFuelCost: 0, losses: []},
      fuelSavings: 0,
      costSavings: 0
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: Array<LeakageLoss> = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    this.modificationData.next(currentBaselineCopy);
  }

  updateDataArray(data: LeakageLoss, index: number, isBaseline: boolean) {
    let dataArray: Array<LeakageLoss>;
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

    
  removeLoss(i: number) {
    let currentBaselineData: Array<LeakageLoss> = this.baselineData.getValue();
    currentBaselineData.splice(i, 1);
    this.baselineData.next(currentBaselineData);
    let currentModificationData: Array<LeakageLoss> = this.modificationData.getValue();
    if (currentModificationData) {
      currentModificationData.splice(i, 1);
      this.modificationData.next(currentModificationData);
    }
  }
  
  addLoss(treasureHours: number, modificationExists: boolean) {
    let currentBaselineData: Array<LeakageLoss> = JSON.parse(JSON.stringify(this.baselineData.getValue()));
    let index = currentBaselineData.length;
    let baselineObj: LeakageLoss = this.initDefaultLoss(index, treasureHours, currentBaselineData[0]);
    currentBaselineData.push(baselineObj)
    this.baselineData.next(currentBaselineData);
    
    if (modificationExists) {
      let currentModificationData: Array<LeakageLoss> = this.modificationData.getValue();
      let modificationObj: LeakageLoss = this.initDefaultLoss(index, treasureHours, currentBaselineData[0]);
      currentModificationData.push(modificationObj);
      this.modificationData.next(currentModificationData);
    }
  }

  generateExampleData(settings: Settings, inTreasureHunt: boolean) {
    let fuelCost: number =  3.99;
    let energySourceType: string = inTreasureHunt? "Other Fuel" : "Fuel"

    let draftPressure: number = .5;
    let openingArea: number = 4;
    let modOpeningArea: number = 1;
    let ambientTemperature: number = 70;
    let leakageGasTemperature: number = 500;

    if(settings.unitsOfMeasure != 'Imperial'){
      draftPressure = this.convertUnitsService.value(draftPressure).from('inH2o').to('Pa');
      draftPressure = Number(draftPressure.toFixed(2));

      openingArea = this.convertUnitsService.value(openingArea).from('ft2').to('m2');
      openingArea = Number(openingArea.toFixed(2));

      modOpeningArea = this.convertUnitsService.value(modOpeningArea).from('ft2').to('m2');
      modOpeningArea = Number(openingArea.toFixed(2));

      ambientTemperature = this.convertUnitsService.value(ambientTemperature).from('F').to('C');
      ambientTemperature = Number(ambientTemperature.toFixed(2));

      leakageGasTemperature = this.convertUnitsService.value(leakageGasTemperature).from('F').to('C');
      leakageGasTemperature = Number(leakageGasTemperature.toFixed(2));
    }

    let baselineExample: LeakageLoss = {
      draftPressure: draftPressure,
      openingArea: openingArea,
      leakageGasTemperature: leakageGasTemperature,
      ambientTemperature: ambientTemperature,
      coefficient: .8052,
      specificGravity: 1.0,
      correctionFactor: 1.0,
      energySourceType: energySourceType,
      fuelCost: fuelCost,
      hoursPerYear: 8760,    
      availableHeat: 100,
      name: 'Loss #1'
    };
    this.baselineData.next([baselineExample]);

    let modExample: LeakageLoss = {
      draftPressure: draftPressure,
      openingArea: modOpeningArea,
      leakageGasTemperature: leakageGasTemperature,
      ambientTemperature: ambientTemperature,
      coefficient: .8052,
      specificGravity: 1.0,
      correctionFactor: 1.0,
      energySourceType: energySourceType,
      fuelCost: fuelCost,
      hoursPerYear: 8760,    
      availableHeat: 100,
      name: 'Loss #1 (Reduce Opening Area)'
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