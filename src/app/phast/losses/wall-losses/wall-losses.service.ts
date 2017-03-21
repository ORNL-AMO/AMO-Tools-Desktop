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
      'baselineSurfaceShape': ['', Validators.required],
      'baselineConditionFactor': [{ value: '', disabled: true }, Validators.required],
      'baselineSurfaceEmissivity': ['', Validators.required],
      'modifiedSurfaceArea': ['', Validators.required],
      'modifiedAvgSurfaceTemp': ['', Validators.required],
      'modifiedAmbientTemp': ['', Validators.required],
      'modifiedCorrectionFactor': ['', Validators.required],
      'modifiedWindVelocity': ['', Validators.required],
      'modifiedSurfaceShape': ['', Validators.required],
      'modifiedConditionFactor': [{ value: '', disabled: true }, Validators.required],
      'modifiedSurfaceEmissivity': ['', Validators.required],
    })
  }

  //get form from WallLoss
  getWallLossForm(wallLoss: WallLoss) {
    return this.formBuilder.group({
      'baselineSurfaceArea': wallLoss.inputs.baseline.surfaceArea,
      'baselineAvgSurfaceTemp': wallLoss.inputs.baseline.surfaceTemperature,
      'baselineAmbientTemp': wallLoss.inputs.baseline.ambientTemperature,
      'baselineCorrectionFactor': wallLoss.inputs.baseline.correctionFactor,
      'baselineWindVelocity': wallLoss.inputs.baseline.windVelocity,
      'baselineConditionFactorFactor': wallLoss.inputs.baseline.conditionFactor,
      'baselineSurfaceEmissivity': wallLoss.inputs.baseline.surfaceEmissivity,
      'baselineSurfaceShape': wallLoss.inputs.baseline.surfaceShape,
      'modifiedSurfaceArea': wallLoss.inputs.modified.surfaceArea,
      'modifiedAvgSurfaceTemp': wallLoss.inputs.modified.surfaceTemperature,
      'modifiedAmbientTemp': wallLoss.inputs.modified.ambientTemperature,
      'modifiedCorrectionFactor': wallLoss.inputs.modified.correctionFactor,
      'modifiedWindVelocity': wallLoss.inputs.modified.windVelocity,
      'modifiedConditionFactor': wallLoss.inputs.modified.conditionFactor,
      'modifiedSurfaceEmissivity': wallLoss.inputs.modified.surfaceEmissivity,
      'modifiedSurfaceShape': wallLoss.inputs.modified.surfaceShape,
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
          conditionFactor: wallLossForm.value.baselineSurfaceShapeFactor,
          correctionFactor: wallLossForm.value.baselineCorrectionFactor
        },
        modified: {
          surfaceArea: wallLossForm.value.modifiedSurfaceArea,
          ambientTemperature: wallLossForm.value.modifiedAmbientTemp,
          surfaceTemperature: wallLossForm.value.modifiedAvgSurfaceTemp,
          windVelocity: wallLossForm.value.modifiedWindVelocity,
          surfaceEmissivity: wallLossForm.value.modifiedSurfaceEmissivity,
          surfaceShape: wallLossForm.value.modifiedSurfaceShape,
          conditionFactor: wallLossForm.value.modifiedSurfaceShapeFactor,
          correctionFactor: wallLossForm.value.modifiedCorrectionFactor
        }
      }
    }
    return tmpWallLoss;
  }
}
