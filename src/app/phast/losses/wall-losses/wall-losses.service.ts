import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Losses } from '../../../shared/models/phast/phast';
import { WallLoss } from '../../../shared/models/phast/losses/wallLoss';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class WallLossesService {
  //components subscribe to BehaviorSubject variables for communication between siblings components
  deleteLossIndex: BehaviorSubject<number>;
  addLossBaselineMonitor: BehaviorSubject<any>;
  addLossModifiedMonitor: BehaviorSubject<any>;

  constructor(private formBuilder: FormBuilder) {
    //init behavior subjects to null;
    this.deleteLossIndex = new BehaviorSubject<number>(null);
    this.addLossBaselineMonitor = new BehaviorSubject<any>(null);
    this.addLossModifiedMonitor = new BehaviorSubject<any>(null);
  }

  setDelete(num: number) {
    this.deleteLossIndex.next(num);
  }

  addLoss(isBaseline: boolean) {
    //if baseline adds loss, signal modified
    if (isBaseline) {
      this.addLossModifiedMonitor.next(true);
    }else{
       //signal baseline
       this.addLossBaselineMonitor.next(true);
    }
  }

  //init empty wall loss form
  initForm() {
    return this.formBuilder.group({
      'surfaceArea': ['', Validators.required],
      'avgSurfaceTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'windVelocity': [0, Validators.required],
      'surfaceShape': ['Vertical Plates', Validators.required],
      'conditionFactor': [1.394, Validators.required],
      'surfaceEmissivity': [0.9, Validators.required]
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
      'surfaceShape': [wallLoss.surfaceShape, Validators.required]
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
