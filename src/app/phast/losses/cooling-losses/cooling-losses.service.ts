import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { WaterCoolingLoss, LiquidCoolingLoss, GasCoolingLoss, CoolingLoss } from '../../../shared/models/losses/coolingLoss';

@Injectable()
export class CoolingLossesService {

  constructor(private formBuilder: FormBuilder) { }


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

  initWaterLossFromForm(form: any): CoolingLoss {
    let tmpLoss: CoolingLoss = {
      coolingLossType: 'Water',
      waterCoolingLoss: {
        flowRate: form.value.liquidFlow,
        initialTemperature: form.value.inletTemp,
        outletTemperature: form.value.outletTemp,
        correctionFactor: form.value.correctionFactor
      }
    }
    return tmpLoss;
  }

  initLiquidCoolingForm() {
    return this.formBuilder.group({
      'avgSpecificHeat': ['', Validators.required],
      'density': ['', Validators.required],
      'liquidFlow': ['', Validators.required],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'correctionFactor': ['', Validators.required],
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

  initLiquidLossFromForm(form: any): CoolingLoss {
    let tmpLoss: CoolingLoss = {
      coolingLossType: 'Other Liquid',
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

  initGasCoolingForm() {
    return this.formBuilder.group({
      'avgSpecificHeat': ['', Validators.required],
      'gasFlow': ['', Validators.required],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'correctionFactor': ['', Validators.required],
    });
  }

  initGasFormFromLoss(loss: GasCoolingLoss) {
    return this.formBuilder.group({
      'avgSpecificHeat': [loss.specificHeat, Validators.required],
      'gasFlow': [loss.flowRate, Validators.required],
      'inletTemp': [loss.initialTemperature, Validators.required],
      'outletTemp': [loss.finalTemperature, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required],
    });
  }

  initGasLossFromForm(form: any): CoolingLoss {
    let tmpLoss: CoolingLoss = {
      coolingLossType: 'Other Gas',
      gasCoolingLoss: {
        flowRate: form.value.gasFlow,
        initialTemperature: form.value.inletTemp,
        finalTemperature: form.value.outletTemp,
        specificHeat: form.value.avgSpecificHeat,
        correctionFactor: form.value.correctionFactor
      }
    }
    return tmpLoss;
  }

}
