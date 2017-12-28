import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { WaterCoolingLoss, LiquidCoolingLoss, GasCoolingLoss, CoolingLoss } from '../../../shared/models/phast/losses/coolingLoss';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
@Injectable()
export class CoolingLossesService {
  deleteLossIndex: BehaviorSubject<number>;
  //  addLossBaselineMonitor: BehaviorSubject<any>;
  //  addLossModificationMonitor: BehaviorSubject<any>;
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

  initLiquidCoolingForm(settings: Settings, lossNum: number) {
    let defaultDensity: number = 8.338;
    let defaultSpecificHeat: number = 1;
    if (settings.unitsOfMeasure == 'Metric') {
      defaultDensity = .999;
      defaultSpecificHeat = 4.187;
    }
    return this.formBuilder.group({
      'avgSpecificHeat': [defaultSpecificHeat, Validators.required],
      'density': [defaultDensity, Validators.required],
      'liquidFlow': ['', Validators.required],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'name': ['Loss #' + lossNum],
      'coolingMedium': ['']
    });
  }

  initLiquidFormFromLoss(loss: CoolingLoss) {
    return this.formBuilder.group({
      'avgSpecificHeat': [loss.liquidCoolingLoss.specificHeat, Validators.required],
      'density': [loss.liquidCoolingLoss.density, Validators.required],
      'liquidFlow': [loss.liquidCoolingLoss.flowRate, Validators.required],
      'inletTemp': [loss.liquidCoolingLoss.initialTemperature, Validators.required],
      'outletTemp': [loss.liquidCoolingLoss.outletTemperature, Validators.required],
      'correctionFactor': [loss.liquidCoolingLoss.correctionFactor, Validators.required],
      'name': [loss.name],
      'coolingMedium': [loss.coolingMedium]
    })
  }

  initLiquidLossFromForm(form: any): CoolingLoss {
    let tmpLoss: CoolingLoss = {
      name: form.value.name,
      coolingMedium: form.value.coolingMedium,
      liquidCoolingLoss: {
        flowRate: form.value.liquidFlow,
        density: form.value.density,
        initialTemperature: form.value.inletTemp,
        outletTemperature: form.value.outletTemp,
        specificHeat: form.value.avgSpecificHeat,
        correctionFactor: form.value.correctionFactor
      }
    }
    return tmpLoss;
  }

  initGasCoolingForm(settings: Settings, lossNum: number) {
    let defaultDensity: number = .074887;
    let defaultSpecificHeat: number = .2371;
    if (settings.unitsOfMeasure == 'Metric') {
      defaultDensity = 1.2;
      defaultSpecificHeat = 0.993;
    }
    return this.formBuilder.group({
      'avgSpecificHeat': [defaultSpecificHeat, Validators.required],
      'gasFlow': ['', Validators.required],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'gasDensity': [defaultDensity, Validators.required],
      'name': ['Loss #' + lossNum],
      'coolingMedium': ['']
    });
  }

  initGasFormFromLoss(loss: CoolingLoss) {
    return this.formBuilder.group({
      'avgSpecificHeat': [loss.gasCoolingLoss.specificHeat, Validators.required],
      'gasFlow': [loss.gasCoolingLoss.flowRate, Validators.required],
      'inletTemp': [loss.gasCoolingLoss.initialTemperature, Validators.required],
      'outletTemp': [loss.gasCoolingLoss.finalTemperature, Validators.required],
      'correctionFactor': [loss.gasCoolingLoss.correctionFactor, Validators.required],
      'gasDensity': [loss.gasCoolingLoss.gasDensity, Validators.required],
      'name': [loss.name],
      'coolingMedium': [loss.coolingMedium]
    });
  }

  initGasLossFromForm(form: any): CoolingLoss {
    let tmpLoss: CoolingLoss = {
      name: form.value.name,
      coolingMedium: form.value.coolingMedium,
      gasCoolingLoss: {
        flowRate: form.value.gasFlow,
        initialTemperature: form.value.inletTemp,
        finalTemperature: form.value.outletTemp,
        specificHeat: form.value.avgSpecificHeat,
        correctionFactor: form.value.correctionFactor,
        gasDensity: form.value.gasDensity
      }
    }
    return tmpLoss;
  }

}
