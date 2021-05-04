import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CentrifugalSpecifics, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails, PerformancePoint, PerformancePoints } from '../../shared/models/compressed-air-assessment';

@Injectable()
export class InventoryService {

  selectedCompressor: BehaviorSubject<CompressorInventoryItem>;

  constructor(private formBuilder: FormBuilder) {
    this.selectedCompressor = new BehaviorSubject<CompressorInventoryItem>(undefined);
  }

  getNewInventoryItem(): CompressorInventoryItem {
    return {
      itemId: Math.random().toString(36).substr(2, 9),
      name: 'New Compressor',
      nameplateData: {
        compressorType: undefined,
        motorPower: undefined,
        fullLoadOperatingPressure: undefined,
        fullLoadRatedCapacity: undefined,
        ratedLoadPower: undefined,
        ploytropicCompressorExponent: 1.4
      },
      compressorControls: {
        controlType: undefined,
        unloadPointCapacity: 100,
        numberOfUnloadSteps: 2,
        automaticShutdown: false
      },
      inletConditions: {
        atmosphericPressure: undefined
      },
      designDetails: {
        blowdownTime: 40,
        unloadSlumpPressure: undefined,
        modulatingPressureRange: undefined,
        inputPressure: undefined,
        designEfficiency: undefined,
        serviceFactor: 1.15
      },
      centrifugalSpecifics: {
        surgeAirflow: undefined,
        maxFullLoadPressure: undefined,
        maxFullLoadCapacity: undefined,
        minFullLoadPressure: undefined,
        minFullLoadCapacity: undefined
      },
      performancePoints: {
        fullLoad: {
          dischargePressure: undefined,
          airflow: undefined,
          power: undefined
        },
        maxFullFlow: {
          dischargePressure: undefined,
          airflow: undefined,
          power: undefined
        },
        unloadPoint: {
          dischargePressure: undefined,
          airflow: undefined,
          power: undefined
        },
        noLoad: {
          dischargePressure: undefined,
          airflow: undefined,
          power: undefined
        },
        blowoff: {
          dischargePressure: undefined,
          airflow: undefined,
          power: undefined
        }
      }
    }
  }

