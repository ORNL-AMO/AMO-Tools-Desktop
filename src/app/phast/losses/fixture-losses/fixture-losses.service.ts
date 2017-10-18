import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FixtureLossesService {

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
      'materialName': ['', Validators.required],
      'feedRate': ['', Validators.required],
      'initialTemp': ['', Validators.required],
      'finalTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'specificHeat': ['', Validators.required]
    })
  }

  getFormFromLoss(loss: FixtureLoss) {
    return this.formBuilder.group({
      'materialName': [loss.materialName, Validators.required],
      'feedRate': [loss.feedRate, Validators.required],
      'initialTemp': [loss.initialTemperature, Validators.required],
      'finalTemp': [loss.finalTemperature, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required],
      'specificHeat': [loss.specificHeat, Validators.required]
    })
  }

  getLossFromForm(form: any): FixtureLoss {
    let tmpLoss: FixtureLoss = {
      specificHeat: form.value.specificHeat,
      feedRate: form.value.feedRate,
      initialTemperature: form.value.initialTemp,
      finalTemperature: form.value.finalTemp,
      correctionFactor: form.value.correctionFactor,
      materialName: form.value.materialName
    }
    return tmpLoss;
  }
}
