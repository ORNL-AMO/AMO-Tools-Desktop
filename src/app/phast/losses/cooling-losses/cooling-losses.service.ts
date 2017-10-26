import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { WaterCoolingLoss, LiquidCoolingLoss, GasCoolingLoss, CoolingLoss } from '../../../shared/models/phast/losses/coolingLoss';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class CoolingLossesService {
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
  initWaterCoolingForm() {
    return this.formBuilder.group({
      'liquidFlow': ['', Validators.required],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'correctionFactor': ['', Validators.required],
    })
  }

  initWaterFormFromLoss(loss: WaterCoolingLoss) {
    return this.formBuilder.group({
      'liquidFlow': [loss.flowRate, Validators.required],
      'inletTemp': [loss.initialTemperature, Validators.required],
      'outletTemp': [loss.outletTemperature, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required],
    })
  }

  initWaterLossFromForm(form: any): WaterCoolingLoss {
    let tmpLoss: WaterCoolingLoss = {
      flowRate: form.value.liquidFlow,
      initialTemperature: form.value.inletTemp,
      outletTemperature: form.value.outletTemp,
      correctionFactor: form.value.correctionFactor
    }
    return tmpLoss;
  }

  initLiquidCoolingForm() {
    return this.formBuilder.group({
      'avgSpecificHeat': [1, Validators.required],
      'density': [8.338, Validators.required],
      'liquidFlow': ['', Validators.required],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
    });
  }

  initLiquidFormFromLoss(loss: LiquidCoolingLoss) {
    return this.formBuilder.group({
      'avgSpecificHeat': [loss.specificHeat, Validators.required],
      'density': [loss.density, Validators.required],
      'liquidFlow': [loss.flowRate, Validators.required],
      'inletTemp': [loss.initialTemperature, Validators.required],
      'outletTemp': [loss.outletTemperature, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required],
    })
  }

  initLiquidLossFromForm(form: any): LiquidCoolingLoss {
    let tmpLoss: LiquidCoolingLoss = {
      flowRate: form.value.liquidFlow,
      density: form.value.density,
      initialTemperature: form.value.inletTemp,
      outletTemperature: form.value.outletTemp,
      specificHeat: form.value.avgSpecificHeat,
      correctionFactor: form.value.correctionFactor
    }
    return tmpLoss;
  }

  initGasCoolingForm() {
    return this.formBuilder.group({
      'avgSpecificHeat': [.2371, Validators.required],
      'gasFlow': ['', Validators.required],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'gasDensity': [0.074887, Validators.required]
    });
  }

  initGasFormFromLoss(loss: GasCoolingLoss) {
    return this.formBuilder.group({
      'avgSpecificHeat': [loss.specificHeat, Validators.required],
      'gasFlow': [loss.flowRate, Validators.required],
      'inletTemp': [loss.initialTemperature, Validators.required],
      'outletTemp': [loss.finalTemperature, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required],
      'gasDensity': [loss.gasDensity, Validators.required]
    });
  }

  initGasLossFromForm(form: any): GasCoolingLoss {
    let tmpLoss: GasCoolingLoss = {
      flowRate: form.value.gasFlow,
      initialTemperature: form.value.inletTemp,
      finalTemperature: form.value.outletTemp,
      specificHeat: form.value.avgSpecificHeat,
      correctionFactor: form.value.correctionFactor,
      gasDensity: form.value.gasDensity
    }
    return tmpLoss;
  }

}
