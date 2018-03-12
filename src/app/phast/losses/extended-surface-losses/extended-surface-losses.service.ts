import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Losses } from '../../../shared/models/phast/phast';
import { ExtendedSurface } from '../../../shared/models/phast/losses/extendedSurface';

@Injectable()
export class ExtendedSurfaceLossesService {

  constructor(private formBuilder: FormBuilder) {
  }

  initForm(lossNum: number): FormGroup {
    return this.formBuilder.group({
      'surfaceArea': ['', Validators.required],
      'avgSurfaceTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'surfaceEmissivity': [0.9, Validators.required],
      'name': ['Loss #' + lossNum]
    })
  }

  getSurfaceLossForm(wallLoss: ExtendedSurface): FormGroup {
    return this.formBuilder.group({
      'surfaceArea': [wallLoss.surfaceArea, Validators.required],
      'avgSurfaceTemp': [wallLoss.surfaceTemperature, Validators.required],
      'ambientTemp': [wallLoss.ambientTemperature, Validators.required],
      'surfaceEmissivity': [wallLoss.surfaceEmissivity, Validators.required],
      'name': [wallLoss.name]
    })
  }
  //get WallLoss from form
  getSurfaceLossFromForm(wallLossForm: FormGroup): ExtendedSurface {
    let tmpWallLoss: ExtendedSurface = {
      surfaceArea: wallLossForm.controls.surfaceArea.value,
      ambientTemperature: wallLossForm.controls.ambientTemp.value,
      surfaceTemperature: wallLossForm.controls.avgSurfaceTemp.value,
      surfaceEmissivity: wallLossForm.controls.surfaceEmissivity.value,
      name: wallLossForm.controls.name.value
    }
    return tmpWallLoss;
  }
}

