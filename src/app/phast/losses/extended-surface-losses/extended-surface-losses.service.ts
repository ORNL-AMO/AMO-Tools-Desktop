import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { ExtendedSurface } from '../../../shared/models/phast/losses/extendedSurface';

@Injectable()
export class ExtendedSurfaceLossesService {

  constructor(private formBuilder: UntypedFormBuilder) {
  }

  initForm(lossNum: number): UntypedFormGroup {
    return this.formBuilder.group({
      'surfaceArea': ['', Validators.required],
      'avgSurfaceTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'surfaceEmissivity': [0.9, Validators.required],
      'name': ['Loss #' + lossNum]
    });
  }

  getSurfaceLossForm(wallLoss: ExtendedSurface): UntypedFormGroup {
    return this.formBuilder.group({
      'surfaceArea': [wallLoss.surfaceArea, Validators.required],
      'avgSurfaceTemp': [wallLoss.surfaceTemperature, Validators.required],
      'ambientTemp': [wallLoss.ambientTemperature, Validators.required],
      'surfaceEmissivity': [wallLoss.surfaceEmissivity, Validators.required],
      'name': [wallLoss.name]
    });
  }
  //get WallLoss from form
  getSurfaceLossFromForm(wallLossForm: UntypedFormGroup): ExtendedSurface {
    let tmpWallLoss: ExtendedSurface = {
      surfaceArea: wallLossForm.controls.surfaceArea.value,
      ambientTemperature: wallLossForm.controls.ambientTemp.value,
      surfaceTemperature: wallLossForm.controls.avgSurfaceTemp.value,
      surfaceEmissivity: wallLossForm.controls.surfaceEmissivity.value,
      name: wallLossForm.controls.name.value
    };
    return tmpWallLoss;
  }

  checkWarnings(loss: ExtendedSurface): ExtendedSurfaceWarnings {
    return {
      surfaceAreaWarning: this.checkSurfaceArea(loss),
      temperatureWarning: this.checkAmbientTemp(loss),
      emissivityWarning: this.checkEmissivity(loss)
    };
  }
  checkAmbientTemp(loss: ExtendedSurface): string {
    if (loss.ambientTemperature > loss.surfaceTemperature) {
      return 'Ambient Temperature is greater than Surface Temperature';
    } else {
      return null;
    }
  }
  checkSurfaceArea(loss: ExtendedSurface): string {
    if (loss.surfaceArea < 0) {
      return 'Total Outside Surface Area must be equal or greater than 0 ';
    } else {
      return null;
    }
  }
  checkEmissivity(loss: ExtendedSurface): string {
    if (loss.surfaceEmissivity > 1) {
      return 'Surface emissivity must be less than 1';
    } else if (loss.surfaceEmissivity < 0) {
      return 'Surface emissivity must be greater than 0';
    } else {
      return null;
    }
  }
  checkWarningsExist(warnings: ExtendedSurfaceWarnings): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
  }
}


export interface ExtendedSurfaceWarnings {
  surfaceAreaWarning: string;
  temperatureWarning: string;
  emissivityWarning: string;
}
