import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { OpeningLoss, CircularOpeningLoss, QuadOpeningLoss } from '../../../shared/models/phast/losses/openingLoss';

@Injectable()
export class OpeningLossesService {

  constructor(private formBuilder: FormBuilder) {
  }

  initForm(lossNum: number): FormGroup {
    return this.formBuilder.group({
      'numberOfOpenings': [1, Validators.required],
      'openingType': ['Round', Validators.required],
      'wallThickness': ['', Validators.required],
      'lengthOfOpening': ['', Validators.required],
      'heightOfOpening': ['', Validators.required],
      'viewFactor': ['', Validators.required],
      'insideTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'percentTimeOpen': ['', Validators.required],
      'emissivity': [0.9, Validators.required],
      'name': ['Loss #' + lossNum]
    })
  }

  getFormFromLoss(loss: OpeningLoss): FormGroup {
    return this.formBuilder.group({
      'numberOfOpenings': [loss.numberOfOpenings, Validators.required],
      'openingType': [loss.openingType, Validators.required],
      'wallThickness': [loss.thickness, Validators.required],
      'lengthOfOpening': [loss.lengthOfOpening, Validators.required],
      'heightOfOpening': [loss.heightOfOpening],
      'viewFactor': [loss.viewFactor, Validators.required],
      'insideTemp': [loss.insideTemperature, Validators.required],
      'ambientTemp': [loss.ambientTemperature, Validators.required],
      'percentTimeOpen': [loss.percentTimeOpen, Validators.required],
      'emissivity': [loss.emissivity, Validators.required],
      'name': [loss.name]
    })
  }

  getLossFromForm(form: FormGroup): OpeningLoss {
    return {
      numberOfOpenings: form.controls.numberOfOpenings.value,
      emissivity: form.controls.emissivity.value,
      thickness: form.controls.wallThickness.value,
      ambientTemperature: form.controls.ambientTemp.value,
      insideTemperature: form.controls.insideTemp.value,
      percentTimeOpen: form.controls.percentTimeOpen.value,
      viewFactor: form.controls.viewFactor.value,
      openingType: form.controls.openingType.value,
      lengthOfOpening: form.controls.lengthOfOpening.value,
      heightOfOpening: form.controls.heightOfOpening.value,
      name: form.controls.name.value
    };
  }

  getViewFactorInput(input: FormGroup) {
    if (input.controls.openingType.value === 'Round') {
      return {
        openingShape: 0,
        thickness: input.controls.wallThickness.value,
        diameter: input.controls.lengthOfOpening.value
      };
    }
    return {
      openingShape: 1,
      thickness: input.controls.wallThickness.value,
      length: input.controls.lengthOfOpening.value,
      width: input.controls.heightOfOpening.value
    };
  }

  getQuadLossFromForm(form: FormGroup): QuadOpeningLoss {
    const ratio = Math.min(form.controls.lengthOfOpening.value, form.controls.heightOfOpening.value) / form.controls.wallThickness.value;
    return {
      emissivity: form.controls.emissivity.value,
      length: form.controls.lengthOfOpening.value,
      width: form.controls.heightOfOpening.value,
      thickness: form.controls.wallThickness.value,
      ratio: ratio,
      ambientTemperature: form.controls.ambientTemp.value,
      insideTemperature: form.controls.insideTemp.value,
      percentTimeOpen: form.controls.percentTimeOpen.value,
      viewFactor: form.controls.viewFactor.value
    };
  }

  getCircularLossFromForm(form: FormGroup): CircularOpeningLoss {
    const ratio = form.controls.lengthOfOpening.value / form.controls.wallThickness.value;
    return {
      emissivity: form.controls.emissivity.value,
      diameter: form.controls.lengthOfOpening.value,
      thickness: form.controls.wallThickness.value,
      ratio: ratio,
      ambientTemperature: form.controls.ambientTemp.value,
      insideTemperature: form.controls.insideTemp.value,
      percentTimeOpen: form.controls.percentTimeOpen.value,
      viewFactor: form.controls.viewFactor.value
    };
  }

  checkWarnings(loss: OpeningLoss): OpeningLossWarnings {
    return {
      temperatureWarning: this.checkTemperature(loss),
      emissivityWarning: this.checkEmissivity(loss),
      timeOpenWarning: this.checkTimeOpen(loss),
      numOpeningsWarning: this.checkNumOpenings(loss),
      thicknessWarning: this.checkWallThickness(loss),
      lengthWarning: this.checkLength(loss),
      heightWarning: this.checkHeight(loss),
      viewFactorWarning: this.checkViewFactor(loss)
    }
  }

  checkLength(loss: OpeningLoss): string {
    if (loss.lengthOfOpening <= 0 && loss.openingType == 'Round') {
      return 'Opening Diameter must be greater than 0';
    } else if (loss.lengthOfOpening <= 0 && loss.openingType == 'Rectangular (or Square)') {
      return 'Opening Length must be greater than 0';
    } else {
      return null;
    }
  }

  checkHeight(loss: OpeningLoss): string {
    if (loss.heightOfOpening < 0) {
      return 'Opening Height must be greater than 0';
    } else {
      return null;
    }
  }

  checkWallThickness(loss: OpeningLoss): string {
    if (loss.thickness < 0) {
      return "Furnace Wall Thickness must be greater than or equal to 0";
    } else {
      return null;
    }
  }

  checkNumOpenings(loss: OpeningLoss): string {
    if (loss.numberOfOpenings < 0) {
      return "Number of Openings must be positive";
    } else {
      return null;
    }
  }

  checkViewFactor(loss: OpeningLoss): string {
    if (loss.viewFactor < 0) {
      return "View Factor must be positive";
    } else {
      return null;
    }
  }

  checkTemperature(loss: OpeningLoss): string {
    if (loss.ambientTemperature > loss.insideTemperature) {
      return 'Ambient Temperature cannot be greater than Average Zone Temperature'
    } else {
      return null;
    }
  }
  checkEmissivity(loss: OpeningLoss): string {
    if (loss.emissivity > 1) {
      return 'Surface emissivity must be less than 1';
    } else if (loss.emissivity < 0) {
      return 'Surface emissivity must be positive';
    } else {
      return null;
    }
  }

  checkTimeOpen(loss: OpeningLoss): string {
    if (loss.percentTimeOpen > 100) {
      return 'Time open must be less than 100%';
    } else if (loss.percentTimeOpen < 0) {
      return 'Time must be greater positive';
    } else {
      return null;
    }
  }

  checkWarningsExist(warnings: OpeningLossWarnings): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
  }
}


export interface OpeningLossWarnings {
  temperatureWarning: string;
  emissivityWarning: string;
  timeOpenWarning: string;
  numOpeningsWarning: string;
  thicknessWarning: string;
  lengthWarning: string;
  heightWarning: string;
  viewFactorWarning: string;
}