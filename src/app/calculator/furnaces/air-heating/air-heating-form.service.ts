import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AirHeatingInput } from '../../../shared/models/phast/airHeating';

@Injectable()
export class AirHeatingFormService {

  constructor(private formBuilder: FormBuilder) { }

  getAirHeatingForm(inputObj: AirHeatingInput): FormGroup {
    let moistureInAirComposition: number = .0077;
    if (inputObj.moistureInAirComposition != undefined) {
      moistureInAirComposition = inputObj.moistureInAirComposition;
    }

    let form: FormGroup = this.formBuilder.group({
      operatingHours: [inputObj.operatingHours, Validators.required],
      gasFuelType: [inputObj.gasFuelType],
      materialTypeId: [inputObj.materialTypeId],
      flueTemperature: [inputObj.flueTemperature, Validators.required],
      excessAir: [inputObj.excessAir, Validators.required],
      oxygenCalculationMethod: [inputObj.oxygenCalculationMethod, Validators.required],
      moistureInAirComposition: [moistureInAirComposition, [Validators.required, Validators.min(0)]],
      flueGasO2: [inputObj.flueGasO2, Validators.required],
      fireRate: [inputObj.fireRate, [Validators.required, Validators.min(0)]],
      airflow: [inputObj.airflow, [Validators.required, Validators.min(0)]],
      inletTemperature: [inputObj.inletTemperature, Validators.required],
      heaterEfficiency: [inputObj.heaterEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      hxEfficiency: [inputObj.hxEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      substance: [inputObj.substance],
      // Gas Material
      CH4: [inputObj.CH4],
      C2H6: [inputObj.C2H6],
      N2: [inputObj.N2],
      H2: [inputObj.H2],
      C3H8: [inputObj.C3H8],
      C4H10_CnH2n: [inputObj.C4H10_CnH2n],
      H2O: [inputObj.H2O],
      CO: [inputObj.CO],
      CO2: [inputObj.CO2],
      SO2: [inputObj.SO2],
      O2: [inputObj.O2],
      // Solid Material
      carbon: [inputObj.carbon],
      hydrogen: [inputObj.hydrogen],
      sulphur: [inputObj.sulphur],
      inertAsh: [inputObj.inertAsh],
      o2: [inputObj.o2],
      moisture: [inputObj.moisture],
      nitrogen: [inputObj.nitrogen],
    });

    return form;
  }

  getAirHeatingInputGasMaterial(form: FormGroup): AirHeatingInput {
    let obj: AirHeatingInput = {
      operatingHours: form.controls.operatingHours.value,
      gasFuelType: form.controls.gasFuelType.value,
      materialTypeId: form.controls.materialTypeId.value,
      flueTemperature: form.controls.flueTemperature.value,
      excessAir: form.controls.excessAir.value,
      oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
      flueGasO2: form.controls.flueGasO2.value,
      fireRate: form.controls.fireRate.value,
      airflow: form.controls.airflow.value,
      inletTemperature: form.controls.inletTemperature.value,
      heaterEfficiency: form.controls.heaterEfficiency.value,
      hxEfficiency: form.controls.hxEfficiency.value,
      // Gas Material
      CH4: form.controls.CH4.value,
      C2H6: form.controls.C2H6.value,
      N2: form.controls.N2.value,
      H2: form.controls.H2.value,
      C3H8: form.controls.C3H8.value,
      C4H10_CnH2n: form.controls.C4H10_CnH2n.value,
      H2O: form.controls.H2O.value,
      CO: form.controls.CO.value,
      CO2: form.controls.CO2.value,
      SO2: form.controls.SO2.value,
      O2: form.controls.O2.value,
      substance: form.controls.substance.value,
    };
    return obj;
  }

  getAirHeatingInputSolidMaterial(form: FormGroup): AirHeatingInput {
    let obj: AirHeatingInput = {
      operatingHours: form.controls.operatingHours.value,
      gasFuelType: form.controls.gasFuelType.value,
      materialTypeId: form.controls.materialTypeId.value,
      flueTemperature: form.controls.flueTemperature.value,
      excessAir: form.controls.excessAir.value,
      moistureInAirComposition: form.controls.moistureInAirComposition.value,
      oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
      flueGasO2: form.controls.flueGasO2.value,
      fireRate: form.controls.fireRate.value,
      airflow: form.controls.airflow.value,
      inletTemperature: form.controls.inletTemperature.value,
      heaterEfficiency: form.controls.heaterEfficiency.value,
      hxEfficiency: form.controls.hxEfficiency.value,
      // Solid Material
      carbon: form.controls.carbon.value,
      hydrogen: form.controls.hydrogen.value,
      sulphur: form.controls.sulphur.value,
      inertAsh: form.controls.inertAsh.value,
      o2: form.controls.o2.value,
      moisture: form.controls.moisture.value,
      nitrogen: form.controls.nitrogen.value,
      substance: form.controls.substance.value,
    };
    return obj;
  }
  
  getMaterialInputProperties(form: FormGroup) {
    let input;
    if (form.controls.gasFuelType.value == true) {
      input = {
        CH4: form.controls.CH4.value,
        C2H6: form.controls.C2H6.value,
        N2: form.controls.N2.value,
        H2: form.controls.H2.value,
        C3H8: form.controls.C3H8.value,
        C4H10_CnH2n: form.controls.C4H10_CnH2n.value,
        H2O: form.controls.H2O.value,
        CO: form.controls.CO.value,
        CO2: form.controls.CO2.value,
        SO2: form.controls.SO2.value,
        O2: form.controls.O2.value,
        o2InFlueGas: form.controls.flueGasO2.value,
        excessAir: form.controls.excessAir.value
      };
    } else {
      input = {
        carbon: form.controls.carbon.value,
        hydrogen: form.controls.hydrogen.value,
        sulphur: form.controls.sulphur.value,
        inertAsh: form.controls.inertAsh.value,
        o2: form.controls.o2.value,
        moisture: form.controls.moisture.value,
        nitrogen: form.controls.nitrogen.value,
        o2InFlueGas: form.controls.flueGasO2.value,
        excessAir: form.controls.excessAir.value,
        moistureInAirCombustion: form.controls.moistureInAirComposition.value
      }
    }

    return input;
  }

  checkO2Warning(form: FormGroup) {
    if (form.controls.flueGasO2.value < 0 || form.controls.flueGasO2.value >= 21) {
      return 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent';
    } else {
      return null;
    }
  }


}
