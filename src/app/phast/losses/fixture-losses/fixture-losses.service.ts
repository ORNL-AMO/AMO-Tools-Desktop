import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FixtureLossesService {

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
      'materialName': ['', Validators.required],
      'feedRate': ['', Validators.required],
      'initialTemp': ['', Validators.required],
      'finalTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'specificHeat': ['', Validators.required],
      'name': ['Loss #'+lossNum]
    })
  }

  getFormFromLoss(loss: FixtureLoss): FormGroup {
    return this.formBuilder.group({
      'materialName': [loss.materialName, Validators.required],
      'feedRate': [loss.feedRate, Validators.required],
      'initialTemp': [loss.initialTemperature, Validators.required],
      'finalTemp': [loss.finalTemperature, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required],
      'specificHeat': [loss.specificHeat, Validators.required],
      'name': [loss.name]
    })
  }

  getLossFromForm(form: FormGroup): FixtureLoss {
    let tmpLoss: FixtureLoss = {
      specificHeat: form.controls.specificHeat.value,
      feedRate: form.controls.feedRate.value,
      initialTemperature: form.controls.initialTemp.value,
      finalTemperature: form.controls.finalTemp.value,
      correctionFactor: form.controls.correctionFactor.value,
      materialName: form.controls.materialName.value,
      name: form.controls.name.value
    }
    return tmpLoss;
  }
}
