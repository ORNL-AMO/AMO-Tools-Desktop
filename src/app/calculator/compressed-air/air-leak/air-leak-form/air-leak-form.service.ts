import { Injectable } from '@angular/core';
import { FacilityCompressorData, AirLeakSurveyData, OrificeMethodData, DecibelsMethodData, BagMethodData, EstimateMethodData, AirLeakSurveyInput } from '../../../../shared/models/standalone';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';
import { Settings } from '../../../../shared/models/settings';
import { ConvertAirLeakService } from '../convert-air-leak.service';
import { OperatingHours } from '../../../../shared/models/operations';

@Injectable()
export class AirLeakFormService {

  constructor(private formBuilder: FormBuilder, 
              private convertAirLeakService: ConvertAirLeakService) { }

  checkValidInput(input: AirLeakSurveyInput): boolean {
    let facilityCompressorDataForm = this.getFacilityCompressorFormFromObj(input.facilityCompressorData);
    if (!facilityCompressorDataForm.valid) {
      return false;
    }
    input.compressedAirLeakSurveyInputVec.forEach(leak => {
      let leakForm = this.getLeakFormFromObj(leak);
      if (!leakForm.valid) {
        return false;
      }
    })
    return true;
  }

  getLeakFormFromObj(inputObj: AirLeakSurveyData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      selected: [inputObj.selected],
      name: [inputObj.name, [Validators.required]],
      leakDescription: [inputObj.leakDescription, [Validators.required]],
      measurementMethod: [inputObj.measurementMethod],
      // bag method data
      height: [inputObj.bagMethodData.height],
      diameter: [inputObj.bagMethodData.diameter],
      fillTime: [inputObj.bagMethodData.fillTime],
      // decibelsMethodData
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
      // orificeMethodData
      compressorAirTemp: [inputObj.orificeMethodData.compressorAirTemp],
      atmosphericPressure: [inputObj.orificeMethodData.atmosphericPressure],
      dischargeCoefficient: [inputObj.orificeMethodData.dischargeCoefficient],
      orificeDiameter: [inputObj.orificeMethodData.orificeDiameter],
      supplyPressure: [inputObj.orificeMethodData.supplyPressure],
      numberOfOrifices: [inputObj.orificeMethodData.numberOfOrifices],
      leakRateEstimate: [inputObj.estimateMethodData.leakRateEstimate],
      units: [inputObj.units]
    });
    return form;
  }

  getEmptyAirLeakData() {
    let emptyData: AirLeakSurveyData = {
      leakDescription: '',
      name: 'New Leak',
      selected: false,
      measurementMethod: 0,
      estimateMethodData: {
        leakRateEstimate: 0.1
      },
      bagMethodData: {
        height: 0,
        diameter: 0,
        fillTime: 0
      },
      decibelsMethodData: {
        linePressure: 0,
        decibels: 0,
        decibelRatingA: 0,
        pressureA: 0,
        firstFlowA: 0,
        secondFlowA: 0,
        decibelRatingB: 0,
        pressureB: 0,
        firstFlowB: 0,
        secondFlowB: 0
      },
      orificeMethodData: {
        compressorAirTemp: 0,
        atmosphericPressure: 0,
        dischargeCoefficient: 0,
        orificeDiameter: 0,
        supplyPressure: 0,
        numberOfOrifices: 1,
      },
      units: 1
    };
    return emptyData;
  }

  getAirLeakObjFromForm(form: FormGroup): AirLeakSurveyData {
    let bagMethodObj: BagMethodData = {
      height: form.controls.height.value,
      diameter: form.controls.diameter.value,
      fillTime: form.controls.fillTime.value
    };
    let decibelsMethodData: DecibelsMethodData = {
      linePressure: form.controls.linePressure.value,
      decibels: form.controls.decibels.value,
      decibelRatingA: form.controls.decibelRatingA.value,
      pressureA: form.controls.pressureA.value,
      firstFlowA: form.controls.firstFlowA.value,
      secondFlowA: form.controls.secondFlowA.value,
      decibelRatingB: form.controls.decibelRatingB.value,
      pressureB: form.controls.pressureB.value,
      firstFlowB: form.controls.firstFlowB.value,
      secondFlowB:form.controls.secondFlowB.value
    };
    let orificeMethodData: OrificeMethodData = {
      compressorAirTemp: form.controls.compressorAirTemp.value,
      atmosphericPressure: form.controls.atmosphericPressure.value,
      dischargeCoefficient: form.controls.dischargeCoefficient.value,
      orificeDiameter: form.controls.orificeDiameter.value,
      supplyPressure: form.controls.supplyPressure.value,
      numberOfOrifices: form.controls.numberOfOrifices.value,
    };
    let estimateMethodData: EstimateMethodData = {
      leakRateEstimate: form.controls.leakRateEstimate.value,
    };
    let obj: AirLeakSurveyData = {
      selected: form.controls.selected.value,
      name: form.controls.name.value,
      leakDescription: form.controls.leakDescription.value,
      measurementMethod: form.controls.measurementMethod.value,
      bagMethodData: bagMethodObj,
      orificeMethodData: orificeMethodData,
      estimateMethodData: estimateMethodData,
      decibelsMethodData: decibelsMethodData,
      units: form.controls.units.value
    };
    return obj;
  }

  getEmptyFacilityCompressorData(settings: Settings, operatingHours?: OperatingHours): FacilityCompressorData {
    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let emptyData: FacilityCompressorData = {
      hoursPerYear: hoursPerYear,
      utilityType: 0,
      utilityCost: settings && settings.compressedAirCost ? settings.compressedAirCost : 0.12,
      compressorElectricityData: {
        compressorControl: 8,
        compressorControlAdjustment: 25,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16
      },
    };
    if (settings && settings.unitsOfMeasure == 'Metric') {
      emptyData = this.convertAirLeakService.convertDefaultFacilityCompressorData(emptyData);
    }
    return emptyData;
  }

  getExampleFacilityCompressorData(): FacilityCompressorData {
    let exampleData: FacilityCompressorData = {
      hoursPerYear: 8760,
      utilityType: 1,
      utilityCost: 0.06,
      compressorElectricityData: {
        compressorControl: 8,
        compressorControlAdjustment: 25,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16
      },
    };
    return exampleData;
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

  getEstimateFormFromObj(inputObj: AirLeakSurveyData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      leakRateEstimate: [inputObj.estimateMethodData.leakRateEstimate],
    });
    form = this.setEstimateValidators(form);
    return form;
  }

  setEstimateValidators(form: FormGroup): FormGroup {
    form.controls.leakRateEstimate.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
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

  getDecibelObjFromForm(form: FormGroup): DecibelsMethodData {
    let decibelsMethodData: DecibelsMethodData = {
      linePressure: form.controls.linePressure.value,
      decibels: form.controls.decibels.value,
      decibelRatingA: form.controls.decibelRatingA.value,
      pressureA: form.controls.pressureA.value,
      firstFlowA: form.controls.firstFlowA.value,
      secondFlowA: form.controls.secondFlowA.value,
      decibelRatingB: form.controls.decibelRatingB.value,
      pressureB: form.controls.pressureB.value,
      firstFlowB: form.controls.firstFlowB.value,
      secondFlowB:form.controls.secondFlowB.value
    };
    return decibelsMethodData;
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

  getOrificeObjFromForm(form: FormGroup): OrificeMethodData {
    let orificeMethodData: OrificeMethodData = {
      compressorAirTemp: form.controls.compressorAirTemp.value,
      atmosphericPressure: form.controls.atmosphericPressure.value,
      dischargeCoefficient: form.controls.dischargeCoefficient.value,
      orificeDiameter: form.controls.orificeDiameter.value,
      supplyPressure: form.controls.supplyPressure.value,
      numberOfOrifices: form.controls.numberOfOrifices.value,
    };
    return orificeMethodData;
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

  getBagFormFromObj(inputObj: AirLeakSurveyData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      height: [inputObj.bagMethodData.height],
      diameter: [inputObj.bagMethodData.diameter],
      fillTime: [inputObj.bagMethodData.fillTime],
    });
    form = this.setBagValidators(form);
    return form;
  }

  getBagObjFromForm(form: FormGroup): BagMethodData {
    let bagMethodObj: BagMethodData = {
      height: form.controls.height.value,
      diameter: form.controls.diameter.value,
      fillTime: form.controls.fillTime.value
    };
    return bagMethodObj;
  }

  setBagValidators(form: FormGroup): FormGroup {
    form.controls.height.setValidators([Validators.required, Validators.min(0)]);
    form.controls.diameter.setValidators([Validators.required, Validators.min(0)]);
    form.controls.fillTime.setValidators([Validators.required, Validators.min(0)]);
    return form;
  }

}
