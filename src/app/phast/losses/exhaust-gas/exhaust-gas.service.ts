import { Injectable } from '@angular/core';
import { ExhaustGasEAF } from '../../../shared/models/phast/losses/exhaustGasEAF';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';

@Injectable()
export class ExhaustGasService {

  deleteLossIndex: BehaviorSubject<number>;
  //addLossBaselineMonitor: BehaviorSubject<any>;
 // addLossModificationMonitor: BehaviorSubject<any>;
  // addOtherMonitor: BehaviorSubject<any>;
  // deleteOtherMonitor: BehaviorSubject<any>;
  constructor(private formBuilder: FormBuilder) {
    this.deleteLossIndex = new BehaviorSubject<number>(null);
    //this.addLossBaselineMonitor = new BehaviorSubject<any>(null);
    //this.addLossModificationMonitor = new BehaviorSubject<any>(null);
    // this.addOtherMonitor = new BehaviorSubject<any>(null);
    // this.deleteOtherMonitor = new BehaviorSubject<any>(null);
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
    //  'cycleTime': ['', Validators.required],
      'offGasTemp': ['', Validators.required],
      'CO': ['', Validators.required],
     // 'O2': ['', Validators.required],
      'H2': ['', Validators.required],
     // 'CO2': ['', Validators.required],
      'combustibleGases': ['', Validators.required],
      'vfr': ['', Validators.required],
      'dustLoading': ['', Validators.required],
     // 'otherLoss1': ['', Validators.required],
      'name': ['Loss #'+lossNum]
    })
  }

  getFormFromLoss(exhaustGas: ExhaustGasEAF) {
    let tmpGroup = this.formBuilder.group({
      //'cycleTime': [exhaustGas.cycleTime, Validators.required],
      'offGasTemp': [exhaustGas.offGasTemp, Validators.required],
      'CO': [exhaustGas.CO, Validators.required],
      //'O2': [exhaustGas.O2, Validators.required],
      'H2': [exhaustGas.H2, Validators.required],
      //'CO2': [exhaustGas.CO2, Validators.required],
      'combustibleGases': [exhaustGas.combustibleGases, Validators.required],
      'vfr': [exhaustGas.vfr, Validators.required],
      'dustLoading': [exhaustGas.dustLoading, Validators.required],
      'name': exhaustGas.name
    })
    // if (exhaustGas.otherLossObjects) {
    //   let index = 1;
    //   exhaustGas.otherLossObjects.forEach(loss => {
    //     let otherControl = new FormControl(loss);
    //     tmpGroup.addControl(
    //       'otherLoss' + index, otherControl
    //     );
    //     index++;
    //   })
    // }
    return tmpGroup;
  }

  getLossFromForm(form: any): ExhaustGasEAF {
    let tmpExhaustGas: ExhaustGasEAF = {
     // cycleTime: form.controls.cycleTime.value,
      offGasTemp: form.controls.offGasTemp.value,
      CO: form.controls.CO.value,
     // O2: form.controls.O2.value,
      H2: form.controls.H2.value,
     // CO2: form.controls.CO2.value,
      combustibleGases: form.controls.combustibleGases.value,
      vfr: form.controls.vfr.value,
      dustLoading: form.controls.dustLoading.value,
     // otherLossObjects: new Array(),
      otherLosses: 0.0,
      name: form.controls.name.value
    }
    // let tmpOtherLosses = new Array();
    // Object.keys(form.controls).forEach(key => {
    //   if (_.includes(key, "otherLoss")) {
    //     tmpOtherLosses.push(
    //       form.get(key).value
    //     )
    //   }
    // })
    // tmpExhaustGas.otherLossObjects = tmpOtherLosses;
    // tmpExhaustGas.otherLosses = _.sum(tmpOtherLosses);
    return tmpExhaustGas;
  }
}
