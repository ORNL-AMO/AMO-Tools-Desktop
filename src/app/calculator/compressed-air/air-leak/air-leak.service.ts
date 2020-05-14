import { Injectable } from '@angular/core';
import { AirLeakSurveyInput, AirLeakSurveyOutput, AirLeakSurveyData, AirLeakSurveyResult, BagMethodData, CompressorElectricityData, DecibelsMethodData, OrificeMethodData, EstimateMethodData, FacilityCompressorData } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { StandaloneService } from '../../standalone.service';
import { OperatingHours } from '../../../shared/models/operations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { ConvertAirLeakService } from './convert-air-leak.service';
import { BehaviorSubject } from 'rxjs';
import { exampleLeakInputs } from '../compressedAirConstants';


@Injectable()
export class AirLeakService {
  airLeakInput: BehaviorSubject<AirLeakSurveyInput>;
  airLeakOutput: BehaviorSubject<AirLeakSurveyOutput>;
  currentField: BehaviorSubject<string>;
  currentLeakIndex: BehaviorSubject<number>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;

  constructor(private convertAirleakService: ConvertAirLeakService, 
              private standaloneService: StandaloneService,
              private formBuilder: FormBuilder) { 
    this.currentField = new BehaviorSubject<string>('default'); 
    this.currentLeakIndex = new BehaviorSubject<number>(undefined);
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.airLeakInput = new BehaviorSubject<AirLeakSurveyInput>(undefined);
    this.airLeakOutput = new BehaviorSubject<AirLeakSurveyOutput>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  initDefaultEmptyInputs(settings: Settings) {
    let emptyAirLeakInput: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: Array<AirLeakSurveyData>(),
      facilityCompressorData: this.getEmptyFacilityCompressorData(settings)
    };
    this.airLeakInput.next(emptyAirLeakInput);
  }

  initDefaultEmptyOutputs() {
    let emptyAirLeakSurveyOutput: AirLeakSurveyOutput = {
        leakResults: [
      ],
      baselineData: {
        totalFlowRate: 0,
        annualTotalElectricity: 0,
        annualTotalFlowRate: 0,
        annualTotalElectricityCost: 0,
      },
      modificationData: {
        totalFlowRate: 0,
        annualTotalElectricity: 0,
        annualTotalFlowRate: 0,
        annualTotalElectricityCost: 0,
      },
      savingsData: {
        totalFlowRate: 0,
        annualTotalElectricity: 0,
        annualTotalFlowRate: 0,
        annualTotalElectricityCost: 0,
      },
    };
    this.airLeakOutput.next(emptyAirLeakSurveyOutput);

  }

