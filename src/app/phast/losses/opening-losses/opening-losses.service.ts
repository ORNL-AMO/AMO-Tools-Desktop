import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OpeningLoss } from '../../../shared/models/phast/losses/openingLoss';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class OpeningLossesService {
  
  deleteLossIndex: BehaviorSubject<number>;
  addLossBaselineMonitor: BehaviorSubject<any>;
  addLossModificationMonitor: BehaviorSubject<any>;
  constructor(private formBuilder: FormBuilder) {
    this.deleteLossIndex = new BehaviorSubject<number>(null);
    this.addLossBaselineMonitor = new BehaviorSubject<any>(null);
    this.addLossModificationMonitor = new BehaviorSubject<any>(null);
  }

  setDelete(num: number) {
    this.deleteLossIndex.next(num);
  }
  addLoss(bool: boolean) {
    if (bool) {
      this.addLossModificationMonitor.next(true);
    } else {
      this.addLossBaselineMonitor.next(true);
    }
  }
  
  initForm() {
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
      'emissivity': ['', Validators.required]
    })
  }

  getFormFromLoss(loss: OpeningLoss) {
    return this.formBuilder.group({
      'numberOfOpenings': [loss.numberOfOpenings, Validators.required],
      'openingType': [loss.openingType, Validators.required],
      'wallThickness': [loss.thickness, Validators.required],
      'lengthOfOpening': [loss.lengthOfOpening, Validators.required],
      'heightOfOpening': [loss.heightOfOpening, Validators.required],
      'viewFactor': [loss.viewFactor, Validators.required],
      'insideTemp': [loss.insideTemperature, Validators.required],
      'ambientTemp': [loss.ambientTemperature, Validators.required],
      'percentTimeOpen': [loss.percentTimeOpen, Validators.required],
      'emissivity': [loss.emissivity, Validators.required]
    })
  }

  getLossFromForm(form: any): OpeningLoss {
    let tmpLoss: OpeningLoss = {
      numberOfOpenings: form.value.numberOfOpenings,
      emissivity: form.value.emissivity,
      thickness: form.value.wallThickness,
      ambientTemperature: form.value.ambientTemp,
      insideTemperature: form.value.insideTemp,
      percentTimeOpen: form.value.percentTimeOpen,
      viewFactor: form.value.viewFactor,
      openingType: form.value.openingType,
      lengthOfOpening: form.value.lengthOfOpening,
      heightOfOpening: form.value.heightOfOpening,
    }
    return tmpLoss;
  }

}
