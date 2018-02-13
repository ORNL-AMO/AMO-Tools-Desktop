import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { ExtendedSurface } from '../../../shared/models/phast/losses/extendedSurface';
import { Losses } from '../../../shared/models/phast/phast';
import { ExtendedSurfaceLossesService } from './extended-surface-losses.service';
import { ExtendedSurfaceCompareService } from './extended-surface-compare.service';
import { WallLoss } from '../../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms/src/model';
@Component({
  selector: 'app-extended-surface-losses',
  templateUrl: './extended-surface-losses.component.html',
  styleUrls: ['./extended-surface-losses.component.css']
})
export class ExtendedSurfaceLossesComponent implements OnInit {
  @Input()
  losses: Losses;
  @Input()
  saveClicked: boolean;
  @Input()
  addLossToggle: boolean;
  @Output('savedLoss')
  savedLoss = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('fieldChange')
  fieldChange = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;
  @Input()
  settings: Settings;
  @Input()
  isLossesSetup: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  modExists: boolean;


  showError: boolean = false;
  _surfaceLosses: Array<ExtSurfaceObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  constructor(private phastService: PhastService, private extendedSurfaceLossesService: ExtendedSurfaceLossesService, private extendedSurfaceCompareService: ExtendedSurfaceCompareService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.saveClicked) {
        this.saveLosses();
      }
      if (changes.addLossToggle) {
        this.addLoss();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  ngOnDestroy() {
    if (this.isBaseline) {
      //  this.extendedSurfaceLossesService.addLossBaselineMonitor.next(false);
      this.extendedSurfaceCompareService.baselineSurface = null;
    } else {
      // this.extendedSurfaceLossesService.addLossModificationMonitor.next(false);
      this.extendedSurfaceCompareService.modifiedSurface = null;
    }
    this.extendedSurfaceLossesService.deleteLossIndex.next(null);
  }

  ngOnInit() {
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }

    if (!this._surfaceLosses) {
      this._surfaceLosses = new Array();
    }
    if (this.losses.extendedSurfaces) {
      this.setCompareVals();
      this.extendedSurfaceCompareService.initCompareObjects();
      let lossIndex = 1;
      this.losses.extendedSurfaces.forEach(loss => {
        let tmpLoss = {
          form: this.extendedSurfaceLossesService.getSurfaceLossForm(loss),
          heatLoss: loss.heatLoss || 0.0,
          collapse: false
        };
        if (!tmpLoss.form.controls.name.value) {
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          })
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._surfaceLosses.push(tmpLoss);
      })
    }
    this.extendedSurfaceLossesService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.extendedSurfaces) {
          this._surfaceLosses.splice(lossIndex, 1);
          if (this.extendedSurfaceCompareService.differentArray && !this.isBaseline) {
            this.extendedSurfaceCompareService.differentArray.splice(lossIndex, 1);
          }
          this.saveLosses();
        }
      }
    })
    // if (this.isBaseline) {
    //   this.extendedSurfaceLossesService.addLossBaselineMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._surfaceLosses.push({
    //         form: this.extendedSurfaceLossesService.initForm(),
    //         name: 'Loss #' + (this._surfaceLosses.length + 1),
    //         heatLoss: 0.0,
    //         collapse: false
    //       })
    //     }
    //   })
    // } else {
    //   this.extendedSurfaceLossesService.addLossModificationMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._surfaceLosses.push({
    //         form: this.extendedSurfaceLossesService.initForm(),
    //         name: 'Loss #' + (this._surfaceLosses.length + 1),
    //         heatLoss: 0.0,
    //         collapse: false
    //       })
    //     }
    //   })
    // }
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
      this.disableForms();
    }
  }

  disableForms() {
    this._surfaceLosses.forEach(loss => {
      loss.form.disable();
    })
  }
  addLoss() {
    // if (this.isLossesSetup) {
    //   this.extendedSurfaceLossesService.addLoss(this.isBaseline);
    // }
    if (this.extendedSurfaceCompareService.differentArray) {
      this.extendedSurfaceCompareService.addObject(this.extendedSurfaceCompareService.differentArray.length - 1);
    }
    this._surfaceLosses.push({
      form: this.extendedSurfaceLossesService.initForm(this._surfaceLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this.extendedSurfaceLossesService.setDelete(lossIndex);
  }

  calculate(loss: any) {
    if (loss.form.status == 'VALID') {
      //EXTENDED SURFACE LOSS = WALL LOSS WITH ASSUMPTIONS:
      //windVelocity = 5
      //correctionFactor = 1
      //conditionFactor = 1
      let tmpLoss: ExtendedSurface = this.extendedSurfaceLossesService.getSurfaceLossFromForm(loss.form);
      let tmpWallLoss: WallLoss = {
        surfaceArea: tmpLoss.surfaceArea,
        ambientTemperature: tmpLoss.ambientTemperature,
        surfaceTemperature: tmpLoss.surfaceTemperature,
        windVelocity: 5,
        surfaceEmissivity: tmpLoss.surfaceEmissivity,
        conditionFactor: 1,
        correctionFactor: 1,
      }
      loss.heatLoss = this.phastService.wallLosses(tmpWallLoss, this.settings);
    } else {
      loss.heatLoss = null;
    }

  }

  collapseLoss(loss: any) {
    loss.collapse = !loss.collapse;
  }

  saveLosses() {
    let tmpSurfaceLosses = new Array<ExtendedSurface>();
    this._surfaceLosses.forEach(loss => {
      let lossIndex = 1;
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      lossIndex++;
      let tmpSurfaceLoss = this.extendedSurfaceLossesService.getSurfaceLossFromForm(loss.form);
      tmpSurfaceLoss.heatLoss = loss.heatLoss;
      tmpSurfaceLosses.push(tmpSurfaceLoss);
    })
    this.losses.extendedSurfaces = tmpSurfaceLosses;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }
  setError(bool: boolean){
    this.showError = bool;
  }
  setCompareVals() {
    if (this.isBaseline) {
      this.extendedSurfaceCompareService.baselineSurface = this.losses.extendedSurfaces;
    } else {
      this.extendedSurfaceCompareService.modifiedSurface = this.losses.extendedSurfaces;
    }
    if (this.extendedSurfaceCompareService.differentArray && !this.isBaseline) {
      if (this.extendedSurfaceCompareService.differentArray.length != 0) {
        this.extendedSurfaceCompareService.checkExtendedSurfaceLosses();
      }
    }
  }
}

export interface ExtSurfaceObj {
  form: FormGroup,
  heatLoss: number,
  collapse: boolean
}