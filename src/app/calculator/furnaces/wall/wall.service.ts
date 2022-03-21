import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { WallLoss, WallLossOutput, WallLossResult } from '../../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../../shared/models/settings';
import { WallFormService } from './wall-form.service';

@Injectable()
export class WallService {

  baselineData: BehaviorSubject<Array<WallLoss>>;
  modificationData: BehaviorSubject<Array<WallLoss>>;
  output: BehaviorSubject<WallLossOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  energySourceType: BehaviorSubject<string>;
  treasureHuntFuelCost: BehaviorSubject<number>;

  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private convertUnitsService: ConvertUnitsService, private wallFormService: WallFormService, private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<Array<WallLoss>>(undefined);
    this.modificationData = new BehaviorSubject<Array<WallLoss>>(undefined);
    this.output = new BehaviorSubject<WallLossOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.treasureHuntFuelCost = new BehaviorSubject<number>(undefined);

  }

  calculate(settings: Settings) {
    let baselineWallLosses: Array<WallLoss> = this.baselineData.getValue();
    let modificationWallLosses: Array<WallLoss> = this.modificationData.getValue();
    let baselineResults: WallLossResult;
    let modificationResults: WallLossResult;

    this.initDefaultEmptyOutput();
    let output: WallLossOutput = this.output.getValue();
    
    let validBaseline = this.checkValidInputData(baselineWallLosses);
    let validModification: boolean;
    if (modificationWallLosses) {
      validModification = this.checkValidInputData(modificationWallLosses);
    }
    
    if (validBaseline) {
      output.energyUnit = this.getAnnualEnergyUnit(baselineWallLosses[0].energySourceType, settings);
      baselineWallLosses.forEach((loss, index) => {
        loss.fuelCost = baselineWallLosses[0].fuelCost;
        baselineResults = this.getWallLossResult(loss, settings);
        if (baselineResults) {
          output.baseline.losses.push(baselineResults);
          output.baseline.totalFuelUse += baselineResults.fuelUse;
          output.baseline.totalFuelCost += baselineResults.fuelCost;
          output.baseline.grossLoss += baselineResults.grossLoss;
        }

        if (validModification && modificationWallLosses[index]) {
          modificationWallLosses[index].fuelCost = modificationWallLosses[0].fuelCost;
          modificationResults = this.getWallLossResult(modificationWallLosses[index], settings);
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

  checkValidInputData(losses: Array<WallLoss>):boolean {
    if (losses.length > 0) {
      losses.forEach(data => {
        let form = this.wallFormService.getWallLossForm(data);
        if (!form.valid) {
          return false;
        }
      })
      return true;
    } else {
      return false;
    }
  }

  getWallLossResult(wallLossData: WallLoss, settings: Settings): WallLossResult {
    let result: WallLossResult = {
      wallLoss: 0,
      grossLoss: 0,
      fuelUse: 0,
      fuelCost: 0,
    }
    
    if (wallLossData) {
      result.energyUnit = this.getAnnualEnergyUnit(wallLossData.energySourceType, settings);
      result.wallLoss = this.phastService.wallLosses(wallLossData, settings, result.energyUnit);
      result.grossLoss =  (result.wallLoss / wallLossData.availableHeat) * 100;
      result.fuelUse = result.grossLoss * wallLossData.hoursPerYear;
      result.fuelCost = result.fuelUse * wallLossData.fuelCost;
    }
    return result;
  }

  initDefaultEmptyInputs() {
    this.energySourceType.next('Fuel');
    let emptyBaselineData: WallLoss = this.initDefaultLoss(0);
    let baselineData: Array<WallLoss> = [emptyBaselineData];
    this.modificationData.next(undefined);
    this.baselineData.next(baselineData);
  }

  initTreasureHuntEmptyInputs(treasureHuntHours: number, settings: Settings) {
    this.energySourceType.next('Natural Gas');
    let emptyBaselineData: WallLoss = this.initDefaultLoss(0, treasureHuntHours, undefined, settings.fuelCost);
    let baselineData: Array<WallLoss> = [emptyBaselineData];
    this.modificationData.next(undefined);
    this.baselineData.next(baselineData);
  }

  initDefaultLoss(index: number, hoursPerYear: number = 8760, wallLoss?: WallLoss, fuelCost?: number) {
    let energySourceType = this.energySourceType.getValue();
    let availableHeat: number = 100;

    if (wallLoss) {
      fuelCost = wallLoss.fuelCost;
      availableHeat = wallLoss.availableHeat;
      hoursPerYear = wallLoss.hoursPerYear;
    }
  
    let defaultBaselineLoss: WallLoss = {
      surfaceArea: 0,
      surfaceTemperature: 0,
      ambientTemperature: 0,
      correctionFactor: 1.0,
      windVelocity: 0,
      surfaceShape: 3,
      conditionFactor: 1.394,
      surfaceEmissivity: 0.9,
      availableHeat: availableHeat,
      name: 'Loss #' + (index + 1),
      hoursPerYear: hoursPerYear,
      fuelCost: fuelCost,
      energySourceType: energySourceType
    };
    return defaultBaselineLoss;
  }

  initDefaultEmptyOutput() {
    let output: WallLossOutput = {
      baseline: {totalFuelCost: 0, totalFuelUse: 0, grossLoss: 0, losses: []},
      modification: {totalFuelCost: 0, totalFuelUse: 0, grossLoss: 0, losses: []},
      fuelSavings: 0,
      costSavings: 0,
    };

    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: Array<WallLoss> = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    this.modificationData.next(currentBaselineCopy);
  }

    updateDataArray(data: WallLoss, index: number, isBaseline: boolean) {
    let dataArray: Array<WallLoss>;
    if (isBaseline) {
      dataArray = this.baselineData.getValue();
    } else {
      dataArray = this.modificationData.getValue();
    }
    // dataArray won't exist during reset cycle w/ multiple subjects emitting
    if (dataArray && dataArray[index]) {
      dataArray[index].name = data.name;
      dataArray[index].hoursPerYear = data.hoursPerYear;
      dataArray[index].fuelCost = data.fuelCost;
      dataArray[index].availableHeat = data.availableHeat;
      dataArray[index].energySourceType = data.energySourceType;
      dataArray[index].surfaceArea = data.surfaceArea;
      dataArray[index].surfaceTemperature = data.surfaceTemperature;
      dataArray[index].ambientTemperature = data.ambientTemperature;
      dataArray[index].correctionFactor = data.correctionFactor;
      dataArray[index].windVelocity = data.windVelocity;
      dataArray[index].surfaceShape = data.surfaceShape;
      dataArray[index].conditionFactor = data.conditionFactor;
      dataArray[index].surfaceEmissivity = data.surfaceEmissivity;
      dataArray[index].windVelocity = data.windVelocity;
    }

     if (isBaseline) {
      this.baselineData.next(dataArray);
    } else {
      this.modificationData.next(dataArray);
    }
  }

  
  removeLoss(i: number) {
    let currentBaselineData: Array<WallLoss> = this.baselineData.getValue();
    currentBaselineData.splice(i, 1);
    this.baselineData.next(currentBaselineData);
    let currentModificationData: Array<WallLoss> = this.modificationData.getValue();
    if (currentModificationData) {
      currentModificationData.splice(i, 1);
      this.modificationData.next(currentModificationData);
    }
  }
  
  addLoss(treasureHuntHours: number, modificationExists: boolean) {
    let currentBaselineData: Array<WallLoss> = JSON.parse(JSON.stringify(this.baselineData.getValue()));
    let index = currentBaselineData.length;
    let baselineObj: WallLoss = this.initDefaultLoss(index, treasureHuntHours, currentBaselineData[0]);
    currentBaselineData.push(baselineObj)
    this.baselineData.next(currentBaselineData);
    
    if (modificationExists) {
      let currentModificationData: Array<WallLoss> = this.modificationData.getValue();
      let modificationObj: WallLoss = this.initDefaultLoss(index, treasureHuntHours, currentBaselineData[0]);
      currentModificationData.push(modificationObj);
      this.modificationData.next(currentModificationData);
    }
  }

  generateExampleData(settings: Settings, inTreasureHunt: boolean) {
    let fuelCost: number =  3.99;
    let energySourceType: string = inTreasureHunt? "Other Fuel" : "Fuel"

    let ambientTemp: number = 75;
    let surfaceArea: number = 11100;

    let baselineSurfaceTemp: number = 300;
    let modificationSurfaceTemp: number = 150;

    if(settings.unitsOfMeasure != 'Imperial'){
      ambientTemp = this.convertUnitsService.value(ambientTemp).from('F').to('C');
      ambientTemp = Number(ambientTemp.toFixed(2));

      surfaceArea = this.convertUnitsService.value(surfaceArea).from('ft2').to('m2');
      surfaceArea = Number(surfaceArea.toFixed(2));

      baselineSurfaceTemp = this.convertUnitsService.value(baselineSurfaceTemp).from('F').to('C');
      baselineSurfaceTemp = Number(baselineSurfaceTemp.toFixed(2));
      
      modificationSurfaceTemp = this.convertUnitsService.value(modificationSurfaceTemp).from('F').to('C');
      modificationSurfaceTemp = Number(modificationSurfaceTemp.toFixed(2));
    }
    let baselineData: WallLoss = {
      surfaceArea: surfaceArea,
      surfaceTemperature: baselineSurfaceTemp,
      ambientTemperature: ambientTemp,
      correctionFactor: 1.0,
      windVelocity: 0,
      surfaceShape: 3,
      conditionFactor: 1.394,
      surfaceEmissivity: 0.9,
      availableHeat: 100,
      name: 'Loss #1',
      hoursPerYear: 8760,
      fuelCost: fuelCost,
      energySourceType: energySourceType
    };

    let baselineExample = [baselineData];
    this.baselineData.next(baselineExample);

    let modificationData: WallLoss = {
      surfaceArea: surfaceArea,
      surfaceTemperature: modificationSurfaceTemp,
      ambientTemperature: ambientTemp,
      correctionFactor: 1.0,
      windVelocity: 0,
      surfaceShape: 3,
      conditionFactor: 1.394,
      surfaceEmissivity: 0.9,
      availableHeat: 100,
      name: 'Loss #1 (Lower Surface Temp)',
      hoursPerYear: 8760,
      fuelCost: fuelCost,
      energySourceType: energySourceType
    };
    
    this.energySourceType.next(energySourceType);
    this.modificationData.next([modificationData]);
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