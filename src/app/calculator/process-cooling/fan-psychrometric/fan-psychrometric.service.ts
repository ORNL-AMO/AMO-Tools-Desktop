import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PsychrometricResults, BaseGasDensity } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { FsatService } from '../../../fsat/fsat.service';
import { GasDensityFormService } from '../../fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';
import { ConvertFanAnalysisService } from '../../fans/fan-analysis/convert-fan-analysis.service';
import { DataPoint, TraceData } from '../../../shared/models/plotting';

@Injectable()
export class FanPsychrometricService {
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;  
  selectedDataPoints: BehaviorSubject<Array<TraceData>>;  
  disabledChartTab: BehaviorSubject<boolean>;  

  baseGasDensityData: BehaviorSubject<BaseGasDensity>;
  calculatedBaseGasDensity: BehaviorSubject<PsychrometricResults>;
  psychrometricResults: BehaviorSubject<Array<PsychrometricResults>>;

  constructor(private gasDensityFormService: GasDensityFormService,
    private fsatService: FsatService,
    private convertFanAnalysisService: ConvertFanAnalysisService) {
    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.selectedDataPoints = new BehaviorSubject<Array<TraceData>>([]);

    this.psychrometricResults = new BehaviorSubject<Array<PsychrometricResults>>(undefined);
    this.baseGasDensityData = new BehaviorSubject<BaseGasDensity>(undefined);
    this.calculatedBaseGasDensity = new BehaviorSubject<PsychrometricResults>(undefined);
    this.disabledChartTab = new BehaviorSubject<boolean>(true);
  }

  getDefaultData(settings: Settings): BaseGasDensity {
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
    data = this.convertFanAnalysisService.convertBaseGasDensityDefaults(data, settings);
    return data;
  }

  getExampleData(settings: Settings): BaseGasDensity {
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
    data = this.convertFanAnalysisService.convertBaseGasDensityDefaults(data, settings);
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
  isWetBulbValid(gasDensityForm: UntypedFormGroup): boolean {
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

  isRelativeHumidityValid(gasDensityForm: UntypedFormGroup): boolean {
    return (gasDensityForm.controls.dryBulbTemp.valid && gasDensityForm.controls.staticPressure.valid && gasDensityForm.controls.barometricPressure.valid  
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

  isDewPointValid(gasDensityForm: UntypedFormGroup) {
    return (gasDensityForm.controls.dryBulbTemp.valid && gasDensityForm.controls.staticPressure.valid
      && gasDensityForm.controls.specificGravity.valid && gasDensityForm.controls.dewPoint.valid);
  }

  checkWarnings(results: PsychrometricResults): FanPsychrometricWarnings {
    let warnings: FanPsychrometricWarnings = {
      resultHumidityRatio: undefined,
      resultSaturationPressure: undefined,
      hasResultWarning: false,
    }
    if (results) {
      if (results.humidityRatio < 0) {
        warnings.resultHumidityRatio = `Data is producing a negative Humidity Ratio. Please review data`;
        warnings.hasResultWarning = true;
      }
      if (results.saturationPressure < 0) {
        warnings.resultSaturationPressure = `Data is producing a negative Saturation Pressure. Please review data`;
        warnings.hasResultWarning = true;
      }
    }
    return warnings;
  }
}


export interface FanPsychrometricWarnings {
  resultHumidityRatio: string,
  resultSaturationPressure: string,
  hasResultWarning: boolean,
  modificationName?: string,
}