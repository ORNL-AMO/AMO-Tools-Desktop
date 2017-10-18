import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AtmosphereLossesService {

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


  //get empty atmosphere form
  initForm() {
    return this.formBuilder.group({
      'atmosphereGas': ['', Validators.required],
      'specificHeat': ['', Validators.required],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'flowRate': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
    });
  }

  //get form from object
  getAtmosphereForm(loss: AtmosphereLoss) {
    return this.formBuilder.group({
      'atmosphereGas': [loss.atmosphereGas, Validators.required],
      'specificHeat': [loss.specificHeat, Validators.required],
      'inletTemp': [loss.inletTemperature, Validators.required],
      'outletTemp': [loss.outletTemperature, Validators.required],
      'flowRate': [loss.flowRate, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required]
    });
  }

  getLossFromForm(form: any): AtmosphereLoss {
    let tmpLoss: AtmosphereLoss = {
      atmosphereGas: form.value.atmosphereGas,
      specificHeat: form.value.specificHeat,
      inletTemperature: form.value.inletTemp,
      outletTemperature: form.value.outletTemp,
      flowRate: form.value.flowRate,
      correctionFactor: form.value.correctionFactor
    }
    return tmpLoss;
  }
}
