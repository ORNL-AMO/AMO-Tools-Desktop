import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { WallLoss, WallLossOutput, WallLossResults } from '../../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../../shared/models/settings';
import { WallFormService } from './wall-form.service';

@Injectable()
export class WallService {

  baselineData: BehaviorSubject<WallLoss>;
  modificationData: BehaviorSubject<WallLoss>;
  output: BehaviorSubject<WallLossOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  energySourceType: BehaviorSubject<string>;

  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private convertUnitsService: ConvertUnitsService, private wallFormService: WallFormService, private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<WallLoss>(undefined);
    this.modificationData = new BehaviorSubject<WallLoss>(undefined);
    this.output = new BehaviorSubject<WallLossOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculate(settings: Settings) {
    let baselineWallLoss = this.baselineData.getValue();
    let modificationWallLoss = this.modificationData.getValue();
    let baselineResults: WallLossResults;
    let modificationResults: WallLossResults;

    this.initDefaultEmptyOutput();
    let output: WallLossOutput = this.output.getValue();
    output.energyUnit = this.getAnnualEnergyUnit(baselineWallLoss.energySourceType, settings);

    let validBaseline = this.wallFormService.getWallLossForm(baselineWallLoss, false).valid;
    if (validBaseline) {
      baselineResults = this.getWallLossResult(baselineWallLoss, settings);
      if (baselineResults) {
        output.baseline = baselineResults;
      }
    }

    if (modificationWallLoss) {
      let validModification = this.wallFormService.getWallLossForm(modificationWallLoss, false).valid;
      if (validModification) {
        modificationResults = this.getWallLossResult(modificationWallLoss, settings);
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

  getWallLossResult(wallLossData: WallLoss, settings: Settings): WallLossResults {
    let result: WallLossResults = {
      wallLoss: 0,
      grossLoss: 0,
      fuelUse: 0,
      fuelCost: 0
    }
    if (wallLossData) {
      result.wallLoss = this.phastService.wallLosses(wallLossData, settings);
      result.grossLoss =  (result.wallLoss / wallLossData.availableHeat) * 100;
      result.fuelUse = result.grossLoss * wallLossData.hoursPerYear;
      result.fuelCost = result.grossLoss * wallLossData.hoursPerYear * wallLossData.fuelCost;
    }
    return result;
  }

  initDefaultEmptyInputs() {
    let emptyBaselineData: WallLoss = {
      surfaceArea: 0,
      surfaceTemperature: 0,
      ambientTemperature: 0,
      correctionFactor: 1.0,
      windVelocity: 0,
      surfaceShape: 3,
      conditionFactor: 1.394,
      surfaceEmissivity: 0.9,
      availableHeat: 100,
      name: '',
      hoursPerYear: 8760,
      fuelCost: undefined,
      energySourceType: 'Fuel'
    };
    this.baselineData.next(emptyBaselineData);
    this.modificationData.next(undefined);
    this.energySourceType.next('Fuel');

  }

  initDefaultEmptyOutput() {
     let output: WallLossOutput = {
      baseline: {wallLoss: 0, grossLoss: 0, fuelCost: 0, fuelUse: 0},
      modification: {wallLoss: 0, grossLoss: 0, fuelCost: 0, fuelUse: 0},
      fuelSavings: 0,
      costSavings: 0
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: WallLoss = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    let modification: WallLoss = currentBaselineCopy;
    this.modificationData.next(modification);
  }

  generateExampleData(settings: Settings) {
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
    let baselineExample: WallLoss = {
      surfaceArea: surfaceArea,
      surfaceTemperature: baselineSurfaceTemp,
      ambientTemperature: ambientTemp,
      correctionFactor: 1.0,
      windVelocity: 0,
      surfaceShape: 3,
      conditionFactor: 1.394,
      surfaceEmissivity: 0.9,
      availableHeat: 100,
      name: '',
      hoursPerYear: 8760,
      fuelCost: 3.5,
      energySourceType: 'Fuel'
    };
    this.baselineData.next(baselineExample);

    let modExample: WallLoss = {
      surfaceArea: surfaceArea,
      surfaceTemperature: modificationSurfaceTemp,
      ambientTemperature: ambientTemp,
      correctionFactor: 1.0,
      windVelocity: 0,
      surfaceShape: 3,
      conditionFactor: 1.394,
      surfaceEmissivity: 0.9,
      availableHeat: 100,
      name: '',
      hoursPerYear: 8760,
      fuelCost: 3.5,
      energySourceType: 'Fuel'
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