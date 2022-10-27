import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CoolingLoss, GasCoolingLoss, LiquidCoolingLoss } from '../../../shared/models/phast/losses/coolingLoss';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class CoolingFormService {

  constructor(private formBuilder: UntypedFormBuilder){}

  initLiquidCoolingForm(settings: Settings, assesmentLossNum?: number): UntypedFormGroup {
    let lossNumber = assesmentLossNum? assesmentLossNum : 1;

    let defaultDensity: number = 8.338;
    let defaultSpecificHeat: number = 1;

    if (settings.unitsOfMeasure === 'Metric') {
      defaultDensity = .999;
      defaultSpecificHeat = 4.187;
    }

    return this.formBuilder.group({
      'avgSpecificHeat': [defaultSpecificHeat,  [Validators.required, Validators.min(0)]],
      'density': [defaultDensity,  [Validators.required, Validators.min(0)]],
      'liquidFlow': ['',  [Validators.required, Validators.min(0)]],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'name': ['Loss #' + lossNumber],
      'coolingMedium': ['Liquid']
    });
  }

  initGasCoolingForm(settings: Settings, assesmentLossNum?: number): UntypedFormGroup {
    let lossNumber = assesmentLossNum? assesmentLossNum : 1;
    
    let defaultDensity: number = .074887;
    let defaultSpecificHeat: number = .2371;

    if (settings.unitsOfMeasure === 'Metric') {
      defaultDensity = 1.2;
      defaultSpecificHeat = 0.993;
    }
    
    return this.formBuilder.group({
      'avgSpecificHeat': [defaultSpecificHeat,  [Validators.required, Validators.min(0)]],
      'gasFlow': ['',  [Validators.required, Validators.min(0)]],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'gasDensity': [defaultDensity, [Validators.required, Validators.min(0)]],
      'name': ['Loss #' + lossNumber],
      'coolingMedium': ['Gas']
    });
  }

  initLiquidFormFromLoss(loss: CoolingLoss): UntypedFormGroup {
    let formGroup = this.formBuilder.group({
      'avgSpecificHeat': [loss.liquidCoolingLoss.specificHeat,  [Validators.required, Validators.min(0)]],
      'density': [loss.liquidCoolingLoss.density, [Validators.required, Validators.min(0)]],
      'liquidFlow': [loss.liquidCoolingLoss.flowRate,  [Validators.required, Validators.min(0)]],
      'inletTemp': [loss.liquidCoolingLoss.initialTemperature, Validators.required],
      'outletTemp': [loss.liquidCoolingLoss.outletTemperature, Validators.required],
      'correctionFactor': [loss.liquidCoolingLoss.correctionFactor, Validators.required],
      'name': [loss.name],
      'coolingMedium': [loss.coolingMedium]
    });

    return formGroup;
  }

  initLiquidLossFromForm(form: UntypedFormGroup): CoolingLoss {
    let tmpLoss: CoolingLoss = {
      name: form.controls.name.value,
      coolingMedium: form.controls.coolingMedium.value,
      liquidCoolingLoss: {
        flowRate: form.controls.liquidFlow.value,
        density: form.controls.density.value,
        initialTemperature: form.controls.inletTemp.value,
        outletTemperature: form.controls.outletTemp.value,
        specificHeat: form.controls.avgSpecificHeat.value,
        correctionFactor: form.controls.correctionFactor.value
      }
    };
    return tmpLoss;
  }

  initGasFormFromLoss(loss: CoolingLoss): UntypedFormGroup {
    return this.formBuilder.group({
      'avgSpecificHeat': [loss.gasCoolingLoss.specificHeat,  [Validators.required, Validators.min(0)]],
      'gasFlow': [loss.gasCoolingLoss.flowRate,  [Validators.required, Validators.min(0)]],
      'inletTemp': [loss.gasCoolingLoss.initialTemperature, Validators.required],
      'outletTemp': [loss.gasCoolingLoss.finalTemperature, Validators.required],
      'correctionFactor': [loss.gasCoolingLoss.correctionFactor, Validators.required],
      'gasDensity': [loss.gasCoolingLoss.gasDensity, [Validators.required, Validators.min(0)]],
      'name': [loss.name],
      'coolingMedium': [loss.coolingMedium]
    });
  }

  initGasLossFromForm(form: UntypedFormGroup): CoolingLoss {
    let tmpLoss: CoolingLoss = {
      name: form.controls.name.value,
      coolingMedium: form.controls.coolingMedium.value,
      gasCoolingLoss: {
        flowRate: form.controls.gasFlow.value,
        initialTemperature: form.controls.inletTemp.value,
        finalTemperature: form.controls.outletTemp.value,
        specificHeat: form.controls.avgSpecificHeat.value,
        correctionFactor: form.controls.correctionFactor.value,
        gasDensity: form.controls.gasDensity.value,
        outletTemperature: form.controls.outletTemp.value
      }
    };
    return tmpLoss;
  }

  checkWarningsExist(warnings: GasCoolingWarnings | LiquidCoolingWarnings): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
  }
  //Both
  checkSpecificHeat(loss: GasCoolingLoss | LiquidCoolingLoss): string {
    if (loss.specificHeat < 0) {
      return 'Average Specific Heat must be equal or greater than 0';
    } else {
      return null;
    }
  }

  checkGasFlow(loss: GasCoolingLoss | LiquidCoolingLoss): string {
    if (loss.flowRate < 0) {
      return 'Gas Flow must be equal or greater than 0';
    } else {
      return null;
    }
  }
  
  checkInletTemp(loss: GasCoolingLoss | LiquidCoolingLoss): string {
    if (loss.initialTemperature > loss.outletTemperature) {
      return 'Inlet temperature is greater than outlet temperature';
    } else {
      return null;
    }
  }

  //liquid
  checkLiquidWarnings(loss: LiquidCoolingLoss): LiquidCoolingWarnings {
    return {
      specificHeatWarning: this.checkSpecificHeat(loss),
      temperatureWarning: this.checkInletTemp(loss),
      densityLiquidWarning: this.checkLiquidDensity(loss),
      liquidFlowWarning: this.checkGasFlow(loss)
    };
  }

  checkLiquidDensity(loss: LiquidCoolingLoss): string {
    if (loss.density < 0) {
      return 'Density must be equal or greater than 0';
    } else {
      return null;
    }
  }


  //gas
  checkGasWarnings(loss: GasCoolingLoss): GasCoolingWarnings {
    return {
      specificHeatWarning: this.checkSpecificHeat(loss),
      gasFlowWarning: this.checkGasFlow(loss),
      gasDensityWarning: this.checkGasDensity(loss),
      temperatureWarning: this.checkInletTemp(loss)
    };
  }

  checkGasDensity(loss: GasCoolingLoss): string {
    if (loss.gasDensity < 0) {
      return 'Gas Density must be equal or greater than 0';
    } else {
      return null;
    }
  }
}

export interface GasCoolingWarnings {
  specificHeatWarning: string;
  gasFlowWarning: string;
  gasDensityWarning: string;
  temperatureWarning: string;
}

export interface LiquidCoolingWarnings {
  specificHeatWarning: string;
  temperatureWarning: string;
  densityLiquidWarning: string;
  liquidFlowWarning: string;
}
