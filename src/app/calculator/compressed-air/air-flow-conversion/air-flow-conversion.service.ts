import { Injectable } from '@angular/core';
import { AirFlowConversionInput, AirFlowConversionOutput } from '../../../shared/models/compressed-air/compressed-air';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { cagiConditionsImperial, cagiConditionsMetric, asmeConditionsMetric, asmeConditionsImperial, DefaultCondition } from '../compressed-air-constants'
import { SaturatedPropertiesInput } from '../../../shared/models/steam/steam-inputs';
import { SaturatedPropertiesOutput } from '../../../shared/models/steam/steam-outputs';

declare var steamAddon: any;

@Injectable()
export class AirFlowConversionService {

  airFlowConversionInput: BehaviorSubject<AirFlowConversionInput>;
  airFlowConversionOutput: BehaviorSubject<AirFlowConversionOutput>;
  resetData: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  generateExample: BehaviorSubject<boolean>;

  constructor(private convertUnitsService: ConvertUnitsService,
              private formBuilder: FormBuilder) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>('default');
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
  
  getAirFlowConversionFormFromObj(inputObj: AirFlowConversionInput): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      elevation: [inputObj.elevation ],
      userDefinedPressure: [inputObj.userDefinedPressure],
      convertToStandard: [inputObj.convertToStandard],
      actualAtmosphericPressure: [inputObj.actualAtmosphericPressure ],
      actualAmbientTemperature: [inputObj.actualAmbientTemperature ],
      actualRelativeHumidity: [inputObj.actualRelativeHumidity ],
      conditionsMethod: [inputObj.conditionsMethod ],
      acfm: [inputObj.acfm],
      scfm: [inputObj.scfm],
      // standardAtmosphericPressure: new FormControl({value: inputObj.standardAtmosphericPressure, disabled: true}),
      // standardAmbientTemperature: new FormControl({value: inputObj.standardAmbientTemperature, disabled: true}),
      // standardRelativeHumidity: new FormControl({value: inputObj.standardRelativeHumidity, disabled: true}),
      standardAtmosphericPressure: [inputObj.standardAtmosphericPressure],
      standardAmbientTemperature: [inputObj.standardAmbientTemperature],
      standardRelativeHumidity: [inputObj.standardRelativeHumidity],
      actualSaturatedVaporPressure: [inputObj.actualSaturatedVaporPressure],
      standardSaturatedVaporPressure: [inputObj.standardSaturatedVaporPressure],
    });
    form = this.setValidators(form);
    return form;
  }

  getEmptyAirFlowConversionInput(settings: Settings) {
    let asmeConversionDefaults = asmeConditionsImperial;
    if (settings.unitsOfMeasure == "Metric") {
      asmeConversionDefaults = asmeConditionsMetric;
    }
    let emptyInput: AirFlowConversionInput = {
      elevation: 0,
      userDefinedPressure: true,
      convertToStandard: true,
      actualAtmosphericPressure: 0,
      actualAmbientTemperature: 0,
      actualRelativeHumidity: 0,
      conditionsMethod: 'ASME',
      acfm: 0,
      scfm: 0,
      standardAtmosphericPressure: asmeConversionDefaults.standardAtmosphericPressure,
      standardAmbientTemperature: asmeConversionDefaults.standardAmbientTemperature,
      standardRelativeHumidity: asmeConversionDefaults.standardRelativeHumidity,
      actualSaturatedVaporPressure: 0,
      standardSaturatedVaporPressure: 0,
    };
    return emptyInput;
  }

  
  getExampleAirFlowConversionInput(settings: Settings) {
    let cagiConversionDefaults = JSON.parse(JSON.stringify(cagiConditionsImperial));
    if (settings.unitsOfMeasure == "Metric") {
      cagiConversionDefaults = JSON.parse(JSON.stringify(cagiConditionsMetric));
    }
    let exampleInput: AirFlowConversionInput = {
      elevation: 0,
      userDefinedPressure: true,
      convertToStandard: true,
      actualAtmosphericPressure: 10.6,
      actualAmbientTemperature: 33,
      actualRelativeHumidity: 12,
      conditionsMethod: 'CAGI',
      acfm: 150,
      scfm: 0,
      standardAtmosphericPressure: cagiConversionDefaults.standardAtmosphericPressure,
      standardAmbientTemperature: cagiConversionDefaults.standardAmbientTemperature,
      standardRelativeHumidity: cagiConversionDefaults.standardRelativeHumidity,
      actualSaturatedVaporPressure: 0,
      standardSaturatedVaporPressure: 0,
    };
    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }
    return exampleInput;
  }
  
  setFormConditionMethodDefaults(form: FormGroup, settings: Settings): FormGroup {
    let defaults: DefaultCondition;
    if (form.controls.conditionsMethod.value == 'ASME') {
      defaults = asmeConditionsImperial;
      if (settings.unitsOfMeasure == 'Metric') {
        defaults = asmeConditionsMetric;
      }
      form.patchValue({
        standardAtmosphericPressure: defaults.standardAtmosphericPressure,
        standardAmbientTemperature: defaults.standardAmbientTemperature,
        standardRelativeHumidity: defaults.standardRelativeHumidity
      })
    } else {
      defaults = cagiConditionsImperial;
      if (settings.unitsOfMeasure == 'Metric') {
        defaults = cagiConditionsMetric;
      }
      form.patchValue({
        standardAtmosphericPressure: defaults.standardAtmosphericPressure,
        standardAmbientTemperature: defaults.standardAmbientTemperature,
        standardRelativeHumidity: defaults.standardRelativeHumidity
      })
    }
    return form;
  }

  convertExampleUnits(input: AirFlowConversionInput) {
    input.acfm = this.convertUnitsService.value(input.acfm).from("ft3/min").to("m3/min")
    input.actualAtmosphericPressure = this.convertUnitsService.value(input.actualAtmosphericPressure).from('psia').to('MPaa');
    input.actualAmbientTemperature = this.convertUnitsService.value(input.actualAmbientTemperature).from('F').to('C');

    input.acfm = this.roundVal(input.acfm);
    input.actualAtmosphericPressure = this.roundVal(input.actualAtmosphericPressure);
    input.actualAmbientTemperature = this.roundVal(input.actualAmbientTemperature);
    return input;
  }

  getAirFlowConversionObjFromForm(form: FormGroup): AirFlowConversionInput {
    let obj: AirFlowConversionInput = {
      elevation: form.controls.elevation.value,
      userDefinedPressure: form.controls.userDefinedPressure.value,
      convertToStandard: form.controls.convertToStandard.value,
      actualAtmosphericPressure: form.controls.actualAtmosphericPressure.value,
      actualAmbientTemperature: form.controls.actualAmbientTemperature.value,
      actualRelativeHumidity: form.controls.actualRelativeHumidity.value,
      conditionsMethod: form.controls.conditionsMethod.value,
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

  generateExampleData(settings: Settings) {
    let exampleConverion = this.getExampleAirFlowConversionInput(settings);
    let exampleInput: AirFlowConversionInput = JSON.parse(JSON.stringify(exampleConverion));
    this.airFlowConversionInput.next(exampleInput);
  }

  setValidators(form: FormGroup): FormGroup {
    form.controls.elevation.setValidators([Validators.min(0)]);
    form.controls.actualAtmosphericPressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.actualAmbientTemperature.setValidators([Validators.required]);
    form.controls.actualRelativeHumidity.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    form.controls.standardAtmosphericPressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.standardAmbientTemperature.setValidators([Validators.required]);
    form.controls.standardRelativeHumidity.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    
    form.controls.acfm.setValidators([Validators.required, Validators.min(0)]);
    form.controls.scfm.setValidators([Validators.required, Validators.min(0)]);
    return form;
  }

   calculate(settings: Settings): void {
    let airFlowConversionInput = this.airFlowConversionInput.value;
    let inputCopy: AirFlowConversionInput = JSON.parse(JSON.stringify(airFlowConversionInput));
    let validInput: boolean = this.getAirFlowConversionFormFromObj(inputCopy).valid;
    if(!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
      inputCopy.actualRelativeHumidity = inputCopy.actualRelativeHumidity / 100;
      inputCopy.standardRelativeHumidity = inputCopy.standardRelativeHumidity / 100;
      if (settings.unitsOfMeasure == "Metric") {
        inputCopy.actualAmbientTemperature = this.convertUnitsService.value(inputCopy.actualAmbientTemperature).from('C').to('F');
        inputCopy.standardAmbientTemperature = this.convertUnitsService.value(inputCopy.standardAmbientTemperature).from('C').to('F');
      }
      inputCopy.actualSaturatedVaporPressure = this.getSaturatedVaporPressure(inputCopy.actualAmbientTemperature, settings);
      inputCopy.standardSaturatedVaporPressure = this.getSaturatedVaporPressure(inputCopy.standardAmbientTemperature, settings);
      let airFlowConversionOutput: AirFlowConversionOutput = this.convertCFM(inputCopy, settings);
      this.airFlowConversionOutput.next(airFlowConversionOutput);
    }
  }

  convertCFM(input: AirFlowConversionInput, settings): AirFlowConversionOutput {
    if (settings.unitsOfMeasure =="Metric") {
      input.actualAtmosphericPressure = this.convertUnitsService.value(input.actualAtmosphericPressure).from('MPaa').to('psia');
      input.standardAtmosphericPressure = this.convertUnitsService.value(input.standardAtmosphericPressure).from('MPaa').to('psia');
      input.actualAtmosphericPressure = this.roundVal(input.actualAtmosphericPressure);
      input.standardAtmosphericPressure = this.roundVal(input.standardAtmosphericPressure);
    }

    let numeratorOp = input.standardAtmosphericPressure - (input.standardRelativeHumidity * input.standardSaturatedVaporPressure);
    let denominatorOp = input.actualAtmosphericPressure - (input.actualRelativeHumidity * input.actualSaturatedVaporPressure);

    let actualKelvin = this.convertUnitsService.value(input.actualAmbientTemperature).from('F').to('K');
    let standardKelvin = this.convertUnitsService.value(input.standardAmbientTemperature).from('F').to('K');
    let intermediateOp = (numeratorOp / denominatorOp) * (actualKelvin / standardKelvin);

    // testing output
    // console.log('RH', input.actualRelativeHumidity);
    // console.log('T', input.actualAmbientTemperature);
    // console.log('Atm P', input.actualAtmosphericPressure);
    // console.log('SatP', input.standardSaturatedVaporPressure);
    // console.log('actualKelvin', actualKelvin);
    // console.log('standardKelvin', standardKelvin);

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
  
  calculatePressureFromElevation(elevation: number, settings): number {
    if (settings.unitsOfMeasure != 'Metric') {
      elevation = this.convertUnitsService.value(elevation).from('ft').to('m')
    }
    let elevationOp = elevation / 3.28084;
    let numeratorOp = 1 - (Math.pow(10, -5) * 2.25577 * elevationOp);
    let denominatorOp = Math.pow(numeratorOp, 5.25588)
    let result = 101325 * denominatorOp;

    if (settings.unitsOfMeasure != 'Metric') {
      result = this.convertUnitsService.value(result).from('Pa').to('psia')
    } else {
      result = this.convertUnitsService.value(result).from('Pa').to('kPaa')
    }
    return result;
  }

  getSaturatedVaporPressure(temperature: number, settings: Settings): number {
    let saturatedPropertiesInput: SaturatedPropertiesInput = {
      saturatedTemperature: temperature
    }
    saturatedPropertiesInput.saturatedTemperature = this.convertUnitsService.value(saturatedPropertiesInput.saturatedTemperature).from('F').to('K');
    let output: SaturatedPropertiesOutput;
    output = steamAddon.saturatedPropertiesGivenTemperature(saturatedPropertiesInput);
    output.saturatedPressure = this.convertUnitsService.value(output.saturatedPressure).from('MPaa').to('psia');

    return output.saturatedPressure;
  }

  roundVal(num: number): number {
    return Number(num.toFixed(3));
  }

}
