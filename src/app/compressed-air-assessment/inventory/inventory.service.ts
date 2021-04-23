import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CompressorControls, CompressorInventoryItem, CompressorNameplateData, UnloadControls } from '../../shared/models/compressed-air-assessment';

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
        unloadControls: {
          unloadingPointCapacity: undefined,
          numberOfUnloadingSteps: undefined,
          shutdownTimer: false
        }
      },
      performanceData: {
        inletAtmosphericPressure: undefined
      },
      designDetails: {
        blowdownTime: undefined,
        unloadSlumpPressure: undefined,
        modulatingPressureRange: undefined,
        inputPressure: undefined,
        surgeAirflow: undefined,
        maxFullLoadPressure: undefined,
        maxFullLoadCapacity: undefined,
        minFullLoadPressure: undefined,
        minFullLoadCapacity: undefined,
        designEfficiency: undefined
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
    let form: FormGroup = this.formBuilder.group({
      controlType: [compressorControls.controlType]
    });
    return form;
  }

  getCompressorControlsObjFromForm(form: FormGroup, compressorControls: CompressorControls): CompressorControls {
    compressorControls.controlType = form.controls.controlType.value;
    return compressorControls;
  }

  getUnloadControlsFormFromObj(unloadControls: UnloadControls): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      unloadingPointCapacity: [unloadControls.unloadingPointCapacity],
      numberOfUnloadingSteps: [unloadControls.numberOfUnloadingSteps],
      shutdownTimer: [unloadControls.shutdownTimer]
    });
    return form;
  }

  getUnloadControlsObjFromForm(form: FormGroup): UnloadControls {
    return {
      unloadingPointCapacity: form.controls.unloadingPointCapacity.value,
      numberOfUnloadingSteps: form.controls.numberOfUnloadingSteps.value,
      shutdownTimer: form.controls.shutdownTimer.value,
    }
  }

}
