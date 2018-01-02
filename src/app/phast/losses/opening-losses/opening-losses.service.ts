import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OpeningLoss, CircularOpeningLoss, QuadOpeningLoss } from '../../../shared/models/phast/losses/openingLoss';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class OpeningLossesService {

  deleteLossIndex: BehaviorSubject<number>;
  // addLossBaselineMonitor: BehaviorSubject<any>;
  // addLossModificationMonitor: BehaviorSubject<any>;
  constructor(private formBuilder: FormBuilder) {
    this.deleteLossIndex = new BehaviorSubject<number>(null);
    // this.addLossBaselineMonitor = new BehaviorSubject<any>(null);
    // this.addLossModificationMonitor = new BehaviorSubject<any>(null);
  }

  setDelete(num: number) {
    this.deleteLossIndex.next(num);
  }
  // addLoss(bool: boolean) {
  //   if (bool) {
  //     this.addLossModificationMonitor.next(true);
  //   } else {
  //     this.addLossBaselineMonitor.next(true);
  //   }
  // }

  initForm(lossNum: number) {
    return this.formBuilder.group({
      'numberOfOpenings': [1, Validators.required],
      'openingType': ['Round', Validators.required],
      'wallThickness': ['', Validators.required],
      'lengthOfOpening': ['', Validators.required],
      'heightOfOpening': ['', Validators.required],
      'viewFactor': ['', Validators.required],
      'insideTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'percentTimeOpen': ['', Validators.required],
      'emissivity': [0.9, Validators.required],
      'name': ['Loss #'+lossNum]
    })
  }

  getFormFromLoss(loss: OpeningLoss) {
    return this.formBuilder.group({
      'numberOfOpenings': [loss.numberOfOpenings, Validators.required],
      'openingType': [loss.openingType, Validators.required],
      'wallThickness': [loss.thickness, Validators.required],
      'lengthOfOpening': [loss.lengthOfOpening, Validators.required],
      'heightOfOpening': [loss.heightOfOpening],
      'viewFactor': [loss.viewFactor, Validators.required],
      'insideTemp': [loss.insideTemperature, Validators.required],
      'ambientTemp': [loss.ambientTemperature, Validators.required],
      'percentTimeOpen': [loss.percentTimeOpen, Validators.required],
      'emissivity': [loss.emissivity, Validators.required],
      'name': [loss.name]
    })
  }

  getLossFromForm(form: any): OpeningLoss {
    return {
      numberOfOpenings: form.controls.numberOfOpenings.value,
      emissivity: form.controls.emissivity.value,
      thickness: form.controls.wallThickness.value,
      ambientTemperature: form.controls.ambientTemp.value,
      insideTemperature: form.controls.insideTemp.value,
      percentTimeOpen: form.controls.percentTimeOpen.value,
      viewFactor: form.controls.viewFactor.value,
      openingType: form.controls.openingType.value,
      lengthOfOpening: form.controls.lengthOfOpening.value,
      heightOfOpening: form.controls.heightOfOpening.value,
      name: form.controls.name.value
    };
  }

  getViewFactorInput(input: any) {
    if (input.controls.openingType.value === 'Round') {
      return {
        openingShape: 0,
        thickness: input.controls.wallThickness.value,
        diameter: input.controls.lengthOfOpening.value
      };
    }
    return {
      openingShape: 1,
      thickness: input.controls.wallThickness.value,
      length: input.controls.lengthOfOpening.value,
      width: input.controls.heightOfOpening.value
    };
  }

  getQuadLossFromForm(form: any): QuadOpeningLoss {
    const ratio = Math.min(form.controls.lengthOfOpening.value, form.controls.heightOfOpening.value) / form.controls.wallThickness.value;
    return {
      emissivity: form.controls.emissivity.value,
      length: form.controls.lengthOfOpening.value,
      width: form.controls.heightOfOpening.value,
      thickness: form.controls.wallThickness.value,
      ratio: ratio,
      ambientTemperature: form.controls.ambientTemp.value,
      insideTemperature: form.controls.insideTemp.value,
      percentTimeOpen: form.controls.percentTimeOpen.value,
      viewFactor: form.controls.viewFactor.value
    };
  }

  getCircularLossFromForm(form: any): CircularOpeningLoss {
    const ratio = form.controls.lengthOfOpening.value / form.controls.wallThickness.value;
    return {
      emissivity: form.controls.emissivity.value,
      diameter: form.controls.lengthOfOpening.value,
      thickness: form.controls.wallThickness.value,
      ratio: ratio,
      ambientTemperature: form.controls.ambientTemp.value,
      insideTemperature: form.controls.insideTemp.value,
      percentTimeOpen: form.controls.percentTimeOpen.value,
      viewFactor: form.controls.viewFactor.value
    };
  }
}
