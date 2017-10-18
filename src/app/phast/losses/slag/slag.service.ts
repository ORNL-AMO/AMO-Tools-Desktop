import { Injectable } from '@angular/core';
import { Slag } from '../../../shared/models/phast/losses/slag';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class SlagService {

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
      'weight': ['', Validators.required],
      'inletTemperature': ['', Validators.required],
      'outletTemperature': ['', Validators.required],
      'specificHeat': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required]
    })
  }

  getFormFromLoss(slag: Slag) {
    return this.formBuilder.group({
      'weight': [slag.weight, Validators.required],
      'inletTemperature': [slag.inletTemperature, Validators.required],
      'outletTemperature': [slag.outletTemperature, Validators.required],
      'specificHeat': [slag.specificHeat, Validators.required],
      'correctionFactor': [slag.correctionFactor, Validators.required]
    })
  }

  getLossFromForm(form: any): Slag {
    let tmpSlag: Slag = {
      weight: form.value.weight,
      inletTemperature: form.value.inletTemperature,
      outletTemperature: form.value.outletTemperature,
      specificHeat: form.value.specificHeat,
      correctionFactor: form.value.correctionFactor
    }
    return tmpSlag;
  }
}
