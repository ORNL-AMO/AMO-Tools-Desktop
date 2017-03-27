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
      'surfaceArea': ['', Validators.required],
      'avgSurfaceTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'correctionFactor': ['', Validators.required],
      'windVelocity': ['', Validators.required],
      'surfaceShape': ['Vertical Plates', Validators.required],
      'conditionFactor': [1.394, Validators.required],
      'surfaceEmissivity': ['', Validators.required],

    })
  }

  //get form from WallLoss
  getWallLossForm(wallLoss: WallLoss) {
    return this.formBuilder.group({
      'surfaceArea': [wallLoss.surfaceArea, Validators.required],
      'avgSurfaceTemp': [wallLoss.surfaceTemperature, Validators.required],
      'ambientTemp': [wallLoss.ambientTemperature, Validators.required],
      'correctionFactor': [wallLoss.correctionFactor, Validators.required],
      'windVelocity': [wallLoss.windVelocity, Validators.required],
      'conditionFactor': [wallLoss.conditionFactor, Validators.required],
      'surfaceEmissivity': [wallLoss.surfaceEmissivity, Validators.required],
      'surfaceShape': [wallLoss.surfaceShape, Validators.required],
    })
  }
  //get WallLoss from form
  getWallLossFromForm(wallLossForm: any): WallLoss {
    let tmpWallLoss: WallLoss = {
      surfaceArea: wallLossForm.value.surfaceArea,
      ambientTemperature: wallLossForm.value.ambientTemp,
      surfaceTemperature: wallLossForm.value.avgSurfaceTemp,
      windVelocity: wallLossForm.value.windVelocity,
      surfaceEmissivity: wallLossForm.value.surfaceEmissivity,
      surfaceShape: wallLossForm.value.surfaceShape,
      conditionFactor: wallLossForm.value.conditionFactor,
      correctionFactor: wallLossForm.value.correctionFactor
    }
    return tmpWallLoss;
  }
}