  //general information
  getGeneralInformationFormFromObj(name: string): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [name, Validators.required],
    });
    return form;
  }

  //CompressorNameplateData
  getNameplateDataFormFromObj(nameplateData: CompressorNameplateData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      compressorType: [nameplateData.compressorType],
      motorPower: [nameplateData.motorPower],
      fullLoadOperatingPressure: [nameplateData.fullLoadOperatingPressure],
      fullLoadRatedCapacity: [nameplateData.fullLoadRatedCapacity],
      ratedLoadPower: [nameplateData.ratedLoadPower],
      ploytropicCompressorExponent: [nameplateData.ploytropicCompressorExponent]
    });
    return form;
  }

  getNameplateDataFromFrom(form: FormGroup): CompressorNameplateData {
    return {
      compressorType: form.controls.compressorType.value,
      motorPower: form.controls.motorPower.value,
      fullLoadOperatingPressure: form.controls.fullLoadOperatingPressure.value,
      fullLoadRatedCapacity: form.controls.fullLoadRatedCapacity.value,
      ratedLoadPower: form.controls.ratedLoadPower.value,
      ploytropicCompressorExponent: form.controls.ploytropicCompressorExponent.value
    }
  }

  //CompressorControls
  getCompressorControlsFormFromObj(compressorControls: CompressorControls): FormGroup {
    // control type: 1 Inlet modulation without unloading
    // control type: 2 Inlet modulation with unloading
    // control type: 3 Variable displacement with unloading
    // control type: 4 Load/unload
    // control type: 6 Start/Stop
    // control type: 7 Multi-step unloading
    let form: FormGroup = this.formBuilder.group({
      controlType: [compressorControls.controlType],
      unloadPointCapacity: [compressorControls.unloadPointCapacity],
      numberOfUnloadSteps: [compressorControls.numberOfUnloadSteps],
      automaticShutdown: [compressorControls.automaticShutdown]
    });
    form = this.setCompressorControlValidators(form);
    return form;
  }

  setCompressorControlValidators(form: FormGroup): FormGroup {
    if (form.controls.controlType.value && (form.controls.controlType.value == 2 || form.controls.controlType.value == 3
      || form.controls.controlType.value == 4 || form.controls.controlType.value == 6 || form.controls.controlType.value == 7)) {
      form.controls.unloadPointCapacity.setValidators([Validators.required]);
      form.controls.numberOfUnloadSteps.setValidators([Validators.required]);
      if (form.controls.controlType.value != 6) {
        form.controls.automaticShutdown.setValidators([Validators.required]);
      } else {
        form.controls.automaticShutdown.setValidators([]);
      }
    } else {
      form.controls.automaticShutdown.setValidators([]);
      form.controls.unloadPointCapacity.setValidators([]);
      form.controls.numberOfUnloadSteps.setValidators([]);
    }
    form.controls.unloadPointCapacity.updateValueAndValidity();
    form.controls.numberOfUnloadSteps.updateValueAndValidity();
    form.controls.automaticShutdown.updateValueAndValidity();

    return form;
  }

  getCompressorControlsObjFromForm(form: FormGroup): CompressorControls {
    return {
      controlType: form.controls.controlType.value,
      unloadPointCapacity: form.controls.unloadPointCapacity.value,
      numberOfUnloadSteps: form.controls.numberOfUnloadSteps.value,
      automaticShutdown: form.controls.automaticShutdown.value
    };
  }


  getCentrifugalFormFromObj(centrifugalSpecifics: CentrifugalSpecifics): FormGroup {
    //todo set validators base on compressor type
    let form: FormGroup = this.formBuilder.group({
      surgeAirflow: [centrifugalSpecifics.surgeAirflow],
      maxFullLoadPressure: [centrifugalSpecifics.maxFullLoadPressure],
      maxFullLoadCapacity: [centrifugalSpecifics.maxFullLoadCapacity],
      minFullLoadPressure: [centrifugalSpecifics.minFullLoadPressure],
      minFullLoadCapacity: [centrifugalSpecifics.minFullLoadCapacity],
    });
    return form;
  }

  getCentrifugalObjFromForm(form: FormGroup): CentrifugalSpecifics {
    return {
      surgeAirflow: form.controls.surgeAirflow.value,
      maxFullLoadPressure: form.controls.maxFullLoadPressure.value,
      maxFullLoadCapacity: form.controls.maxFullLoadCapacity.value,
      minFullLoadPressure: form.controls.minFullLoadPressure.value,
      minFullLoadCapacity: form.controls.minFullLoadCapacity.value,
    };
  }

  getDesignDetailsFormFromObj(designDetails: DesignDetails): FormGroup {
    //todo set validators based on control and comp type
    let form: FormGroup = this.formBuilder.group({
      blowdownTime: [designDetails.blowdownTime],
      unloadSlumpPressure: [designDetails.unloadSlumpPressure],
      modulatingPressureRange: [designDetails.modulatingPressureRange],
      inputPressure: [designDetails.inputPressure],
      designEfficiency: [designDetails.designEfficiency],
      serviceFactor: [designDetails.serviceFactor]
    });
    return form;
  }

  getDesignDetailsObjFromForm(form: FormGroup): DesignDetails {
    return {
      blowdownTime: form.controls.blowdownTime.value,
      unloadSlumpPressure: form.controls.unloadSlumpPressure.value,
      modulatingPressureRange: form.controls.modulatingPressureRange.value,
      inputPressure: form.controls.inputPressure.value,
      designEfficiency: form.controls.designEfficiency.value,
      serviceFactor: form.controls.serviceFactor.value
    }
  }


  getPerformancePointFormFromObj(performancePoints: PerformancePoints): FormGroup {
    //todo validators
    let form: FormGroup = this.formBuilder.group({
      fullLoadDischargePressure: [performancePoints.fullLoad.dischargePressure],
      fullLoadAirflow: [performancePoints.fullLoad.airflow],
      fullLoadPower: [performancePoints.fullLoad.power],
      maxFullFlowDischargePressure: [performancePoints.maxFullFlow.dischargePressure],
      maxFullFlowAirflow: [performancePoints.maxFullFlow.airflow],
      maxFullFlowPower: [performancePoints.maxFullFlow.power],
      unloadPointDischargePressure: [performancePoints.unloadPoint.dischargePressure],
      unloadPointAirflow: [performancePoints.unloadPoint.airflow],
      unloadPointPower: [performancePoints.unloadPoint.power],
      noLoadDischargePressure: [performancePoints.noLoad.dischargePressure],
      noLoadAirflow: [performancePoints.noLoad.airflow],
      noLoadPower: [performancePoints.noLoad.power],
      blowoffDischargePressure: [performancePoints.blowoff.dischargePressure],
      blowoffAirflow: [performancePoints.blowoff.airflow],
      blowoffPower: [performancePoints.blowoff.power],
    });
    return form;
  }

  getPerformancePointObjFromForm(form: FormGroup): PerformancePoints {
    return {
      fullLoad: {
        dischargePressure: form.controls.fullLoadDischargePressure.value,
        airflow: form.controls.fullLoadAirflow.value,
        power: form.controls.fullLoadPower.value,
      },
      maxFullFlow: {
        dischargePressure: form.controls.maxFullFlowDischargePressure.value,
        airflow: form.controls.maxFullFlowAirflow.value,
        power: form.controls.maxFullFlowPower.value,
      },
      unloadPoint: {
        dischargePressure: form.controls.unloadPointDischargePressure.value,
        airflow: form.controls.unloadPointAirflow.value,
        power: form.controls.unloadPointPower.value,
      },
      noLoad: {
        dischargePressure: form.controls.noLoadDischargePressure.value,
        airflow: form.controls.noLoadAirflow.value,
        power: form.controls.noLoadPower.value,
      },
      blowoff: {
        dischargePressure: form.controls.blowoffDischargePressure.value,
        airflow: form.controls.blowoffAirflow.value,
        power: form.controls.blowoffPower.value,

      }
    }
  }


  isCompressorValid(compressor: CompressorInventoryItem): boolean {
    let nameplateForm: FormGroup = this.getNameplateDataFormFromObj(compressor.nameplateData);
    let compressorControlsForm: FormGroup = this.getCompressorControlsFormFromObj(compressor.compressorControls);
    let performancePointsForm: FormGroup = this.getPerformancePointFormFromObj(compressor.performancePoints);
    let designDetailsForm: FormGroup = this.getDesignDetailsFormFromObj(compressor.designDetails);
    let centrifugalSpecsForm: FormGroup = this.getCentrifugalFormFromObj(compressor.centrifugalSpecifics);
    return nameplateForm.valid && compressorControlsForm.valid && performancePointsForm.valid && designDetailsForm.valid && centrifugalSpecsForm.valid;
  }
}
