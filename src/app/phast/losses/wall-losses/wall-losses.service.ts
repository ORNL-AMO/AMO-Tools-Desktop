import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { WallLoss } from '../../../shared/models/phast/losses/wallLoss';

@Injectable()
export class WallLossesService {
  constructor(private formBuilder: FormBuilder) { }

  //init empty wall loss form
  initForm(lossNum: number): FormGroup {
    return this.formBuilder.group({
      'surfaceArea': ['', Validators.required],
      'avgSurfaceTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'windVelocity': [0, Validators.required],
      'surfaceShape': ['Vertical Plates', Validators.required],
      'conditionFactor': [1.394, Validators.required],
      'surfaceEmissivity': [0.9, Validators.required],
      'name': ['Loss #'+lossNum]
    })
  }

  //get form from WallLoss
  getWallLossForm(wallLoss: WallLoss): FormGroup {
    return this.formBuilder.group({
      'surfaceArea': [wallLoss.surfaceArea, Validators.required],
      'avgSurfaceTemp': [wallLoss.surfaceTemperature, Validators.required],
      'ambientTemp': [wallLoss.ambientTemperature, Validators.required],
      'correctionFactor': [wallLoss.correctionFactor, Validators.required],
      'windVelocity': [wallLoss.windVelocity, Validators.required],
      'conditionFactor': [wallLoss.conditionFactor, Validators.required],
      'surfaceEmissivity': [wallLoss.surfaceEmissivity, Validators.required],
      'surfaceShape': [wallLoss.surfaceShape],
      'name': [wallLoss.name]
    })
  }
  //get WallLoss from form
  getWallLossFromForm(wallLossForm: FormGroup): WallLoss {
    let tmpWallLoss: WallLoss = {
      surfaceArea: wallLossForm.controls.surfaceArea.value,
      ambientTemperature: wallLossForm.controls.ambientTemp.value,
      surfaceTemperature: wallLossForm.controls.avgSurfaceTemp.value,
      windVelocity: wallLossForm.controls.windVelocity.value,
      surfaceEmissivity: wallLossForm.controls.surfaceEmissivity.value,
      surfaceShape: wallLossForm.controls.surfaceShape.value,
      conditionFactor: wallLossForm.controls.conditionFactor.value,
      correctionFactor: wallLossForm.controls.correctionFactor.value,
      name: wallLossForm.controls.name.value
    }
    return tmpWallLoss;
  }
}
