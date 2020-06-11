import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CalculatedGasDensity, BaseGasDensity } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { FsatService } from '../../../fsat/fsat.service';
import { GasDensityFormService } from '../../fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';

@Injectable()
export class FanPsychometricService {
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  
  baseGasDensityData: BehaviorSubject<BaseGasDensity>;
  gasDensityResult: BehaviorSubject<number>;
  calculatedBaseGasDensity: BehaviorSubject<CalculatedGasDensity>;
  psychometricResults: BehaviorSubject<Array<CalculatedGasDensity>>;
  
  constructor(private gasDensityFormService: GasDensityFormService,
              private fsatService: FsatService) {
    this.currentField = new BehaviorSubject<string>('default'); 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    
    this.psychometricResults = new BehaviorSubject<Array<CalculatedGasDensity>>(undefined);
    this.gasDensityResult = new BehaviorSubject<number>(undefined);
    this.baseGasDensityData = new BehaviorSubject<BaseGasDensity>(undefined);
    this.calculatedBaseGasDensity = new BehaviorSubject<CalculatedGasDensity>(undefined);
   }

   getDefaultData(): BaseGasDensity {
    let data: BaseGasDensity = {
        dryBulbTemp: undefined,
        staticPressure: 0,
        barometricPressure: 29.92,
        gasDensity: .0765,
        altitude: undefined,
        gasType: 'AIR',
        inputType: 'wetBulb',
        specificGravity: 1,
        wetBulbTemp: undefined,
        relativeHumidity: undefined,
        dewPoint: undefined,
        specificHeatGas: .24
      };
    return data;
  }

  getExampleData(): BaseGasDensity {
    let data: BaseGasDensity = {
      dryBulbTemp: 123,
      staticPressure: 0,
      barometricPressure: 26.57,
      gasDensity: 0.0547,
      gasType: 'AIR',
      inputType: "wetBulb",
      relativeHumidity: null,
      specificGravity: 1,
      specificHeatGas: 0.24,
      wetBulbTemp: 119
    };

    return data;
  }

  calculateBaseGasDensity(settings: Settings) {
    let currentBaseGasDensity = this.baseGasDensityData.getValue();
    let inputType = currentBaseGasDensity.inputType;
    let calculatedGasDensity: CalculatedGasDensity;
    if (inputType === 'relativeHumidity') {
      calculatedGasDensity = this.calcDensityRelativeHumidity(currentBaseGasDensity, settings);
    } else if (inputType === 'wetBulb') {
      calculatedGasDensity = this.calcDensityWetBulb(currentBaseGasDensity, settings);
    } else if (inputType === 'dewPoint') {
      calculatedGasDensity = this.calcDensityDewPoint(currentBaseGasDensity, settings);
    }

    if (calculatedGasDensity) {
      this.gasDensityResult.next(calculatedGasDensity.gasDensity);
    } 

    this.calculatedBaseGasDensity.next(calculatedGasDensity);
  }

  calcDensityWetBulb(baseGasDensityData: BaseGasDensity, settings: Settings): CalculatedGasDensity {
    let calculatedGasDensity: CalculatedGasDensity;
    let form = this.gasDensityFormService.getGasDensityFormFromObj(baseGasDensityData, settings);
    if (this.isWetBulbValid(form)) {
      calculatedGasDensity = this.fsatService.getBaseGasDensityWetBulb(baseGasDensityData, settings);
    }
    return calculatedGasDensity;
  }

  isWetBulbValid(gasDensityForm: FormGroup): boolean {
    return (gasDensityForm.controls.dryBulbTemp.valid && gasDensityForm.controls.staticPressure.valid
      && gasDensityForm.controls.specificGravity.valid && gasDensityForm.controls.wetBulbTemp.valid);
  }

  calcDensityRelativeHumidity(baseGasDensityData: BaseGasDensity, settings: Settings): CalculatedGasDensity {
    let calculatedGasDensity: CalculatedGasDensity;
    let form = this.gasDensityFormService.getGasDensityFormFromObj(baseGasDensityData, settings);
    if (this.isRelativeHumidityValid(form)) {
      calculatedGasDensity = this.fsatService.getBaseGasDensityRelativeHumidity(baseGasDensityData, settings);
    }
    return calculatedGasDensity;
  }

  isRelativeHumidityValid(gasDensityForm: FormGroup): boolean {
    return (gasDensityForm.controls.dryBulbTemp.valid && gasDensityForm.controls.staticPressure.valid
      && gasDensityForm.controls.specificGravity.valid && gasDensityForm.controls.relativeHumidity.valid);
  }

  calcDensityDewPoint(baseGasDensityData: BaseGasDensity, settings: Settings): CalculatedGasDensity {
    let calculatedGasDensity: CalculatedGasDensity;
    let form = this.gasDensityFormService.getGasDensityFormFromObj(baseGasDensityData, settings);
    if (this.isDewPointValid(form)) {
      calculatedGasDensity = this.fsatService.getBaseGasDensityDewPoint(baseGasDensityData, settings);
    }
    return calculatedGasDensity;
  }

  isDewPointValid(gasDensityForm: FormGroup) {
    return (gasDensityForm.controls.dryBulbTemp.valid && gasDensityForm.controls.staticPressure.valid
      && gasDensityForm.controls.specificGravity.valid && gasDensityForm.controls.dewPoint.valid);
  }
}
