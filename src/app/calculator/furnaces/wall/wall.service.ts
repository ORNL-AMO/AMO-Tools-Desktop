import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { WallLoss, WallLossOutput, WallLossResults } from '../../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class WallService {

  baselineData: BehaviorSubject<WallLoss>;
  modificationData: BehaviorSubject<WallLoss>;
  output: BehaviorSubject<WallLossOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private convertUnitsService: ConvertUnitsService, private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<WallLoss>(undefined);
    this.modificationData = new BehaviorSubject<WallLoss>(undefined);
    this.output = new BehaviorSubject<WallLossOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculate(settings: Settings) {
    let baselineWallLoss = this.baselineData.getValue();
    let modificationWallLoss = this.modificationData.getValue();

    let output: WallLossOutput = this.output.getValue();
    let baselineResult: WallLossResults = this.getWallLossResult(baselineWallLoss, settings);
    if (baselineResult) {
      output.baseline = baselineResult;
    }
    if (modificationWallLoss) {
      let modificationResult: WallLossResults = this.getWallLossResult(modificationWallLoss, settings);
      if (modificationResult) {
        output.modification = modificationResult;
      }
    }
    this.output.next(output);
  }

  getWallLossResult(wallLossData: WallLoss, settings: Settings): WallLossResults {
    let result: WallLossResults = {
      wallLoss: 0,
      grossLoss: 0
    }
    if (wallLossData) {
      result.wallLoss = this.phastService.wallLosses(wallLossData, settings);
      result.grossLoss =  (result.wallLoss / wallLossData.availableHeat) * 100;
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
      name: ''
    };
    this.baselineData.next(emptyBaselineData);
    this.modificationData.next(undefined);
  }

  initDefaultEmptyOutput() {
     let output: WallLossOutput = {
      baseline: {wallLoss: 0, grossLoss: 0},
      modification: {wallLoss: 0, grossLoss: 0}
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
    let surfaceTemp: number = 300;
    let surfaceArea: number = 11100;

    let baselineAmbientTemp: number = 70;
    let modificationAmbientTemp: number = 55;

    if(settings.unitsOfMeasure != 'Imperial'){
      surfaceTemp = this.convertUnitsService.value(surfaceTemp).from('F').to('C');
      surfaceTemp = Number(surfaceTemp.toFixed(2));

      surfaceArea = this.convertUnitsService.value(surfaceArea).from('ft2').to('m2');
      surfaceArea = Number(surfaceArea.toFixed(2));

      baselineAmbientTemp = this.convertUnitsService.value(baselineAmbientTemp).from('F').to('C');
      baselineAmbientTemp = Number(baselineAmbientTemp.toFixed(2));
      
      modificationAmbientTemp = this.convertUnitsService.value(modificationAmbientTemp).from('F').to('C');
      modificationAmbientTemp = Number(modificationAmbientTemp.toFixed(2));
    }
    let baselineExample: WallLoss = {
      surfaceArea: surfaceArea,
      surfaceTemperature: surfaceTemp,
      ambientTemperature: baselineAmbientTemp,
      correctionFactor: 1.0,
      windVelocity: 0,
      surfaceShape: 3,
      conditionFactor: 1.394,
      surfaceEmissivity: 0.9,
      name: ''
    };
    this.baselineData.next(baselineExample);

    let modExample: WallLoss = {
      surfaceArea: surfaceArea,
      surfaceTemperature: surfaceTemp,
      ambientTemperature: modificationAmbientTemp,
      correctionFactor: 1.0,
      windVelocity: 0,
      surfaceShape: 3,
      conditionFactor: 1.394,
      surfaceEmissivity: 0.9,
      name: ''
    };
    
    this.modificationData.next(modExample);

    this.generateExample.next(true);
  }

}