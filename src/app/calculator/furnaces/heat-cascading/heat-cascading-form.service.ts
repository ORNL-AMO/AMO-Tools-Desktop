import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeatCascadingInput } from '../../../shared/models/phast/heatCascading';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class HeatCascadingFormService {


  constructor(private formBuilder: FormBuilder) { }

  getHeatCascadingForm(inputObj: HeatCascadingInput): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      utilityType: [inputObj.utilityType],
      priFiringRate: [inputObj.priFiringRate, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      priExhaustTemperature: [inputObj.priExhaustTemperature, Validators.required],
      priExhaustO2: [inputObj.priExhaustO2, [Validators.required, Validators.min(0), Validators.max(100)]],
      priCombAirTemperature: [inputObj.priCombAirTemperature, Validators.required],
      priOpHours: [inputObj.priOpHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelHV: [inputObj.fuelHV, Validators.required],
      fuelTempF: [inputObj.fuelTempF, Validators.required], 
      ambientAirTempF: [inputObj.ambientAirTempF, Validators.required], 
      combAirMoisturePerc: [inputObj.combAirMoisturePerc, [Validators.required, Validators.min(0), Validators.max(100)]],
      secFiringRate: [inputObj.secFiringRate, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      secExhaustTemperature: [inputObj.secExhaustTemperature, Validators.required],
      secExhaustO2: [inputObj.secExhaustO2, [Validators.required, Validators.min(0), Validators.max(100)]],
      secCombAirTemperature: [inputObj.secCombAirTemperature, Validators.required],
      secAvailableHeat: [inputObj.secAvailableHeat, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]],
      secOpHours: [inputObj.secOpHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelCost: [inputObj.fuelCost, Validators.required],

      // Gas Material
      materialTypeId: [inputObj.materialTypeId],
      substance: [inputObj.substance],
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

    });

    return form;
  }

  getHeatCascadingInput(form: FormGroup): HeatCascadingInput {
    let obj: HeatCascadingInput = {
      utilityType: form.controls.utilityType.value,
      priFiringRate: form.controls.priFiringRate.value,
      priExhaustTemperature: form.controls.priExhaustTemperature.value,
      priExhaustO2: form.controls.priExhaustO2.value,
      priCombAirTemperature: form.controls.priCombAirTemperature.value,
      priOpHours: form.controls.priOpHours.value,
      fuelHV: form.controls.fuelHV.value,
      fuelTempF: form.controls.fuelTempF.value,
      ambientAirTempF: form.controls.ambientAirTempF.value,
      combAirMoisturePerc: form.controls.combAirMoisturePerc.value,

      secFiringRate: form.controls.secFiringRate.value,
      secExhaustTemperature: form.controls.secExhaustTemperature.value,
      secExhaustO2: form.controls.secExhaustO2.value,
      secCombAirTemperature: form.controls.secCombAirTemperature.value,
      secAvailableHeat: form.controls.secAvailableHeat.value,
      secOpHours: form.controls.secOpHours.value,
      fuelCost: form.controls.fuelCost.value,
      
      // Gas Material element properties
      materialTypeId: form.controls.materialTypeId.value,
      gasFuelType: true,
      substance: form.controls.substance.value,
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
    };
    return obj;
  }

}
