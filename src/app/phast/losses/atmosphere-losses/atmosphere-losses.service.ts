import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AtmosphereLoss } from '../../../shared/models/losses/atmosphereLoss';
@Injectable()
export class AtmosphereLossesService {

  constructor(private formBuilder: FormBuilder) { }

  //get empty atmosphere form
  initForm() {
    return this.formBuilder.group({
      'baselineAtmosphereGas': ['', Validators.required],
      'baselineSpecificHeat': ['', Validators.required],
      'baselineInitialTemp': ['', Validators.required],
      'baselineFinalTemp': ['', Validators.required],
      'baselineFlowRate': ['', Validators.required],
      'baselineCorrectionFactor': ['', Validators.required],
      'modifiedAtmosphereGas': ['', Validators.required],
      'modifiedSpecificHeat': ['', Validators.required],
      'modifiedInitialTemp': ['', Validators.required],
      'modifiedFinalTemp': ['', Validators.required],
      'modofiedFlowRate': ['', Validators.required],
      'modifiedCorrectionFactor': ['', Validators.required]
    });
  }

  //get form from object
  getAtmosphereForm(loss: AtmosphereLoss) {
    return this.formBuilder.group({
      'baselineAtmosphereGas': [loss.inputs.baseline.atmosphereGas, Validators.required],
      'baselineSpecificHeat': [loss.inputs.baseline.specificHeat, Validators.required],
      'baselineInitialTemp': [loss.inputs.baseline.initialTemperature, Validators.required],
      'baselineFinalTemp': [loss.inputs.baseline.finalTemperature, Validators.required],
      'baselineFlowRate': [loss.inputs.baseline.flowRate, Validators.required],
      'baselineCorrectionFactor': [loss.inputs.baseline.correctionFactor, Validators.required],
      'modifiedAtmosphereGas': [loss.inputs.modified.atmosphereGas, Validators.required],
      'modifiedSpecificHeat': [loss.inputs.modified.specificHeat, Validators.required],
      'modifiedInitialTemp': [loss.inputs.modified.initialTemperature, Validators.required],
      'modifiedFinalTemp': [loss.inputs.modified.finalTemperature, Validators.required],
      'modofiedFlowRate': [loss.inputs.modified.flowRate, Validators.required],
      'modifiedCorrectionFactor': [loss.inputs.modified.correctionFactor, Validators.required]
    });
  }

  getLossFromForm(form: any): AtmosphereLoss {
    let tmpLoss: AtmosphereLoss = {
      inputs: {
        baseline: {
          atmosphereGas: form.value.baselineAtmosphereGas,
          specificHeat: form.value.baselineSpecificHeat,
          initialTemperature: form.value.baselineInitialTemp,
          finalTemperature: form.value.baselineFinalTemp,
          flowRate: form.value.baselineFlowRate,
          correctionFactor: form.value.baselineCorrectionFactor
        },
        modified: {
          atmosphereGas: form.value.modifiedAtmosphereGas,
          specificHeat: form.value.modifiedSpecificHeat,
          initialTemperature: form.value.modifiedInitialTemp,
          finalTemperature: form.value.modifiedFinalTemp,
          flowRate: form.value.modifiedFlowRate,
          correctionFactor: form.value.modifiedCorrectionFactor
        }
      }
    }
    return tmpLoss;
  }
}
