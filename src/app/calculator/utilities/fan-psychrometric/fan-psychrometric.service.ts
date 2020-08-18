import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PsychrometricResults, BaseGasDensity } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { FsatService } from '../../../fsat/fsat.service';
import { GasDensityFormService } from '../../fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable()
export class FanPsychrometricService {
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  
  baseGasDensityData: BehaviorSubject<BaseGasDensity>;
  calculatedBaseGasDensity: BehaviorSubject<PsychrometricResults>;
  psychrometricResults: BehaviorSubject<Array<PsychrometricResults>>;
  
  constructor(private gasDensityFormService: GasDensityFormService,
              private convertUnitsService: ConvertUnitsService,
              private fsatService: FsatService) {
    this.currentField = new BehaviorSubject<string>('default'); 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    
    this.psychrometricResults = new BehaviorSubject<Array<PsychrometricResults>>(undefined);
    this.baseGasDensityData = new BehaviorSubject<BaseGasDensity>(undefined);
    this.calculatedBaseGasDensity = new BehaviorSubject<PsychrometricResults>(undefined);
   }

   getDefaultData(settings: Settings): BaseGasDensity {
    let barometricPressure = 29.92;
    if (settings.unitsOfMeasure == 'Metric') {
      barometricPressure = this.convertUnitsService.value(barometricPressure).from('inHg').to('kPaa')
    }
    let data: BaseGasDensity = {
        dryBulbTemp: undefined,
        staticPressure: 0,
        barometricPressure: barometricPressure,
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

  getExampleData(settings: Settings): BaseGasDensity {
    let barometricPressure = 26.57;
    if (settings.unitsOfMeasure == 'Metric') {
      barometricPressure = this.convertUnitsService.value(barometricPressure).from('inHg').to('kPaa')
    }

    let data: BaseGasDensity = {
      dryBulbTemp: 123,
      staticPressure: 0,
      barometricPressure: barometricPressure,
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
    let psychrometricResults: PsychrometricResults;
    if (inputType === 'relativeHumidity') {
      psychrometricResults = this.calcDensityRelativeHumidity(currentBaseGasDensity, settings);
    } else if (inputType === 'wetBulb') {
      psychrometricResults = this.calcDensityWetBulb(currentBaseGasDensity, settings);
    } else if (inputType === 'dewPoint') {
      psychrometricResults = this.calcDensityDewPoint(currentBaseGasDensity, settings);
    }

    this.calculatedBaseGasDensity.next(psychrometricResults);
  }

  calcDensityWetBulb(baseGasDensityData: BaseGasDensity, settings: Settings): PsychrometricResults {
    let psychrometricResults: PsychrometricResults;
    let form = this.gasDensityFormService.getGasDensityFormFromObj(baseGasDensityData, settings);
    if (this.isWetBulbValid(form)) {
      psychrometricResults = this.fsatService.getPsychrometricWetBulb(baseGasDensityData, settings);
    }
    return psychrometricResults;
  }

  isWetBulbValid(gasDensityForm: FormGroup): boolean {
    return (gasDensityForm.controls.dryBulbTemp.valid && gasDensityForm.controls.staticPressure.valid
      && gasDensityForm.controls.specificGravity.valid && gasDensityForm.controls.wetBulbTemp.valid);
  }

  calcDensityRelativeHumidity(baseGasDensityData: BaseGasDensity, settings: Settings): PsychrometricResults {
    let psychrometricResults: PsychrometricResults;
    let form = this.gasDensityFormService.getGasDensityFormFromObj(baseGasDensityData, settings);
    if (this.isRelativeHumidityValid(form)) {
      psychrometricResults = this.fsatService.getPsychrometricRelativeHumidity(baseGasDensityData, settings);
    }
    return psychrometricResults;
  }

  isRelativeHumidityValid(gasDensityForm: FormGroup): boolean {
    return (gasDensityForm.controls.dryBulbTemp.valid && gasDensityForm.controls.staticPressure.valid
      && gasDensityForm.controls.specificGravity.valid && gasDensityForm.controls.relativeHumidity.valid);
  }

  calcDensityDewPoint(baseGasDensityData: BaseGasDensity, settings: Settings): PsychrometricResults {
    let psychrometricResults: PsychrometricResults;
    let form = this.gasDensityFormService.getGasDensityFormFromObj(baseGasDensityData, settings);
    if (this.isDewPointValid(form)) {
      psychrometricResults = this.fsatService.getPsychrometricDewPoint(baseGasDensityData, settings);
    }
    return psychrometricResults;
  }

  isDewPointValid(gasDensityForm: FormGroup) {
    return (gasDensityForm.controls.dryBulbTemp.valid && gasDensityForm.controls.staticPressure.valid
      && gasDensityForm.controls.specificGravity.valid && gasDensityForm.controls.dewPoint.valid);
  }
}
