import { Injectable } from '@angular/core';
import { FacilityCompressorData, AirLeakSurveyData, OrificeMethodData, DecibelsMethodData, EstimateMethodData, AirLeakSurveyInput, BagMethodInput } from '../../../../shared/models/standalone';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';
import { Settings } from '../../../../shared/models/settings';
import { ConvertAirLeakService } from '../convert-air-leak.service';
import { OperatingHours } from '../../../../shared/models/operations';

@Injectable()
export class AirLeakFormService {

  constructor(private formBuilder: UntypedFormBuilder, 
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

  getLeakFormFromObj(inputObj: AirLeakSurveyData): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      selected: [inputObj.selected],
      name: [inputObj.name, [Validators.required]],
      leakDescription: [inputObj.leakDescription, [Validators.required]],
      measurementMethod: [inputObj.measurementMethod],
      // bag method data
      bagFillTime: [inputObj.bagMethodData.bagFillTime],
      bagVolume: [inputObj.bagMethodData.bagVolume],
      operatingTime: [inputObj.bagMethodData.operatingTime],
      numberOfUnits: [inputObj.bagMethodData.numberOfUnits],
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
        operatingTime: 0,
        bagVolume: 0,
        bagFillTime: 0,
        numberOfUnits: 1
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

  getAirLeakObjFromForm(form: UntypedFormGroup): AirLeakSurveyData {
    let bagMethodObj: BagMethodInput = {
      operatingTime: form.controls.operatingTime.value,
      bagVolume: form.controls.bagVolume.value,
      bagFillTime: form.controls.bagFillTime.value,
      numberOfUnits: form.controls.numberOfUnits.value
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
      utilityType: 1,
      utilityCost: settings && settings.electricityCost ? settings.electricityCost : 0.066,
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
      utilityCost: 0.066,
      compressorElectricityData: {
        compressorControl: 8,
        compressorControlAdjustment: 25,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16
      },
    };
    return exampleData;
  }

  getFacilityCompressorFormFromObj(inputObj: FacilityCompressorData): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
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

  setCompressorDataValidators(facilityCompressorDataForm: UntypedFormGroup): UntypedFormGroup {
    let form: UntypedFormGroup = (facilityCompressorDataForm.get("compressorElectricityData") as UntypedFormGroup);
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

  getEstimateFormFromObj(inputObj: AirLeakSurveyData): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      leakRateEstimate: [inputObj.estimateMethodData.leakRateEstimate],
    });
    form = this.setEstimateValidators(form);
    return form;
  }

  setEstimateValidators(form: UntypedFormGroup): UntypedFormGroup {
    form.controls.leakRateEstimate.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
    return form;
  }

  getDecibelFormFromObj(inputObj: AirLeakSurveyData): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
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

  getDecibelObjFromForm(form: UntypedFormGroup): DecibelsMethodData {
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

  setDecibelValidators(form: UntypedFormGroup): UntypedFormGroup {
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


  getOrificeFormFromObj(inputObj: AirLeakSurveyData): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
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

  getOrificeObjFromForm(form: UntypedFormGroup): OrificeMethodData {
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

  setOrificeValidators(form: UntypedFormGroup): UntypedFormGroup {
    form.controls.compressorAirTemp.setValidators([Validators.required, Validators.min(0)]);
    form.controls.atmosphericPressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.dischargeCoefficient.setValidators([Validators.required, Validators.min(0)]);
    form.controls.orificeDiameter.setValidators([Validators.required, Validators.min(0)]);
    form.controls.supplyPressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.numberOfOrifices.setValidators([Validators.required, Validators.min(1)]);
    return form;
  }

  getBagFormFromObj(inputObj: AirLeakSurveyData, operatingHours: number): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      operatingTime: [operatingHours],
      numberOfUnits: [inputObj.bagMethodData.numberOfUnits],
      bagVolume: [inputObj.bagMethodData.bagVolume],
      bagFillTime: [inputObj.bagMethodData.bagFillTime],
    });
    form = this.setBagValidators(form);
    return form;
  }

  getBagObjFromForm(form: UntypedFormGroup, operatingHours: number): BagMethodInput {
    let bagMethodObj: BagMethodInput = {
      operatingTime: operatingHours,
      bagFillTime: form.controls.bagFillTime.value,
      bagVolume: form.controls.bagVolume.value,
      numberOfUnits: form.controls.numberOfUnits.value,
    }
    return bagMethodObj;
  }

  setBagValidators(form: UntypedFormGroup): UntypedFormGroup {
    form.controls.bagVolume.setValidators([Validators.required, Validators.min(0)]);
    form.controls.bagFillTime.setValidators([Validators.required, Validators.min(0)]);
    return form;
  }

}
