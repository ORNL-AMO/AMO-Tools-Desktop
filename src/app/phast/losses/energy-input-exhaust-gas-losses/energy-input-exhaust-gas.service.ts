import { Injectable } from '@angular/core';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
@Injectable()
export class EnergyInputExhaustGasService {

  deleteLossIndex: BehaviorSubject<number>;
  addLossBaselineMonitor: BehaviorSubject<any>;
  addLossModificationMonitor: BehaviorSubject<any>;
  // addOtherMonitor: BehaviorSubject<any>;
  // deleteOtherMonitor: BehaviorSubject<any>;
  constructor(private formBuilder: FormBuilder) {
    this.deleteLossIndex = new BehaviorSubject<number>(null);
    this.addLossBaselineMonitor = new BehaviorSubject<any>(null);
    this.addLossModificationMonitor = new BehaviorSubject<any>(null);
    // this.addOtherMonitor = new BehaviorSubject<any>(null);
    // this.deleteOtherMonitor = new BehaviorSubject<any>(null);
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
      'excessAir': [20],
      'combustionAirTemp': [''],
      'exhaustGasTemp': [''],
      'totalHeatInput': [3],
      'electricalPowerInput': [''],
     // 'otherLoss1': ['']
    })
  }

  getFormFromLoss(energyInputExhaustGas: EnergyInputExhaustGasLoss) {
    let tmpGroup = this.formBuilder.group({
      'excessAir': [energyInputExhaustGas.excessAir],
      'combustionAirTemp': [energyInputExhaustGas.combustionAirTemp],
      'exhaustGasTemp': [energyInputExhaustGas.exhaustGasTemp],
      'totalHeatInput': [energyInputExhaustGas.totalHeatInput],
      'electricalPowerInput': [energyInputExhaustGas.electricalPowerInput],
    })
    // if (energyInputExhaustGas.otherLossObjects) {
    //   let index = 1;
    //   energyInputExhaustGas.otherLossObjects.forEach(loss => {
    //     let otherControl = new FormControl(loss);
    //     tmpGroup.addControl(
    //       'otherLoss' + index, otherControl
    //     );
    //     index++;
    //   })
    // }
    return tmpGroup;
  }

  getLossFromForm(form: any): EnergyInputExhaustGasLoss {
    let tmpExhaustGas: EnergyInputExhaustGasLoss = {
      excessAir: form.value.excessAir,
      combustionAirTemp: form.value.combustionAirTemp,
      exhaustGasTemp: form.value.exhaustGasTemp,
      totalHeatInput: form.value.totalHeatInput,
      electricalPowerInput: form.value.electricalPowerInput,
      //otherLossObjects: new Array(),
      otherLosses: 0.0
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
