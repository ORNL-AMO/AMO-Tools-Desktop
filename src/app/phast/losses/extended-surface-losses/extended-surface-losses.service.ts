import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Losses } from '../../../shared/models/phast/phast';
import { ExtendedSurface } from '../../../shared/models/phast/losses/extendedSurface';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ExtendedSurfaceLossesService {
  deleteLossIndex: BehaviorSubject<number>;
//  addLossBaselineMonitor: BehaviorSubject<any>;
//  addLossModificationMonitor: BehaviorSubject<any>;
  constructor(private formBuilder: FormBuilder) {
    this.deleteLossIndex = new BehaviorSubject<number>(null);
//    this.addLossBaselineMonitor = new BehaviorSubject<any>(null);
//    this.addLossModificationMonitor = new BehaviorSubject<any>(null);
  }

  setDelete(num: number) {
    this.deleteLossIndex.next(num);
  }
  // addLoss(bool: boolean) {
  //   if (bool) {
  //     this.addLossModificationMonitor.next(true);
  //   } else {
  //     this.addLossBaselineMonitor.next(true);
  //   }
  // }
  initForm(lossNum: number): FormGroup {
    return this.formBuilder.group({
      'surfaceArea': ['', Validators.required],
      'avgSurfaceTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'surfaceEmissivity': [0.9, Validators.required],
      'name': ['Loss #'+lossNum]
    })
  }

  getSurfaceLossForm(wallLoss: ExtendedSurface): FormGroup {
    return this.formBuilder.group({
      'surfaceArea': [wallLoss.surfaceArea, Validators.required],
      'avgSurfaceTemp': [wallLoss.surfaceTemperature, Validators.required],
      'ambientTemp': [wallLoss.ambientTemperature, Validators.required],
      'surfaceEmissivity': [wallLoss.surfaceEmissivity, Validators.required],
      'name':[wallLoss.name]
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

