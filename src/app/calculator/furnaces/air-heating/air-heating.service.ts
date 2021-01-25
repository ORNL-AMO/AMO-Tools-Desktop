import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { AirHeatingInput, AirHeatingOutput } from '../../../shared/models/phast/airHeating';
import { Settings } from '../../../shared/models/settings';
import { AirHeatingFormService } from './air-heating-form.service';

declare var processHeatAddon;

@Injectable()
export class AirHeatingService {

  airHeatingInput: BehaviorSubject<AirHeatingInput>;
  airHeatingOutput: BehaviorSubject<AirHeatingOutput>;
  
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;

  operatingHours: OperatingHours;
  constructor(private convertUnitsService: ConvertUnitsService, private airHeatingFormService: AirHeatingFormService) { 
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.airHeatingInput = new BehaviorSubject<AirHeatingInput>(undefined);
    this.airHeatingOutput = new BehaviorSubject<AirHeatingOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
  }

  initDefaultEmptyInputs() {
    let emptyInput: AirHeatingInput = {
      operatingHours: 8760,
      gasFuelType: true,
      materialTypeId: 1,
      flueTemperature: 0,
      flueGasO2: 0,
      oxygenCalculationMethod: 'Excess Air',
      excessAir: 0,
      fireRate: 0,
      airflow: 0,
      inletTemperature: 0,
      heaterEfficiency: 0,
      hxEfficiency: 0,
      substance: 'Typical Natural Gas - US',
      CH4: 87,
      C2H6: 8.5,
      N2: 3.6,
      H2: .4,
      C3H8: 0,
      C4H10_CnH2n: 0,
      H2O: 0,
      CO: 0,
      CO2: .4,
      SO2: 0,
      O2: .1,
    };
    this.airHeatingInput.next(emptyInput);
  }

  initDefaultEmptyOutputs() {
    let emptyOutput: AirHeatingOutput = {
      hxColdAir: 0,
      hxOutletExhaust: 0,
      energySavings: 0
    };
    this.airHeatingOutput.next(emptyOutput);
  }

  calculate(settings: Settings): void {
    let airHeatingInput: AirHeatingInput = this.airHeatingInput.getValue();
    let inputCopy: AirHeatingInput = JSON.parse(JSON.stringify(airHeatingInput));
    let validInput: boolean;
    validInput = this.airHeatingFormService.getAirHeatingForm(inputCopy).valid;
    
    if(!validInput) {
      this.initDefaultEmptyOutputs();
    } else {
        inputCopy = this.convertInputUnits(inputCopy, settings);
        inputCopy = this.convertPercentInputs(inputCopy);
        let airHeatingOutput: AirHeatingOutput = processHeatAddon.airHeatingUsingExhaust(inputCopy);
        airHeatingOutput = this.convertResultUnits(airHeatingOutput, settings);
        this.airHeatingOutput.next(airHeatingOutput);
    }
  }

  generateExampleData(settings: Settings) {
    let exampleInput: AirHeatingInput = {
      operatingHours: 8760,
      materialTypeId: 1,
      gasFuelType: true,
      flueTemperature: 400,
      flueGasO2: 5.8,
      oxygenCalculationMethod: 'Excess Air',
      excessAir: 35.8,
      fireRate: 8,
      airflow: 4000,
      inletTemperature: 45,
      heaterEfficiency: 85,
      hxEfficiency: 60,
      substance: 'Typical Natural Gas - US',
      CH4: 87,
      C2H6: 8.5,
      N2: 3.6,
      H2: .4,
      C3H8: 0,
      C4H10_CnH2n: 0,
      H2O: 0,
      CO: 0,
      CO2: .4,
      SO2: 0,
      O2: .1,
    };

    if (settings.unitsOfMeasure == 'Metric') {
      exampleInput = this.convertExampleUnits(exampleInput);
    }
    this.airHeatingInput.next(exampleInput);
  }

  convertPercentInputs(inputs: AirHeatingInput) {
    inputs.excessAir = inputs.excessAir > 0? inputs.excessAir / 100 : inputs.excessAir;
    inputs.flueGasO2 = inputs.flueGasO2 > 0? inputs.flueGasO2 / 100 : inputs.flueGasO2;
    inputs.heaterEfficiency = inputs.heaterEfficiency > 0? inputs.heaterEfficiency / 100 : inputs.heaterEfficiency;
    inputs.hxEfficiency = inputs.heaterEfficiency > 0? inputs.hxEfficiency / 100 : inputs.heaterEfficiency;
    return inputs;
  }

  
  convertExampleUnits(input: AirHeatingInput): AirHeatingInput {
    input.flueTemperature = this.convertUnitsService.value(input.flueTemperature).from('F').to('C');
    input.flueTemperature = this.roundVal(input.flueTemperature, 2);

    input.fireRate = this.convertUnitsService.value(input.fireRate).from('MMBtu').to('GJ');
    input.fireRate = this.roundVal(input.fireRate, 2);

    input.airflow = this.convertUnitsService.value(input.airflow).from('ft3').to('m3');
    input.airflow = this.roundVal(input.airflow, 2);

    input.inletTemperature = this.convertUnitsService.value(input.inletTemperature).from('F').to('C');
    input.inletTemperature = this.roundVal(input.inletTemperature, 2);
  
    return input;
  }

  convertInputUnits(input: AirHeatingInput, settings: Settings): AirHeatingInput {
    if (settings.unitsOfMeasure == "Metric") {
      input.flueTemperature = this.convertUnitsService.value(input.flueTemperature).from('C').to('F');
      input.flueTemperature = this.roundVal(input.flueTemperature, 2);

      input.fireRate = this.convertUnitsService.value(input.fireRate).from('GJ').to('MMBtu');
      input.fireRate = this.roundVal(input.fireRate, 2);

      input.airflow = this.convertUnitsService.value(input.airflow).from('m3').to('ft3');
      input.airflow = this.roundVal(input.airflow, 2);

      input.inletTemperature = this.convertUnitsService.value(input.inletTemperature).from('C').to('F');
      input.inletTemperature = this.roundVal(input.inletTemperature, 2);
    }
    return input;
  }

  convertResultUnits(output: AirHeatingOutput, settings: Settings): AirHeatingOutput {
    if (settings.unitsOfMeasure == "Metric") {
      output.hxColdAir = this.convertUnitsService.value(output.hxColdAir).from('btuhr').to('kJh');
      output.hxColdAir = this.roundVal(output.hxColdAir, 2);

      output.hxOutletExhaust = this.convertUnitsService.value(output.hxOutletExhaust).from('F').to('C');
      output.hxOutletExhaust = this.roundVal(output.hxOutletExhaust, 2);

      output.energySavings = this.convertUnitsService.value(output.energySavings).from('MMBtu').to('GJ');
      output.energySavings = this.roundVal(output.energySavings, 2);
    }
    return output;
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

}
