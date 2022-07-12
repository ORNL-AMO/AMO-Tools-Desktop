import { Injectable } from '@angular/core';
import { BaseGasDensity, PsychrometricResults } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class GasDensityFormService {

  baselinePsychrometricResults: BehaviorSubject<PsychrometricResults>;
  modificationPsychrometricResults: BehaviorSubject<PsychrometricResults>;
  baselineCalculationType: BehaviorSubject<string>;
  modificationCalculationType: BehaviorSubject<string>;
  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: FormBuilder) {
    this.baselinePsychrometricResults = new BehaviorSubject<PsychrometricResults>(undefined);
    this.modificationPsychrometricResults = new BehaviorSubject<PsychrometricResults>(undefined);
    this.baselineCalculationType = new BehaviorSubject<string>(undefined);
    this.modificationCalculationType = new BehaviorSubject<string>(undefined)
  }

  getGasDensityFormFromObj(obj: BaseGasDensity, settings: Settings): FormGroup {
    let ranges: GasDensityRanges = this.getGasDensityRanges(settings, obj.dryBulbTemp);
    let form = this.formBuilder.group({
      inputType: [obj.inputType, Validators.required],
      gasType: [obj.gasType, Validators.required],
      dryBulbTemp: [obj.dryBulbTemp, [Validators.min(ranges.dryBulbTempMin), Validators.max(ranges.dryBulbTempMax)]],
      staticPressure: [obj.staticPressure, [Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]],
      altitude: [obj.altitude],
      barometricPressure: [obj.barometricPressure, [Validators.min(ranges.barPressureMin), Validators.max(ranges.barPressureMax)]],
      specificGravity: [obj.specificGravity, [Validators.min(0), Validators.max(2)]],
      wetBulbTemp: [obj.wetBulbTemp],
      relativeHumidity: [obj.relativeHumidity, [Validators.min(0), Validators.max(100)]],
      dewPoint: [obj.dewPoint, [Validators.min(ranges.dewPointMin), Validators.max(ranges.dewPointMax)]],
      gasDensity: [obj.gasDensity, [Validators.required, Validators.min(0), Validators.max(ranges.gasDensityMax)]],
      specificHeatGas: [obj.specificHeatGas]
    });
    this.setCustomValidators(form, ranges);
    this.setRelativeHumidityValidators(form);
    this.setWetBulbValidators(form, ranges);
    this.setDewPointValidators(form, ranges);
    this.setCustomValidators(form, ranges);
    return form;
  }

  getGasDensityRanges(settings: Settings, dryBulbTemp: number): GasDensityRanges {
    let ranges: GasDensityRanges = {
      barPressureMin: 10,
      barPressureMax: 60,
      dryBulbTempMin: -100,
      dryBulbTempMax: 1000,
      staticPressureMin: -400,
      staticPressureMax: 400,
      wetBulbTempMin: 32,
      wetBulbTempMax: dryBulbTemp,
      dewPointMin: -30,
      dewPointMax: dryBulbTemp,
      gasDensityMax: .2
    };
    if (settings.fanBarometricPressure !== 'inHg') {
      ranges.barPressureMax = this.convertUnitsService.value(ranges.barPressureMax).from('inHg').to(settings.fanBarometricPressure);
      ranges.barPressureMax = Number(ranges.barPressureMax.toFixed(0));
      ranges.barPressureMin = this.convertUnitsService.value(ranges.barPressureMin).from('inHg').to(settings.fanBarometricPressure);
      ranges.barPressureMin = Number(ranges.barPressureMin.toFixed(0));
    }
    if (settings.fanTemperatureMeasurement !== 'F') {
      ranges.dryBulbTempMin = this.convertUnitsService.value(ranges.dryBulbTempMin).from('F').to(settings.fanTemperatureMeasurement);
      ranges.dryBulbTempMin = Number(ranges.dryBulbTempMin.toFixed(0));
      ranges.dryBulbTempMax = this.convertUnitsService.value(ranges.dryBulbTempMax).from('F').to(settings.fanTemperatureMeasurement);
      ranges.dryBulbTempMax = Number(ranges.dryBulbTempMax.toFixed(0));
      ranges.wetBulbTempMin = this.convertUnitsService.value(ranges.wetBulbTempMin).from('F').to(settings.fanTemperatureMeasurement);
      ranges.wetBulbTempMin = Number(ranges.wetBulbTempMin.toFixed(0));
      // ranges.wetBulbTempMax = this.convertUnitsService.value(ranges.wetBulbTempMax).from('F').to(settings.fanTemperatureMeasurement);
      // ranges.wetBulbTempMax = Number(ranges.wetBulbTempMax.toFixed(0));
      ranges.dewPointMin = this.convertUnitsService.value(ranges.dewPointMin).from('F').to(settings.fanTemperatureMeasurement);
      ranges.dewPointMin = Number(ranges.dewPointMin.toFixed(0));
      // ranges.dewPointMax = this.convertUnitsService.value(ranges.dewPointMax).from('F').to(settings.fanTemperatureMeasurement);
      // ranges.dewPointMax = Number(ranges.dewPointMax.toFixed(0));
    }
    if (settings.densityMeasurement !== 'lbscf') {
      ranges.gasDensityMax = this.convertUnitsService.value(ranges.gasDensityMax).from('lbscf').to(settings.densityMeasurement);
      ranges.gasDensityMax = Number(ranges.gasDensityMax.toFixed(0));
    }
    if (settings.fanPressureMeasurement !== 'inH2o') {
      ranges.staticPressureMin = this.convertUnitsService.value(ranges.staticPressureMin).from('inH2o').to(settings.fanPressureMeasurement);
      ranges.staticPressureMin = Number(ranges.staticPressureMin.toFixed(0));
      ranges.staticPressureMax = this.convertUnitsService.value(ranges.staticPressureMax).from('inH2o').to(settings.fanPressureMeasurement);
      ranges.staticPressureMax = Number(ranges.staticPressureMax.toFixed(0));
    }
    return ranges;
  }

  setCustomValidators(form: FormGroup, ranges: GasDensityRanges) {
    if (form.controls.inputType.value === 'custom') {
      //dryBulbTemp
      form.controls.dryBulbTemp.setValidators([Validators.min(ranges.dryBulbTempMin), Validators.max(ranges.dryBulbTempMax)]);
      form.controls.dryBulbTemp.reset(form.controls.dryBulbTemp.value);
      if (form.controls.dryBulbTemp.value) {
        form.controls.dryBulbTemp.markAsDirty();
      }
      //staticPressure
      form.controls.staticPressure.setValidators([Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]);
      form.controls.staticPressure.reset(form.controls.staticPressure.value);
      if (form.controls.staticPressure.value) {
        form.controls.staticPressure.markAsDirty();
      }
      //barometricPressure
      form.controls.barometricPressure.setValidators([Validators.min(ranges.barPressureMin), Validators.max(ranges.barPressureMax)]);
      form.controls.barometricPressure.reset(form.controls.barometricPressure.value);
      if (form.controls.barometricPressure.value) {
        form.controls.barometricPressure.markAsDirty();
      }
      //specificGravity
      form.controls.specificGravity.setValidators([Validators.min(0), Validators.max(2)]);
      form.controls.specificGravity.reset(form.controls.specificGravity.value);
      if (form.controls.specificGravity.value) {
        form.controls.specificGravity.markAsDirty();
      }
    } else {
      //set required
      //dryBulbTemp
      form.controls.dryBulbTemp.setValidators([Validators.required, Validators.min(ranges.dryBulbTempMin), Validators.max(ranges.dryBulbTempMax)]);
      form.controls.dryBulbTemp.reset(form.controls.dryBulbTemp.value);
      if (form.controls.dryBulbTemp.value) {
        form.controls.dryBulbTemp.markAsDirty();
      }
      //staticPressure
      form.controls.staticPressure.setValidators([Validators.required, Validators.min(ranges.staticPressureMin), Validators.max(ranges.staticPressureMax)]);
      form.controls.staticPressure.reset(form.controls.staticPressure.value);
      if (form.controls.staticPressure.value) {
        form.controls.staticPressure.markAsDirty();
      }
      //barometricPressure
      form.controls.barometricPressure.setValidators([Validators.required, Validators.min(ranges.barPressureMin), Validators.max(ranges.barPressureMax)]);
      form.controls.barometricPressure.reset(form.controls.barometricPressure.value);
      if (form.controls.barometricPressure.value) {
        form.controls.barometricPressure.markAsDirty();
      }
      //specificGravity
      form.controls.specificGravity.setValidators([Validators.required, Validators.min(0), Validators.max(2)]);
      form.controls.specificGravity.reset(form.controls.specificGravity.value);
      if (form.controls.specificGravity.value) {
        form.controls.specificGravity.markAsDirty();
      }
    }
  }

  setRelativeHumidityValidators(form: FormGroup) {
    if (form.controls.inputType.value === 'relativeHumidity') {
      form.controls.relativeHumidity.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      form.controls.relativeHumidity.reset(form.controls.relativeHumidity.value);
      if (form.controls.relativeHumidity.value) {
        form.controls.relativeHumidity.markAsDirty();
      }
    } else {
      form.controls.relativeHumidity.setValidators([Validators.min(0), Validators.max(100)]);
      form.controls.relativeHumidity.reset(form.controls.relativeHumidity.value);
      if (form.controls.relativeHumidity.value) {
        form.controls.relativeHumidity.markAsDirty();
      }
    }
  }

  setWetBulbValidators(form: FormGroup, ranges: GasDensityRanges) {
    if (form.controls.inputType.value === 'wetBulb') {
      form.controls.wetBulbTemp.setValidators([Validators.required, Validators.min(ranges.wetBulbTempMin), Validators.max(ranges.wetBulbTempMax)]);
      form.controls.wetBulbTemp.reset(form.controls.wetBulbTemp.value);
      if (form.controls.wetBulbTemp.value) {
        form.controls.wetBulbTemp.markAsDirty();
      }
      form.controls.specificHeatGas.setValidators([Validators.required]);
      form.controls.specificHeatGas.reset(form.controls.specificHeatGas.value);
      if (form.controls.specificHeatGas.value) {
        form.controls.specificHeatGas.markAsDirty();
      }
    } else {
      form.controls.specificHeatGas.setValidators([]);
      form.controls.specificHeatGas.reset(form.controls.specificHeatGas.value);
      if (form.controls.specificHeatGas.value) {
        form.controls.specificHeatGas.markAsDirty();
      }
    }
  }

  setDewPointValidators(form: FormGroup, ranges: GasDensityRanges) {
    if (form.controls.inputType.value === 'dewPoint') {
      form.controls.dewPoint.setValidators([Validators.required, Validators.min(ranges.dewPointMin), Validators.max(ranges.dewPointMax)]);
      form.controls.dewPoint.reset(form.controls.dewPoint.value);
      if (form.controls.dewPoint.value) {
        form.controls.dewPoint.markAsDirty();
      }
    } else {
      form.controls.dewPoint.setValidators([Validators.min(ranges.dewPointMin), Validators.max(ranges.dewPointMax)]);
      form.controls.dewPoint.reset(form.controls.dewPoint.value);
      if (form.controls.dewPoint.value) {
        form.controls.dewPoint.markAsDirty();
      }
    }
  }

  getGasDensityObjFromForm(form: FormGroup): BaseGasDensity {
    let fanGasDensity: BaseGasDensity = {
      inputType: form.controls.inputType.value,
      gasType: form.controls.gasType.value,
      dryBulbTemp: form.controls.dryBulbTemp.value,
      staticPressure: form.controls.staticPressure.value,
      barometricPressure: form.controls.barometricPressure.value,
      specificGravity: form.controls.specificGravity.value,
      wetBulbTemp: form.controls.wetBulbTemp.value,
      relativeHumidity: form.controls.relativeHumidity.value,
      dewPoint: form.controls.dewPoint.value,
      gasDensity: form.controls.gasDensity.value,
      specificHeatGas: form.controls.specificHeatGas.value
    };
    return fanGasDensity;
  }

  setValidators(gasDensityForm: FormGroup, settings: Settings) {
    let ranges: GasDensityRanges = this.getGasDensityRanges(settings, gasDensityForm.controls.dryBulbTemp.value);
    this.setRelativeHumidityValidators(gasDensityForm);
    this.setWetBulbValidators(gasDensityForm, ranges);
    this.setDewPointValidators(gasDensityForm, ranges);
    this.setCustomValidators(gasDensityForm, ranges);
    return gasDensityForm;
  }

}


export interface GasDensityRanges {
  barPressureMin: number;
  barPressureMax: number;
  dryBulbTempMin: number;
  dryBulbTempMax: number;
  staticPressureMin: number;
  staticPressureMax: number;
  wetBulbTempMin: number;
  wetBulbTempMax: number;
  dewPointMin: number;
  dewPointMax: number;
  gasDensityMax: number;
}