  generateExampleData() {
    let exampleLeaks: Array<AirLeakSurveyData> = JSON.parse(JSON.stringify(exampleLeakInputs));
    let airLeakInputExample: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: exampleLeaks,
      facilityCompressorData: this.getExampleFacilityCompressorData()
    }
    this.airLeakInput.next(airLeakInputExample);
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
    form = this.setLeakValidators(form);
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
        compressorControl: 0,
        compressorControlAdjustment: .25,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: .16
      },
    };
    if (settings && settings.unitsOfMeasure == 'Metric') {
      emptyData = this.convertAirleakService.convertDefaultFacilityCompressorData(emptyData);
    }
    return emptyData;
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

  setLeakValidators(form: FormGroup): FormGroup {
    // Estimate
    form.controls.leakRateEstimate.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
    //  Decibel
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
    // Bag
    form.controls.height.setValidators([Validators.required, Validators.min(0)]);
    form.controls.diameter.setValidators([Validators.required, Validators.min(0)]);
    form.controls.fillTime.setValidators([Validators.required, Validators.min(0)]);
    // orifice
    form.controls.compressorAirTemp.setValidators([Validators.required, Validators.min(0)]);
    form.controls.atmosphericPressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.dischargeCoefficient.setValidators([Validators.required, Validators.min(0)]);
    form.controls.orificeDiameter.setValidators([Validators.required, Validators.min(0)]);
    form.controls.supplyPressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.numberOfOrifices.setValidators([Validators.required, Validators.min(1)]);
    return form;
  }

  getObjFromForm(form: FormGroup): AirLeakSurveyData {
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

  getLeakFormReset(settings: Settings) {
    let emptyData: AirLeakSurveyData = {
      leakDescription: '',
      name: '',
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
    if (settings && settings.unitsOfMeasure == 'Metric') {
      emptyData = this.convertAirleakService.convertDefaultData(emptyData);
    }

    let resetForm: FormGroup = this.getLeakFormFromObj(emptyData);
    return resetForm;
  }

  deleteLeak(index: number) {
    this.airLeakInput.value.compressedAirLeakSurveyInputVec.splice(index, 1);
    this.airLeakOutput.value.leakResults.splice(index, 1);
  }

  copyLeak(index: number) {
    let leakCopy = JSON.parse(JSON.stringify(this.airLeakInput.value.compressedAirLeakSurveyInputVec[index]));
    leakCopy.name = 'Copy of ' + leakCopy.name;
    this.airLeakInput.value.compressedAirLeakSurveyInputVec.push(leakCopy);
    this.airLeakInput.next(this.airLeakInput.value)
  }

  setLeakForModification(index: number, selected: boolean) {
    this.airLeakInput.value.compressedAirLeakSurveyInputVec[index].selected = selected;
    this.airLeakInput.next(this.airLeakInput.value);
  }

  checkValidInput(input: AirLeakSurveyInput): boolean {
    let facilityCompressorDataForm = this.getFacilityCompressorFormFromObj(input.facilityCompressorData);
    if (!facilityCompressorDataForm.valid) {
      return false;
    }
    let leakInputValid: boolean = false;
    input.compressedAirLeakSurveyInputVec.forEach(leak => {
      let leakForm = this.getLeakFormFromObj(leak);
      if (!leakForm.valid) {
        return false;
      }
    })
    return true;
  }

  calculate(settings: Settings): void {
    let airLeakSurveyInput = this.airLeakInput.value;
    let inputCopy: AirLeakSurveyInput = JSON.parse(JSON.stringify(airLeakSurveyInput));
    let validInput: boolean = this.checkValidInput(inputCopy);
    if (!validInput) {
      this.initDefaultEmptyOutputs();
    }
    // Attach facility compressor data to leaks before conversion
    inputCopy.compressedAirLeakSurveyInputVec.forEach(leak => {
      leak.hoursPerYear = inputCopy.facilityCompressorData.hoursPerYear;
      leak.utilityCost = inputCopy.facilityCompressorData.utilityCost;
      leak.utilityType = inputCopy.facilityCompressorData.utilityType;
      leak.compressorElectricityData = inputCopy.facilityCompressorData.compressorElectricityData;
    })
    let inputArray: Array<AirLeakSurveyData> = this.convertAirleakService.convertInputs(inputCopy.compressedAirLeakSurveyInputVec, settings);
    
    let baselineLeaks: AirLeakSurveyInput = {compressedAirLeakSurveyInputVec: inputArray};
    let modificationLeaks: AirLeakSurveyInput = {compressedAirLeakSurveyInputVec: Array<AirLeakSurveyData>()};
    //  Build baseline / modification leak results
    let leakResults = Array<AirLeakSurveyResult>();
    baselineLeaks.compressedAirLeakSurveyInputVec.forEach(leak => {
      if (!leak.selected) {
        modificationLeaks.compressedAirLeakSurveyInputVec.push(leak);
      } 
      let leakResult: AirLeakSurveyResult = this.standaloneService.airLeakSurvey({compressedAirLeakSurveyInputVec: [leak]});
      leakResult.name = leak.name;
      leakResult.leakDescription = leak.leakDescription;
      leakResult.selected = leak.selected;
      let converted = this.convertAirleakService.convertResult(leakResult, settings);
      leakResults.push(converted)
    });

    // Get cumulative leak results
    let baselineResults: AirLeakSurveyResult = this.standaloneService.airLeakSurvey(baselineLeaks);
    let modificationResults: AirLeakSurveyResult = this.standaloneService.airLeakSurvey(modificationLeaks);
    baselineResults = this.convertAirleakService.convertResult(baselineResults, settings);
    modificationResults = this.convertAirleakService.convertResult(modificationResults, settings);

    let savings: AirLeakSurveyResult = {
      totalFlowRate: baselineResults.totalFlowRate - modificationResults.totalFlowRate,
      annualTotalElectricity: baselineResults.annualTotalElectricity - modificationResults.annualTotalElectricity,
      annualTotalElectricityCost: baselineResults.annualTotalElectricityCost - modificationResults.annualTotalElectricityCost,
      annualTotalFlowRate: baselineResults.annualTotalFlowRate - modificationResults.annualTotalFlowRate,
    }
    let outputs: AirLeakSurveyOutput = {
      leakResults: leakResults,
      baselineData: baselineResults,
      modificationData: modificationResults,
      savingsData: savings,
      facilityCompressorData: inputCopy.facilityCompressorData,
    }
    this.airLeakOutput.next(outputs);
  }

  getExampleFacilityCompressorData(): FacilityCompressorData {
    let exampleData: FacilityCompressorData = {
      hoursPerYear: 8760,
      utilityType: 1,
      utilityCost: 0.12,
      compressorElectricityData: {
        compressorControl: 0,
        compressorControlAdjustment: .25,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: .16
      },
    };
    return exampleData;
  }



}
