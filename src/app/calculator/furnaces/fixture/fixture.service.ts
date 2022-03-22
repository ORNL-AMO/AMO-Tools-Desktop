import { Injectable } from '@angular/core';
import { initial } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { FixtureLoss, FixtureLossOutput, FixtureLossResults } from '../../../shared/models/phast/losses/fixtureLoss';
import { Settings } from '../../../shared/models/settings';
import { FixtureFormService } from './fixture-form.service';

@Injectable()
export class FixtureService {

  baselineData: BehaviorSubject<Array<FixtureLoss>>;
  modificationData: BehaviorSubject<Array<FixtureLoss>>;
  output: BehaviorSubject<FixtureLossOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  energySourceType: BehaviorSubject<string>;

  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private fixtureFormService: FixtureFormService, 
    private convertUnitsService: ConvertUnitsService, 
    private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<Array<FixtureLoss>>(undefined);
    this.modificationData = new BehaviorSubject<Array<FixtureLoss>>(undefined);
    this.output = new BehaviorSubject<FixtureLossOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculate(settings: Settings) {
    let baselineFixtureLosses: Array<FixtureLoss> = this.baselineData.getValue();
    let modificationFixtureLosses: Array<FixtureLoss> = this.modificationData.getValue();
    let baselineResults: FixtureLossResults;
    let modificationResults: FixtureLossResults;

    this.initDefaultEmptyOutput();
    let output: FixtureLossOutput = this.output.getValue();
    
    let validBaseline = this.checkValidInputData(baselineFixtureLosses);
    let validModification: boolean;
    if (modificationFixtureLosses) {
      validModification = this.checkValidInputData(modificationFixtureLosses);
    }

    if (validBaseline) {
      output.energyUnit = this.getAnnualEnergyUnit(baselineFixtureLosses[0].energySourceType, settings);
      baselineFixtureLosses.forEach((loss, index) => {
        baselineResults = this.getFixtureLossResult(loss, settings);
        if (baselineResults) {
          output.baseline.losses.push(baselineResults);
          output.baseline.totalFuelUse += baselineResults.fuelUse;
          output.baseline.totalFuelCost += baselineResults.fuelCost;
          output.baseline.grossLoss += baselineResults.grossLoss;
        }

        if (validModification && modificationFixtureLosses[index]) {
          modificationResults = this.getFixtureLossResult(modificationFixtureLosses[index], settings);
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

  checkValidInputData(losses: Array<FixtureLoss>):boolean {
    if (losses.length > 0) {
      losses.forEach(data => {
        let form = this.fixtureFormService.getFormFromLoss(data);
        if (!form.valid) {
          return false;
        }
      })
      return true;
    } else {
      return false;
    }
  }

  getFixtureLossResult(fixtureLossData: FixtureLoss, settings: Settings): FixtureLossResults {
    let energyUnit = this.getAnnualEnergyUnit(fixtureLossData.energySourceType, settings);
    
    let result: FixtureLossResults = {
      fixtureLoss: 0,
      grossLoss: 0,
      fuelUse: 0,
      fuelCost: 0,
      energyUnit: energyUnit
    }
    
    if (fixtureLossData) {
      result.fixtureLoss = this.phastService.fixtureLosses(fixtureLossData, settings, energyUnit);
      result.grossLoss =  (result.fixtureLoss / fixtureLossData.availableHeat) * 100;
      result.fuelUse = result.grossLoss * fixtureLossData.hoursPerYear;
      result.fuelCost = result.fuelUse * fixtureLossData.fuelCost;
    }
    return result;
  }

  initDefaultEmptyInputs() {
    let emptyBaselineData: FixtureLoss = this.initDefaultLoss(0, undefined);
    let baselineData: Array<FixtureLoss> = [emptyBaselineData];
    this.baselineData.next(baselineData);
    this.modificationData.next(undefined);
    this.energySourceType.next('Fuel');

  }

  initDefaultLoss(index: number, treasureHours: number, fixtureLoss?: FixtureLoss) {
    let fuelCost: number = 0;
    let availableHeat: number = 100;
    let hoursPerYear = 8760;

    if (fixtureLoss) {
      fuelCost = fixtureLoss.fuelCost;
      availableHeat = fixtureLoss.availableHeat;

      if (treasureHours) {
        hoursPerYear = treasureHours;
      } else {
        hoursPerYear = fixtureLoss.hoursPerYear;
      }
    }

    let defaultBaselineData: FixtureLoss = {
      specificHeat: 0,
      feedRate: 0,
      initialTemperature: 0,
      finalTemperature: 0,
      correctionFactor: 0,
      materialName: 1,
      heatLoss: 0,
      name: 'Loss #' + (index + 1),
      energySourceType: 'Fuel',
      fuelCost: fuelCost,
      hoursPerYear: hoursPerYear,    
      availableHeat: availableHeat,  
    };

    return defaultBaselineData;
  }


  initDefaultEmptyOutput() {
     let output: FixtureLossOutput = {
      baseline: {totalFuelUse: 0, grossLoss: 0, totalFuelCost: 0, losses: []},
      modification: {totalFuelUse: 0, grossLoss: 0, totalFuelCost: 0, losses: []},
      fuelSavings: 0,
      costSavings: 0
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: Array<FixtureLoss> = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    this.modificationData.next(currentBaselineCopy);
  }

  updateDataArray(data: FixtureLoss, index: number, isBaseline: boolean) {
    let dataArray: Array<FixtureLoss>;
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
    let currentBaselineData: Array<FixtureLoss> = this.baselineData.getValue();
    currentBaselineData.splice(i, 1);
    this.baselineData.next(currentBaselineData);
    let currentModificationData: Array<FixtureLoss> = this.modificationData.getValue();
    if (currentModificationData) {
      currentModificationData.splice(i, 1);
      this.modificationData.next(currentModificationData);
    }
  }
  
  addLoss(treasureHours, modificationExists: boolean) {
    let currentBaselineData: Array<FixtureLoss> = JSON.parse(JSON.stringify(this.baselineData.getValue()));
    let index = currentBaselineData.length;
    let baselineObj: FixtureLoss = this.initDefaultLoss(index, treasureHours, currentBaselineData[0]);
    currentBaselineData.push(baselineObj)
    this.baselineData.next(currentBaselineData);
    
    if (modificationExists) {
      let currentModificationData: Array<FixtureLoss> = this.modificationData.getValue();
      let modificationObj: FixtureLoss = this.initDefaultLoss(index, treasureHours, currentBaselineData[0]);
      currentModificationData.push(modificationObj);
      this.modificationData.next(currentModificationData);
    }
  }

  generateExampleData(settings: Settings) {
    let specificHeat: number = .16;
    let initialTemperature: number = 45;
    let finalTemperature: number = 345;
    let modFinalTemperature: number = 250;
    let feedRate: number = 45345;

    if(settings.unitsOfMeasure != 'Imperial'){
      specificHeat = this.convertUnitsService.value(specificHeat).from('btuScfF').to('kJm3C');
      specificHeat = Number(specificHeat.toFixed(5));

      initialTemperature = this.convertUnitsService.value(initialTemperature).from('F').to('C');
      initialTemperature = Number(initialTemperature.toFixed(2));

      finalTemperature = this.convertUnitsService.value(finalTemperature).from('F').to('C');
      finalTemperature = Number(finalTemperature.toFixed(2));

      modFinalTemperature = this.convertUnitsService.value(modFinalTemperature).from('F').to('C');
      modFinalTemperature = Number(modFinalTemperature.toFixed(2));

      feedRate = this.convertUnitsService.value(feedRate).from('kg').to('lb');
      feedRate = Number(feedRate.toFixed(2));
    }

    let baselineExample: FixtureLoss = {
      materialName: 13,
      specificHeat: specificHeat,
      initialTemperature: initialTemperature,
      finalTemperature: finalTemperature,
      correctionFactor: 1,
      feedRate: feedRate,
      heatLoss: 0,
      energySourceType: 'Fuel',
      fuelCost: 3.99,
      hoursPerYear: 8760,    
      availableHeat: 100,
      name: 'Loss #1'
    };
    this.baselineData.next([baselineExample]);

    let modExample: FixtureLoss = {
      materialName: 13,
      specificHeat: specificHeat,
      initialTemperature: initialTemperature,
      finalTemperature: modFinalTemperature,
      correctionFactor: 1,
      feedRate: feedRate,
      heatLoss: 0,
      energySourceType: 'Fuel',
      fuelCost: 3.99,
      hoursPerYear: 8760,    
      availableHeat: 100,
      name: 'Loss #1 (Lower Final Temp)'
    };
    
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

}