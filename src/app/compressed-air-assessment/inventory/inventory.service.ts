import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CentrifugalSpecifics, CompressorControls, CompressorInventoryItem, CompressorNameplateData, DesignDetails } from '../../shared/models/compressed-air-assessment';

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
        ploytropicCompressorExponent: undefined
      },
      compressorControls: {
        controlType: undefined,
        unloadPoint: 100,
        numberOfUnloadSteps: 2,
        automaticShutdown: false
      },
      performanceData: {
        inletAtmosphericPressure: undefined
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
      unloadPoint: [compressorControls.unloadPoint],
      numberOfUnloadSteps: [compressorControls.numberOfUnloadSteps],
      automaticShutdown: [compressorControls.automaticShutdown]
    });
    form = this.setCompressorControlValidators(form);
    return form;
  }

  setCompressorControlValidators(form: FormGroup): FormGroup {
    if (form.controls.controlType.value && (form.controls.controlType.value == 2 || form.controls.controlType.value == 3
      || form.controls.controlType.value == 4 || form.controls.controlType.value == 6 || form.controls.controlType.value == 7)) {
      form.controls.unloadPoint.setValidators([Validators.required]);
      form.controls.numberOfUnloadSteps.setValidators([Validators.required]);
      if (form.controls.controlType.value != 6) {
        form.controls.automaticShutdown.setValidators([Validators.required]);
      } else {
        form.controls.automaticShutdown.setValidators([]);
      }
    } else {
      form.controls.automaticShutdown.setValidators([]);
      form.controls.unloadPoint.setValidators([]);
      form.controls.numberOfUnloadSteps.setValidators([]);
    }
    form.controls.unloadPoint.updateValueAndValidity();
    form.controls.numberOfUnloadSteps.updateValueAndValidity();
    form.controls.automaticShutdown.updateValueAndValidity();

    return form;
  }

  getCompressorControlsObjFromForm(form: FormGroup): CompressorControls {
    return {
      controlType: form.controls.controlType.value,
      unloadPoint: form.controls.unloadPoint.value,
      numberOfUnloadSteps: form.controls.numberOfUnloadSteps.value,
      automaticShutdown: form.controls.automaticShutdown.value
    };
  }


  getCentrifugalFormFromObj(centrifugalSpecifics: CentrifugalSpecifics): FormGroup {
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

}
