import { Injectable } from '@angular/core';
import { FacilityCompressorData, AirLeakSurveyData, OrificeMethodData, DecibelsMethodData, BagMethodData, EstimateMethodData, AirLeakSurveyInput } from '../../../../shared/models/standalone';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';
import { Settings } from '../../../../shared/models/settings';
import { ConvertAirLeakService } from '../convert-air-leak.service';

@Injectable()
export class AirLeakFormService {

  constructor(private formBuilder: FormBuilder, private convertAirLeakService: ConvertAirLeakService) { }

  // checkValidAirLeakSurveyInput(input: AirLeakSurveyInput): boolean {
  //   let facilityCompressorDataForm = this.getFacilityCompressorFormFromObj(input.facilityCompressorData);
  //   if (!facilityCompressorDataForm.valid) {
  //     return false;
  //   }
  //   let leakInputValid: boolean = false;
  //   input.compressedAirLeakSurveyInputVec.forEach(leak => {
  //     let leakForm = this.getLeakFormFromObj(leak);
  //     if (!leakForm.valid) {
  //       return false;
  //     }
  //   })
  //   return true;
  // }

  getLeakFormFromObj(inputObj: AirLeakSurveyData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      selected: [inputObj.selected],
      name: [inputObj.name, [Validators.required]],
      leakDescription: [inputObj.leakDescription, [Validators.required]],
      measurementMethod: [inputObj.measurementMethod],
      units: [inputObj.units]
    });
    return form;
  }

  getEstimateFormReset() {
    let form: FormGroup = this.formBuilder.group({
      leakRateEstimate: .01,
    });
    form = this.setEstimateValidators(form);
    return form;
  }

  getBagFormFromObj(inputObj: AirLeakSurveyData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      height: [inputObj.bagMethodData.height],
      diameter: [inputObj.bagMethodData.diameter],
      fillTime: [inputObj.bagMethodData.fillTime],
    });
    form = this.setBagValidators(form);
    return form;
  }

  getEstimateFormFromObj(inputObj: AirLeakSurveyData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      leakRateEstimate: [inputObj.estimateMethodData.leakRateEstimate],
    });
    form = this.setEstimateValidators(form);
    return form;
  }

  getDecibelFormFromObj(inputObj: AirLeakSurveyData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      linePressure: [inputObj.decibelsMethodData.linePressure],
      decibels: [inputObj.decibelsMethodData.decibels],
      decibelRatingA: [inputObj.decibelsMethodData.decibelRatingA],
      pressureA: [inputObj.decibelsMethodData.pressureA],
      firstFlowA: [inputObj.decibelsMethodData.firstFlowA],
      secondFlowA: [inputObj.decibelsMethodData.secondFlowA],
      decibelRatingB: [inputObj.decibelsMethodData.decibelRatingB],
      pressureB: [inputObj.decibelsMethodData.pressureB],
      firstFlowB: [inputObj.decibelsMethodData.firstFlowB],
      secondFlowB:[inputObj.decibelsMethodData.secondFlowB],
    });
    form = this.setDecibelValidators(form);
    return form;
  }

  getOrificeFormFromObj(inputObj: AirLeakSurveyData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      compressorAirTemp: [inputObj.orificeMethodData.compressorAirTemp],
      atmosphericPressure: [inputObj.orificeMethodData.atmosphericPressure],
      dischargeCoefficient: [inputObj.orificeMethodData.dischargeCoefficient],
      orificeDiameter: [inputObj.orificeMethodData.orificeDiameter],
      supplyPressure: [inputObj.orificeMethodData.supplyPressure],
      numberOfOrifices: [inputObj.orificeMethodData.numberOfOrifices],
      leakRateEstimate: [inputObj.estimateMethodData.leakRateEstimate],
    });
    form = this.setOrificeValidators(form);
    return form;
  }


  getFacilityCompressorFormFromObj(inputObj: FacilityCompressorData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      hoursPerYear: [inputObj.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      utilityType: [inputObj.utilityType],
      utilityCost: [inputObj.utilityCost, [Validators.required, Validators.min(0)]],
      compressorElectricityData: this.formBuilder.group({
        compressorControl: [inputObj.compressorElectricityData.compressorControl],
        compressorControlAdjustment: [inputObj.compressorElectricityData.compressorControlAdjustment],
        compressorSpecificPowerControl: [inputObj.compressorElectricityData.compressorSpecificPowerControl],
        compressorSpecificPower: [inputObj.compressorElectricityData.compressorSpecificPower],
      })
    });
    form = this.setCompressorDataValidators(form);
    return form;
  }

  setCompressorDataValidators(facilityCompressorDataForm: FormGroup): FormGroup {
    let form: FormGroup = (facilityCompressorDataForm.get("compressorElectricityData") as FormGroup);
    if (facilityCompressorDataForm.controls.utilityType.value == 1) {
      form.controls.compressorControl.setValidators([Validators.required]);
      if (form.controls.compressorControl.value == 8) {
        form.controls.compressorControlAdjustment.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      }
      if (form.controls.compressorSpecificPowerControl.value == 4) {
        form.controls.compressorSpecificPower.setValidators([Validators.required, Validators.min(0)]);
      }
    }
    return facilityCompressorDataForm;
  }

  setEstimateValidators(form: FormGroup): FormGroup {
    form.controls.leakRateEstimate.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
    return form;
  }

  setDecibelValidators(form: FormGroup): FormGroup {
    form.controls.linePressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.decibels.setValidators([Validators.required, Validators.min(0)]);
    form.controls.decibelRatingA.setValidators([Validators.required, Validators.min(0)]);
    form.controls.decibelRatingB.setValidators([Validators.required, Validators.min(0)]);
    form.controls.pressureA.setValidators([Validators.required, Validators.min(0)]);
    form.controls.firstFlowA.setValidators([Validators.required, Validators.min(0)]);
    form.controls.secondFlowA.setValidators([Validators.required, Validators.min(0)]);
    form.controls.decibelRatingB.setValidators([Validators.required, Validators.min(0)]);
    form.controls.pressureB.setValidators([Validators.required, Validators.min(0)]);
    form.controls.firstFlowB.setValidators([Validators.required, Validators.min(0)]);
    form.controls.secondFlowB.setValidators([Validators.required, Validators.min(0)]);
    return form;
  }

  setOrificeValidators(form: FormGroup): FormGroup {
    form.controls.compressorAirTemp.setValidators([Validators.required, Validators.min(0)]);
    form.controls.atmosphericPressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.dischargeCoefficient.setValidators([Validators.required, Validators.min(0)]);
    form.controls.orificeDiameter.setValidators([Validators.required, Validators.min(0)]);
    form.controls.supplyPressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.numberOfOrifices.setValidators([Validators.required, Validators.min(1)]);
    return form;
  }

  setBagValidators(form: FormGroup): FormGroup {
    form.controls.height.setValidators([Validators.required, Validators.min(0)]);
    form.controls.diameter.setValidators([Validators.required, Validators.min(0)]);
    form.controls.fillTime.setValidators([Validators.required, Validators.min(0)]);
    return form;
  }

}
