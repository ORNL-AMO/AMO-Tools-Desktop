import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { OpeningLossesService } from './opening-losses.service';
import { Losses } from '../../../shared/models/phast/phast';
import { OpeningLoss, QuadOpeningLoss, CircularOpeningLoss } from '../../../shared/models/phast/losses/openingLoss';
import { OpeningLossesCompareService } from './opening-losses-compare.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms/src/model';

@Component({
  selector: 'app-opening-losses',
  templateUrl: './opening-losses.component.html',
  styleUrls: ['./opening-losses.component.css']
})
export class OpeningLossesComponent implements OnInit {
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
  _openingLosses: Array<OpeningLossObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  constructor(private phastService: PhastService, private openingLossesService: OpeningLossesService, private openingLossesCompareService: OpeningLossesCompareService) { }


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
  ngOnInit() {
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }

    if (!this._openingLosses) {
      this._openingLosses = new Array();
    }
    if (this.losses.openingLosses) {
      this.setCompareVals();
      this.openingLossesCompareService.initCompareObjects();
      let lossIndex = 1;
      this.losses.openingLosses.forEach(loss => {
        let tmpLoss = {
          form: this.openingLossesService.getFormFromLoss(loss),
          totalOpeningLosses: loss.heatLoss || 0.0,
          collapse: false
        };
        if (!tmpLoss.form.controls.name.value) {
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          })
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._openingLosses.push(tmpLoss);
      })
    }

    this.openingLossesService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.openingLosses) {
          this._openingLosses.splice(lossIndex, 1);
          if (this.openingLossesCompareService.differentArray && !this.isBaseline) {
            this.openingLossesCompareService.differentArray.splice(lossIndex, 1);
          }
        }
      }
    })
    // if (this.isBaseline) {
    //   this.openingLossesService.addLossBaselineMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._openingLosses.push({
    //         form: this.openingLossesService.initForm(),
    //         name: 'Loss #' + (this._openingLosses.length + 1),
    //         heatLoss: 0.0,
    //         collapse: false
    //       })
    //     }
    //   })
    // } else {
    //   this.openingLossesService.addLossModificationMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._openingLosses.push({
    //         form: this.openingLossesService.initForm(),
    //         name: 'Loss #' + (this._openingLosses.length + 1),
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

  ngOnDestroy() {
    if (this.isBaseline) {
      //    this.openingLossesService.addLossBaselineMonitor.next(false);
      this.openingLossesCompareService.baselineOpeningLosses = null;
    } else {
      this.openingLossesCompareService.modifiedOpeningLosses = null;
      //      this.openingLossesService.addLossModificationMonitor.next(false);
    };
    this.openingLossesService.deleteLossIndex.next(null);
  }

  addLoss() {
    // if (this.isLossesSetup) {
    //   this.openingLossesService.addLoss(this.isBaseline);
    // }
    if (this.openingLossesCompareService.differentArray) {
      this.openingLossesCompareService.addObject(this.openingLossesCompareService.differentArray.length - 1);
    }
    this._openingLosses.push({
      form: this.openingLossesService.initForm(this._openingLosses.length + 1),
      totalOpeningLosses: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  collapseLoss(loss: OpeningLossObj) {
    loss.collapse = !loss.collapse;
  }

  disableForms() {
    this._openingLosses.forEach(loss => {
      loss.form.disable();
    })
  }
  removeLoss(lossIndex: number) {
    this.openingLossesService.setDelete(lossIndex);
  }

  calculate(loss: OpeningLossObj) {
    if (loss.form.status == 'VALID') {
      if (loss.form.controls.openingType.value == 'Rectangular (Square)' && loss.form.controls.heightOfOpening.value != '') {
        let tmpLoss: QuadOpeningLoss = this.openingLossesService.getQuadLossFromForm(loss.form);
        let lossAmount = this.phastService.openingLossesQuad(tmpLoss, this.settings);
        loss.totalOpeningLosses = loss.form.controls.numberOfOpenings.value * lossAmount;
      } else if (loss.form.controls.openingType.value == 'Round') {
        let tmpLoss: CircularOpeningLoss = this.openingLossesService.getCircularLossFromForm(loss.form);
        let lossAmount = this.phastService.openingLossesCircular(tmpLoss, this.settings);
        loss.totalOpeningLosses = loss.form.controls.numberOfOpenings.value * lossAmount;
      } else {
        loss.totalOpeningLosses = null;
      }
    } else {
      loss.totalOpeningLosses = null;
    }
  }

  saveLosses() {
    let tmpOpeningLosses = new Array<OpeningLoss>();
    let lossIndex = 1;
    this._openingLosses.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      lossIndex++;
      let tmpOpeningLoss = this.openingLossesService.getLossFromForm(loss.form);
      tmpOpeningLoss.heatLoss = loss.totalOpeningLosses;
      tmpOpeningLosses.push(tmpOpeningLoss);
    })
    this.losses.openingLosses = tmpOpeningLosses;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }
  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.openingLossesCompareService.baselineOpeningLosses = this.losses.openingLosses;
    } else {
      this.openingLossesCompareService.modifiedOpeningLosses = this.losses.openingLosses;
    }
    if (this.openingLossesCompareService.differentArray) {
      if (this.openingLossesCompareService.differentArray.length != 0 && !this.isBaseline) {
        this.openingLossesCompareService.checkOpeningLosses();
      }
    }
  }

  setError(bool: boolean) {
    this.showError = bool;
  }
}

export interface OpeningLossObj {
  form: FormGroup,
  totalOpeningLosses: number,
  collapse: boolean
}