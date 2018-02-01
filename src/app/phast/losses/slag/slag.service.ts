import { Injectable } from '@angular/core';
import { Slag } from '../../../shared/models/phast/losses/slag';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class SlagService {

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

  initForm(lossNum: number): FormGroup {
    return this.formBuilder.group({
      'weight': ['', Validators.required],
      'inletTemperature': ['', Validators.required],
      'outletTemperature': ['', Validators.required],
      'specificHeat': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'name': ['Loss #'+lossNum]
    })
  }

  getFormFromLoss(slag: Slag): FormGroup {
    return this.formBuilder.group({
      'weight': [slag.weight, Validators.required],
      'inletTemperature': [slag.inletTemperature, Validators.required],
      'outletTemperature': [slag.outletTemperature, Validators.required],
      'specificHeat': [slag.specificHeat, Validators.required],
      'correctionFactor': [slag.correctionFactor, Validators.required],
      'name': [slag.name]
    })
  }

  getLossFromForm(form: FormGroup): Slag {
    let tmpSlag: Slag = {
      weight: form.controls.weight.value,
      inletTemperature: form.controls.inletTemperature.value,
      outletTemperature: form.controls.outletTemperature.value,
      specificHeat: form.controls.specificHeat.value,
      correctionFactor: form.controls.correctionFactor.value,
      name: form.controls.name.value
    }
    return tmpSlag;
  }
}
