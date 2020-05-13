import { Injectable } from '@angular/core';
import { AirLeakSurveyInput, AirLeakSurveyOutput, AirLeakSurveyData, AirLeakSurveyResult, BagMethodData, CompressorElectricityData, DecibelsMethodData, OrificeMethodData, EstimateMethodData, FacilityCompressorData } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { StandaloneService } from '../../standalone.service';
import { OperatingHours } from '../../../shared/models/operations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { ConvertAirLeakService } from './convert-air-leak.service';


@Injectable()
export class AirLeakService {

  inputs: AirLeakSurveyInput;
  baselineData: Array<AirLeakSurveyData>;
  modificationData: Array<AirLeakSurveyData>;

  constructor(private convertAirleakService: ConvertAirLeakService, 
              private standaloneService: StandaloneService,
              private formBuilder: FormBuilder) { 
    this.inputs = this.getDefaultEmptyInputs();
  }

  getDefaultEmptyInputs(): AirLeakSurveyInput {
    return {
      compressedAirLeakSurveyInputVec: Array<AirLeakSurveyData>(),
      facilityCompressorData: this.getFacilityCompressorFormReset()
    };
  }

  getFormFromObj(inputObj: AirLeakSurveyData): FormGroup {
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
    form = this.setValidators(form);
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

  getFacilityCompressorFormReset(settings?: Settings, operatingHours?: OperatingHours): FacilityCompressorData {
    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let emptyForm: FacilityCompressorData = {
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
      emptyForm = this.convertAirleakService.convertDefaultFacilityCompressorData(emptyForm);
    }
    return emptyForm;
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

  setValidators(form: FormGroup): FormGroup {
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
  
  getDefaultEmptyOutputs(): AirLeakSurveyOutput {
    return {
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
  }

  getFormReset(settings?: Settings, operatingHours?: OperatingHours) {
    let emptyForm: AirLeakSurveyData = {
      leakDescription: '',
      name: '',
      selected: false,
      measurementMethod: 0,
      estimateMethodData: {
        leakRateEstimate: 0
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
      emptyForm = this.convertAirleakService.convertDefaultData(emptyForm);
    }
    return emptyForm;
  }

  calculate(airLeakSurveyInput: AirLeakSurveyInput, settings: Settings): AirLeakSurveyOutput {
    let inputCopy: AirLeakSurveyInput = JSON.parse(JSON.stringify(airLeakSurveyInput));

    // Attach facility compressor data to leaks before conversion
    inputCopy.compressedAirLeakSurveyInputVec.forEach(leak => {
      leak.hoursPerYear = inputCopy.facilityCompressorData.hoursPerYear;
      leak.utilityCost = inputCopy.facilityCompressorData.utilityCost;
      leak.utilityType = inputCopy.facilityCompressorData.utilityType;
      leak.compressorElectricityData = inputCopy.facilityCompressorData.compressorElectricityData;
    })
    let inputArray: Array<AirLeakSurveyData> = this.convertAirleakService.convertInputs(inputCopy.compressedAirLeakSurveyInputVec, settings);

    let baselineLeaks: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: inputArray
    };
    let modificationLeaks: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: Array<AirLeakSurveyData>()
    };
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
    return outputs;
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
  
  
  getExample() {
    let exampleInputs: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: Array<AirLeakSurveyData>()
    }
    let bagLeak: AirLeakSurveyData = {
      name: 'Bag Leak',
      leakDescription: "Enter notes about the leak here.",
      selected: false,
      measurementMethod: 2,
      estimateMethodData: {
        leakRateEstimate: 0
      },
      bagMethodData: {
        height: 15,
        diameter: 10,
        fillTime: 12
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
        numberOfOrifices: 0,
      },
      units: 1
    };
    let estimateLeak: AirLeakSurveyData = {
      name: 'Estimate Leak',
      leakDescription: "Enter notes about the leak here.",
      selected: false,
      measurementMethod: 0,
      estimateMethodData: {
        leakRateEstimate: .1
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
        numberOfOrifices: 0,
      },
      units: 1
    };
    let orificeLeak: AirLeakSurveyData = {
      name: 'Orifice Leak',
      leakDescription: "Enter notes about the leak here.",
      selected: false,
      measurementMethod: 3,
      bagMethodData: {
        height: 0,
        diameter: 0,
        fillTime: 0
      },
      estimateMethodData: {
        leakRateEstimate: 0
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
        compressorAirTemp: 250,
        atmosphericPressure: 14.7,
        dischargeCoefficient: 1.0,
        orificeDiameter: 6.0,
        supplyPressure: 6.2,
        numberOfOrifices: 4,
      },
      units: 1
    };

    let decibelLeak: AirLeakSurveyData = {
      name: 'Decibel leak',
      leakDescription: "Enter notes about the leak here.",
      selected: false,
      measurementMethod: 1,
      estimateMethodData: {
        leakRateEstimate: 0
      },
      bagMethodData: {
        height: 0,
        diameter: 0,
        fillTime: 0
      },
      decibelsMethodData: {
        linePressure: 130,
        decibels: 25,
        decibelRatingA: 20,
        pressureA: 150,
        firstFlowA: 1.04,
        secondFlowA: 1.2,
        decibelRatingB: 30,
        pressureB: 125,
        firstFlowB: 1.85,
        secondFlowB: 1.65
      },
      orificeMethodData: {
        compressorAirTemp: 0,
        atmosphericPressure: 0,
        dischargeCoefficient: 0,
        orificeDiameter: 0,
        supplyPressure: 0,
        numberOfOrifices: 0,
      },
      units: 1
    };
    exampleInputs.compressedAirLeakSurveyInputVec.push(bagLeak, estimateLeak, orificeLeak, decibelLeak);
    return exampleInputs;
  }
  
  // // Example reflects backend js tests
  // getExample() {
  //   let exampleInputs: AirLeakSurveyInput = {
  //     compressedAirLeakSurveyInputVec: Array<AirLeakSurveyData>()
  //   }
  //   let estimateLeakA: AirLeakSurveyData = {
  //     name: 'Estimate Leak',
  //     leakDescription: "Enter notes about the leak here.",
  //     selected: false,
  //     measurementMethod: 0,
  //     estimateMethodData: {
  //       leakRateEstimate: 100
  //     },
  //     bagMethodData: {
  //       height: 0,
  //       diameter: 0,
  //       fillTime: 0
  //     },
  //     decibelsMethodData: {
  //       linePressure: 0,
  //       decibels: 0,
  //       decibelRatingA: 0,
  //       pressureA: 0,
  //       firstFlowA: 0,
  //       secondFlowA: 0,
  //       decibelRatingB: 0,
  //       pressureB: 0,
  //       firstFlowB: 0,
  //       secondFlowB: 0
  //     },
  //     orificeMethodData: {
  //       compressorAirTemp: 0,
  //       atmosphericPressure: 0,
  //       dischargeCoefficient: 0,
  //       orificeDiameter: 0,
  //       supplyPressure: 0,
  //       numberOfOrifices: 0,
  //     },
  //     units: 2
  //   };
  //   let estimateLeakB: AirLeakSurveyData = {
  //     name: 'Estimate Leak',
  //     leakDescription: "Enter notes about the leak here.",
  //     selected: false,
  //     measurementMethod: 0,
  //     estimateMethodData: {
  //       leakRateEstimate: 14
  //     },
  //     bagMethodData: {
  //       height: 0,
  //       diameter: 0,
  //       fillTime: 0
  //     },
  //     decibelsMethodData: {
  //       linePressure: 0,
  //       decibels: 0,
  //       decibelRatingA: 0,
  //       pressureA: 0,
  //       firstFlowA: 0,
  //       secondFlowA: 0,
  //       decibelRatingB: 0,
  //       pressureB: 0,
  //       firstFlowB: 0,
  //       secondFlowB: 0
  //     },
  //     orificeMethodData: {
  //       compressorAirTemp: 0,
  //       atmosphericPressure: 0,
  //       dischargeCoefficient: 0,
  //       orificeDiameter: 0,
  //       supplyPressure: 0,
  //       numberOfOrifices: 0,
  //     },
  //     units: 1
  //   };
  //   let estimateLeakC: AirLeakSurveyData = {
  //     name: 'Estimate Leak',
  //     leakDescription: "Enter notes about the leak here.",
  //     selected: false,
  //     measurementMethod: 0,
  //     estimateMethodData: {
  //       leakRateEstimate: .785398163397448
  //     },
  //     bagMethodData: {
  //       height: 0,
  //       diameter: 0,
  //       fillTime: 0
  //     },
  //     decibelsMethodData: {
  //       linePressure: 0,
  //       decibels: 0,
  //       decibelRatingA: 0,
  //       pressureA: 0,
  //       firstFlowA: 0,
  //       secondFlowA: 0,
  //       decibelRatingB: 0,
  //       pressureB: 0,
  //       firstFlowB: 0,
  //       secondFlowB: 0
  //     },
  //     orificeMethodData: {
  //       compressorAirTemp: 0,
  //       atmosphericPressure: 0,
  //       dischargeCoefficient: 0,
  //       orificeDiameter: 0,
  //       supplyPressure: 0,
  //       numberOfOrifices: 0,
  //     },
  //     units: 1
  //   };
  //   let estimateLeakD: AirLeakSurveyData = {
  //     name: 'Estimate Leak',
  //     leakDescription: "Enter notes about the leak here.",
  //     selected: false,
  //     measurementMethod: 0,
  //     estimateMethodData: {
  //       leakRateEstimate: 6.32517756495803
  //     },
  //     bagMethodData: {
  //       height: 0,
  //       diameter: 0,
  //       fillTime: 0
  //     },
  //     decibelsMethodData: {
  //       linePressure: 0,
  //       decibels: 0,
  //       decibelRatingA: 0,
  //       pressureA: 0,
  //       firstFlowA: 0,
  //       secondFlowA: 0,
  //       decibelRatingB: 0,
  //       pressureB: 0,
  //       firstFlowB: 0,
  //       secondFlowB: 0
  //     },
  //     orificeMethodData: {
  //       compressorAirTemp: 0,
  //       atmosphericPressure: 0,
  //       dischargeCoefficient: 0,
  //       orificeDiameter: 0,
  //       supplyPressure: 0,
  //       numberOfOrifices: 0,
  //     },
  //     units: 1
  //   };
  //   exampleInputs.compressedAirLeakSurveyInputVec.push(estimateLeakA, estimateLeakB, estimateLeakC, estimateLeakD);
  //   return exampleInputs;
  // }
}
