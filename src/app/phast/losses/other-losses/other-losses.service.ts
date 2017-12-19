import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OtherLoss } from '../../../shared/models/phast/losses/otherLoss';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class OtherLossesService {

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
  initForm() {
    return this.formBuilder.group({
      description: ['', Validators.required],
      heatLoss: [0.0, Validators.required]
    })
  }

  getLossFromForm(form: any): OtherLoss {
    let tmpLoss = {
      description: form.value.description,
      heatLoss: form.value.heatLoss
    }
    return tmpLoss
  }

  getFormFromLoss(loss: OtherLoss) {
    return this.formBuilder.group({
      description: [loss.description, Validators.required],
      heatLoss: [loss.heatLoss, Validators.required]
    })
  }
}
