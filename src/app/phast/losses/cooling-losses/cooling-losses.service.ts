import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
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
  initWaterCoolingForm(): FormGroup {
    return this.formBuilder.group({
      'liquidFlow': ['', Validators.required],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'correctionFactor': ['', Validators.required],
    })
  }

  initWaterFormFromLoss(loss: WaterCoolingLoss): FormGroup {
    return this.formBuilder.group({
      'liquidFlow': [loss.flowRate, Validators.required],
      'inletTemp': [loss.initialTemperature, Validators.required],
      'outletTemp': [loss.outletTemperature, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required],
    })
  }

  initWaterLossFromForm(form: FormGroup): WaterCoolingLoss {
    let tmpLoss: WaterCoolingLoss = {
      flowRate: form.controls.liquidFlow.value,
      initialTemperature: form.controls.inletTemp.value,
      outletTemperature: form.controls.outletTemp.value,
      correctionFactor: form.controls.correctionFactor.value
    }
    return tmpLoss;
  }

  initLiquidCoolingForm(settings: Settings, lossNum: number): FormGroup {
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

  initLiquidFormFromLoss(loss: CoolingLoss): FormGroup {
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

  initLiquidLossFromForm(form: FormGroup): CoolingLoss {
    let tmpLoss: CoolingLoss = {
      name: form.controls.name.value,
      liquidCoolingLoss: {
        flowRate: form.controls.liquidFlow.value,
        density: form.controls.density.value,
        initialTemperature: form.controls.inletTemp.value,
        outletTemperature: form.controls.outletTemp.value,
        specificHeat: form.controls.avgSpecificHeat.value,
        correctionFactor: form.controls.correctionFactor.value
      }
    }
    return tmpLoss;
  }

  initGasCoolingForm(settings: Settings, lossNum: number): FormGroup {
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

  initGasFormFromLoss(loss: CoolingLoss): FormGroup {
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

  initGasLossFromForm(form: FormGroup): CoolingLoss {
    let tmpLoss: CoolingLoss = {
      name: form.controls.name.value,
      gasCoolingLoss: {
        flowRate: form.controls.gasFlow.value,
        initialTemperature: form.controls.inletTemp.value,
        finalTemperature: form.controls.outletTemp.value,
        specificHeat: form.controls.avgSpecificHeat.value,
        correctionFactor: form.controls.correctionFactor.value,
        gasDensity: form.controls.gasDensity.value
      }
    }
    return tmpLoss;
  }

}
