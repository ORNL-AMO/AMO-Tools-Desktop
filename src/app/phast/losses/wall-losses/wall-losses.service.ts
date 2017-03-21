import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Losses } from '../../../shared/models/phast';
import { WallLoss } from '../../../shared/models/losses/wallLoss';


@Injectable()
export class WallLossesService {

  constructor(private formBuilder: FormBuilder) { }

  //init empty wall loss form
  initForm() {
    return this.formBuilder.group({
      'baselineSurfaceArea': ['', Validators.required],
      'baselineAvgSurfaceTemp': ['', Validators.required],
      'baselineAmbientTemp': ['', Validators.required],
      'baselineCorrectionFactor': ['', Validators.required],
      'baselineWindVelocity': ['', Validators.required],
      'baselineSurfaceShape': ['Vertical Plates', Validators.required],
      'baselineConditionFactor': [{ value: 1.394, disabled: "true" }, Validators.required],
      'baselineSurfaceEmissivity': ['', Validators.required],
      'modifiedSurfaceArea': ['', Validators.required],
      'modifiedAvgSurfaceTemp': ['', Validators.required],
      'modifiedAmbientTemp': ['', Validators.required],
      'modifiedCorrectionFactor': ['', Validators.required],
      'modifiedWindVelocity': ['', Validators.required],
      'modifiedSurfaceShape': ['Vertical Plates', Validators.required],
      'modifiedConditionFactor': [{ value: 1.394, disabled: "true" }, Validators.required],
      'modifiedSurfaceEmissivity': ['', Validators.required],
    })
  }

  //get form from WallLoss
  getWallLossForm(wallLoss: WallLoss) {
    debugger
    return this.formBuilder.group({
      'baselineSurfaceArea': [wallLoss.inputs.baseline.surfaceArea, Validators.required],
      'baselineAvgSurfaceTemp': [wallLoss.inputs.baseline.surfaceTemperature, Validators.required],
      'baselineAmbientTemp': [wallLoss.inputs.baseline.ambientTemperature, Validators.required],
      'baselineCorrectionFactor': [wallLoss.inputs.baseline.correctionFactor, Validators.required],
      'baselineWindVelocity': [wallLoss.inputs.baseline.windVelocity, Validators.required],
      'baselineConditionFactor': [{value: wallLoss.inputs.baseline.conditionFactor, disabled: "true"}, Validators.required],
      'baselineSurfaceEmissivity': [wallLoss.inputs.baseline.surfaceEmissivity, Validators.required],
      'baselineSurfaceShape': [wallLoss.inputs.baseline.surfaceShape, Validators.required],
      'modifiedSurfaceArea': [wallLoss.inputs.modified.surfaceArea, Validators.required],
      'modifiedAvgSurfaceTemp': [wallLoss.inputs.modified.surfaceTemperature, Validators.required],
      'modifiedAmbientTemp': [wallLoss.inputs.modified.ambientTemperature, Validators.required],
      'modifiedCorrectionFactor': [wallLoss.inputs.modified.correctionFactor, Validators.required],
      'modifiedWindVelocity': [wallLoss.inputs.modified.windVelocity, Validators.required],
      'modifiedConditionFactor': [{value: wallLoss.inputs.modified.conditionFactor, disabled: "true"}, Validators.required],
      'modifiedSurfaceEmissivity': [wallLoss.inputs.modified.surfaceEmissivity, Validators.required],
      'modifiedSurfaceShape': [wallLoss.inputs.modified.surfaceShape, Validators.required],
    })
  }
  //get WallLoss from form
  getWallLossFromForm(wallLossForm: any): WallLoss {
    let tmpWallLoss: WallLoss = {
      inputs: {
        baseline: {
          surfaceArea: wallLossForm.value.baselineSurfaceArea,
          ambientTemperature: wallLossForm.value.baselineAmbientTemp,
          surfaceTemperature: wallLossForm.value.baselineAvgSurfaceTemp,
          windVelocity: wallLossForm.value.baselineWindVelocity,
          surfaceEmissivity: wallLossForm.value.baselineSurfaceEmissivity,
          surfaceShape: wallLossForm.value.baselineSurfaceShape,
          conditionFactor: wallLossForm.value.baselineConditionFactor,
          correctionFactor: wallLossForm.value.baselineCorrectionFactor
        },
        modified: {
          surfaceArea: wallLossForm.value.modifiedSurfaceArea,
          ambientTemperature: wallLossForm.value.modifiedAmbientTemp,
          surfaceTemperature: wallLossForm.value.modifiedAvgSurfaceTemp,
          windVelocity: wallLossForm.value.modifiedWindVelocity,
          surfaceEmissivity: wallLossForm.value.modifiedSurfaceEmissivity,
          surfaceShape: wallLossForm.value.modifiedSurfaceShape,
          conditionFactor: wallLossForm.value.modifiedConditionFactor,
          correctionFactor: wallLossForm.value.modifiedCorrectionFactor
        }
      }
    }
    return tmpWallLoss;
  }
}
