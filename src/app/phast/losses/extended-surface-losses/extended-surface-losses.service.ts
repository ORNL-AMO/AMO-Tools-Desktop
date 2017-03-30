import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Losses } from '../../../shared/models/phast';
import { ExtendedSurface } from '../../../shared/models/losses/extendedSurface';

@Injectable()
export class ExtendedSurfaceLossesService {

  constructor(private formBuilder: FormBuilder){}

  initForm() {
    return this.formBuilder.group({
      'surfaceArea': ['', Validators.required],
      'avgSurfaceTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'surfaceEmissivity': ['', Validators.required],
    })
  }

  getSurfaceLossForm(wallLoss: ExtendedSurface) {
    return this.formBuilder.group({
      'surfaceArea': [wallLoss.surfaceArea, Validators.required],
      'avgSurfaceTemp': [wallLoss.surfaceTemperature, Validators.required],
      'ambientTemp': [wallLoss.ambientTemperature, Validators.required],
      'surfaceEmissivity': [wallLoss.surfaceEmissivity, Validators.required],
    })
  }
  //get WallLoss from form
  getSurfaceLossFromForm(wallLossForm: any): ExtendedSurface {
    let tmpWallLoss: ExtendedSurface = {
      surfaceArea: wallLossForm.value.surfaceArea,
      ambientTemperature: wallLossForm.value.ambientTemp,
      surfaceTemperature: wallLossForm.value.avgSurfaceTemp,
      surfaceEmissivity: wallLossForm.value.surfaceEmissivity,
    }
    return tmpWallLoss;
  }
}

