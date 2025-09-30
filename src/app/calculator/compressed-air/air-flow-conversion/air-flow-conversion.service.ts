import { Injectable } from '@angular/core';
import { AirFlowConversionInput, AirFlowConversionOutput } from '../../../shared/models/compressed-air/compressed-air';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { cagiConditionsImperial, cagiConditionsMetric } from '../compressed-air-constants'
import { SaturatedPropertiesInput } from '../../../shared/models/steam/steam-inputs';
import { SaturatedPropertiesOutput } from '../../../shared/models/steam/steam-outputs';
import { SteamSuiteApiService } from '../../../tools-suite-api/steam-suite-api.service';
import { ConvertValue } from '../../../shared/convert-units/ConvertValue';

@Injectable()
export class AirFlowConversionService {

  airFlowConversionInput: BehaviorSubject<AirFlowConversionInput>;
  airFlowConversionOutput: BehaviorSubject<AirFlowConversionOutput>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;

  constructor(private steamSuiteApiService: SteamSuiteApiService,
    private formBuilder: UntypedFormBuilder) {
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.airFlowConversionInput = new BehaviorSubject<AirFlowConversionInput>(undefined);
    this.airFlowConversionOutput = new BehaviorSubject<AirFlowConversionOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  initDefaultEmptyInputs(settings: Settings) {
    let emptyInput = this.getEmptyAirFlowConversionInput(settings);
    this.airFlowConversionInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: AirFlowConversionOutput = {
      acfm: 0,
      scfm: 0
    };
    this.airFlowConversionOutput.next(emptyOutput);
  }

  getAirFlowConversionFormFromObj(inputObj: AirFlowConversionInput, settings: Settings): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      elevation: [inputObj.elevation],
      userDefinedPressure: [inputObj.userDefinedPressure],
      convertToStandard: [inputObj.convertToStandard],
      actualAtmosphericPressure: [inputObj.actualAtmosphericPressure],
      actualAmbientTemperature: [inputObj.actualAmbientTemperature],
      actualRelativeHumidity: [inputObj.actualRelativeHumidity],
      acfm: [inputObj.acfm],
      scfm: [inputObj.scfm],
      standardAtmosphericPressure: [inputObj.standardAtmosphericPressure],
      standardAmbientTemperature: [inputObj.standardAmbientTemperature],
      standardRelativeHumidity: [inputObj.standardRelativeHumidity],
      actualSaturatedVaporPressure: [inputObj.actualSaturatedVaporPressure],
      standardSaturatedVaporPressure: [inputObj.standardSaturatedVaporPressure],
    });
    form = this.setValidators(form, settings);
    return form;
  }

  getEmptyAirFlowConversionInput(settings: Settings) {
    let cagiConditionDefaults = JSON.parse(JSON.stringify(cagiConditionsImperial));
    let actualAmbientTemperature = 32;
    if (settings.unitsOfMeasure == "Metric") {
      cagiConditionDefaults = JSON.parse(JSON.stringify(cagiConditionsMetric));
      actualAmbientTemperature = 0;
    }
    let emptyInput: AirFlowConversionInput = {
      elevation: 0,
      userDefinedPressure: true,
      convertToStandard: true,
      actualAtmosphericPressure: 0,
      actualAmbientTemperature: actualAmbientTemperature,
      actualRelativeHumidity: 0,
      acfm: 0,
      scfm: 0,
      standardAtmosphericPressure: cagiConditionDefaults.standardAtmosphericPressure,
      standardAmbientTemperature: cagiConditionDefaults.standardAmbientTemperature,
      standardRelativeHumidity: cagiConditionDefaults.standardRelativeHumidity,
      actualSaturatedVaporPressure: 0,
      standardSaturatedVaporPressure: 0,
    };
    return emptyInput;
  }

  generateExampleData(settings: Settings) {
    let cagiConditionDefaults = JSON.parse(JSON.stringify(cagiConditionsImperial));
    if (settings.unitsOfMeasure == "Metric") {
      cagiConditionDefaults = JSON.parse(JSON.stringify(cagiConditionsMetric));
    }
    let exampleInput: AirFlowConversionInput = {
      elevation: 0,
      userDefinedPressure: true,
      convertToStandard: true,
      actualAtmosphericPressure: 10.6,
      actualAmbientTemperature: 33,
      actualRelativeHumidity: 12,
      acfm: 150,
      scfm: 0,
      standardAtmosphericPressure: cagiConditionDefaults.standardAtmosphericPressure,
      standardAmbientTemperature: cagiConditionDefaults.standardAmbientTemperature,
      standardRelativeHumidity: cagiConditionDefaults.standardRelativeHumidity,
      actualSaturatedVaporPressure: 0,
      standardSaturatedVaporPressure: 0,
    };
    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }
    this.airFlowConversionInput.next(exampleInput);
  }

  convertExampleUnits(input: AirFlowConversionInput) {
    input.acfm = new ConvertValue(input.acfm, "ft3/min", "m3/min").convertedValue;
    input.actualAtmosphericPressure = new ConvertValue(input.actualAtmosphericPressure, "psia", "kPaa").convertedValue;
    input.actualAmbientTemperature = new ConvertValue(input.actualAmbientTemperature, "F", "C").convertedValue;

    input.acfm = this.roundVal(input.acfm);
    input.actualAtmosphericPressure = this.roundVal(input.actualAtmosphericPressure);
    input.actualAmbientTemperature = this.roundVal(input.actualAmbientTemperature);
    return input;
  }

  getAirFlowConversionObjFromForm(form: UntypedFormGroup): AirFlowConversionInput {
    let obj: AirFlowConversionInput = {
      elevation: form.controls.elevation.value,
      userDefinedPressure: form.controls.userDefinedPressure.value,
      convertToStandard: form.controls.convertToStandard.value,
      actualAtmosphericPressure: form.controls.actualAtmosphericPressure.value,
      actualAmbientTemperature: form.controls.actualAmbientTemperature.value,
      actualRelativeHumidity: form.controls.actualRelativeHumidity.value,
      acfm: form.controls.acfm.value,
      scfm: form.controls.scfm.value,
      standardAtmosphericPressure: form.controls.standardAtmosphericPressure.value,
      standardAmbientTemperature: form.controls.standardAmbientTemperature.value,
      standardRelativeHumidity: form.controls.standardRelativeHumidity.value,
      actualSaturatedVaporPressure: form.controls.actualSaturatedVaporPressure.value,
      standardSaturatedVaporPressure: form.controls.standardSaturatedVaporPressure.value,
    };
    return obj;
  }

  setValidators(form: UntypedFormGroup, settings: Settings): UntypedFormGroup {
    form.controls.elevation.setValidators([Validators.min(0)]);
    form.controls.actualAtmosphericPressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.actualRelativeHumidity.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    form.controls.standardRelativeHumidity.setValidators([Validators.required, Validators.min(0), Validators.max(40)]);

    if (settings.unitsOfMeasure == "Metric") {
      form.controls.actualAmbientTemperature.setValidators([Validators.required, Validators.min(0)]);
      form.controls.standardAtmosphericPressure.setValidators([Validators.required, Validators.min(99.97), Validators.max(101.35)]);
      form.controls.standardAmbientTemperature.setValidators([Validators.required, Validators.min(0), Validators.max(25)]);
    } else {
      form.controls.actualAmbientTemperature.setValidators([Validators.required, Validators.min(32)]);
      form.controls.standardAtmosphericPressure.setValidators([Validators.required, Validators.min(14.5), Validators.max(14.7)]);
      form.controls.standardAmbientTemperature.setValidators([Validators.required, Validators.min(32), Validators.max(77)]);
    }

    form.controls.acfm.setValidators([Validators.required, Validators.min(0)]);
    form.controls.scfm.setValidators([Validators.required, Validators.min(0)]);
    return form;
  }

  calculate(settings: Settings): void {
    let airFlowConversionInput = this.airFlowConversionInput.value;
    let inputCopy: AirFlowConversionInput = JSON.parse(JSON.stringify(airFlowConversionInput));
    let validInput: boolean = this.getAirFlowConversionFormFromObj(inputCopy, settings).valid;
    if (!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
      inputCopy = this.convertInputUnits(inputCopy, settings);
      inputCopy.actualSaturatedVaporPressure = this.getSaturatedVaporPressure(inputCopy.actualAmbientTemperature);
      inputCopy.standardSaturatedVaporPressure = this.getSaturatedVaporPressure(inputCopy.standardAmbientTemperature);

      let airFlowConversionOutput: AirFlowConversionOutput = this.convertCFM(inputCopy);
      this.airFlowConversionOutput.next(airFlowConversionOutput);
    }
  }

  convertCFM(input: AirFlowConversionInput): AirFlowConversionOutput {
    let numeratorOp = input.standardAtmosphericPressure - (input.standardRelativeHumidity * input.standardSaturatedVaporPressure);
    let denominatorOp = input.actualAtmosphericPressure - (input.actualRelativeHumidity * input.actualSaturatedVaporPressure);
    let intermediateOp = (numeratorOp / denominatorOp) * (input.actualAmbientTemperature / input.standardAmbientTemperature);

    let acfmResult;
    let scfmResult;
    if (input.convertToStandard) {
      let result = input.acfm / intermediateOp;
      scfmResult = result;
    } else {
      let result = input.scfm * intermediateOp;
      acfmResult = result
    }

    let airFlowConversionOutput: AirFlowConversionOutput = {
      scfm: scfmResult,
      acfm: acfmResult
    }
    return airFlowConversionOutput;
  }

  convertInputUnits(input: AirFlowConversionInput, settings: Settings) {
    input.actualRelativeHumidity = input.actualRelativeHumidity / 100;
    input.standardRelativeHumidity = input.standardRelativeHumidity / 100;

    if (settings.unitsOfMeasure == "Metric") {
      input.actualAmbientTemperature = new ConvertValue(input.actualAmbientTemperature, "C", "K").convertedValue;
      input.standardAmbientTemperature = new ConvertValue(input.standardAmbientTemperature, "C", "K").convertedValue;
      input.actualAtmosphericPressure = new ConvertValue(input.actualAtmosphericPressure, "kPaa", "psia").convertedValue;
      input.standardAtmosphericPressure = new ConvertValue(input.standardAtmosphericPressure, "kPaa", "psia").convertedValue;
    } else {
      input.actualAmbientTemperature = new ConvertValue(input.actualAmbientTemperature, "F", "K").convertedValue;
      input.standardAmbientTemperature = new ConvertValue(input.standardAmbientTemperature, "F", "K").convertedValue;
    }

    return input;
  }

  calculatePressureFromElevation(elevation: number, settings): number {
    if (settings.unitsOfMeasure != 'Metric') {
      elevation = new ConvertValue(elevation, "ft", "m").convertedValue;
    }
    let numeratorOp = 1 - (Math.pow(10, -5) * 2.25577 * elevation);
    let denominatorOp = Math.pow(numeratorOp, 5.25588)
    let result = 101325 * denominatorOp;

    if (settings.unitsOfMeasure != 'Metric') {
      result = new ConvertValue(result, "Pa", "psia").convertedValue;
    } else {
      result = new ConvertValue(result, "Pa", "kPaa").convertedValue;
    }
    return result;
  }

  getSaturatedVaporPressure(temperature: number): number {
    let saturatedPropertiesInput: SaturatedPropertiesInput = {
      saturatedTemperature: temperature
    }
    let output: SaturatedPropertiesOutput;
    output = this.steamSuiteApiService.saturatedPropertiesGivenTemperature(saturatedPropertiesInput);
    output.saturatedPressure = new ConvertValue(output.saturatedPressure, "MPaa", "psia").convertedValue;

    return output.saturatedPressure;
  }

  roundVal(num: number): number {
    return Number(num.toFixed(3));
  }

}
