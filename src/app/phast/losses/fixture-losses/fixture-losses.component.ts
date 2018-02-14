import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { FixtureLossesService } from './fixture-losses.service';
import { Losses } from '../../../shared/models/phast/phast';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
import { FixtureLossesCompareService } from "./fixture-losses-compare.service";
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms/src/model';

@Component({
  selector: 'app-fixture-losses',
  templateUrl: './fixture-losses.component.html',
  styleUrls: ['./fixture-losses.component.css']
})
export class FixtureLossesComponent implements OnInit {
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
  resultsUnit: string;
  _fixtureLosses: Array<FixtureLossObj>;
  firstChange: boolean = true;
  lossesLocked: boolean = false;
  constructor(private phastService: PhastService, private fixtureLossesService: FixtureLossesService, private fixtureLossesCompareService: FixtureLossesCompareService) { }
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
    if (!this._fixtureLosses) {
      this._fixtureLosses = new Array();
    }
    if (this.losses.fixtureLosses) {
      this.setCompareVals();
      this.fixtureLossesCompareService.initCompareObjects();
      let lossIndex = 1;
      this.losses.fixtureLosses.forEach(loss => {
        let tmpLoss = {
          form: this.fixtureLossesService.getFormFromLoss(loss),
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
        this._fixtureLosses.push(tmpLoss);
      })
    }

    this.fixtureLossesService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.fixtureLosses) {
          this._fixtureLosses.splice(lossIndex, 1);
          if (this.fixtureLossesCompareService.differentArray && !this.isBaseline) {
            this.fixtureLossesCompareService.differentArray.splice(lossIndex, 1);
          }
          this.saveLosses();
        }
      }
    })
    // if (this.isBaseline) {
    //   this.fixtureLossesService.addLossBaselineMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._fixtureLosses.push({
    //         form: this.fixtureLossesService.initForm(),
    //         name: 'Loss #' + (this._fixtureLosses.length + 1),
    //         heatLoss: 0.0,
    //         collapse: false
    //       })
    //     }
    //   })
    // } else {
    //   this.fixtureLossesService.addLossModificationMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._fixtureLosses.push({
    //         form: this.fixtureLossesService.initForm(),
    //         name: 'Loss #' + (this._fixtureLosses.length + 1),
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
      // this.fixtureLossesService.addLossBaselineMonitor.next(false);
      this.fixtureLossesCompareService.baselineFixtureLosses = null;
    } else {
      // this.fixtureLossesService.addLossModificationMonitor.next(false);
      this.fixtureLossesCompareService.modifiedFixtureLosses = null;
    }
    this.fixtureLossesService.deleteLossIndex.next(null);
  }

  disableForms() {
    this._fixtureLosses.forEach(loss => {
      loss.form.disable();
    })
  }
  addLoss() {
    // if (this.isLossesSetup) {
    //   this.fixtureLossesService.addLoss(this.isBaseline);
    // }
    if (this.fixtureLossesCompareService.differentArray) {
      this.fixtureLossesCompareService.addObject(this.fixtureLossesCompareService.differentArray.length - 1);
    }
    this._fixtureLosses.push({
      form: this.fixtureLossesService.initForm(this._fixtureLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this.fixtureLossesService.setDelete(lossIndex);
  }

  calculate(loss: FixtureLossObj) {
    if (loss.form.status == 'VALID') {
      let tmpLoss: FixtureLoss = this.fixtureLossesService.getLossFromForm(loss.form);
      loss.heatLoss = this.phastService.fixtureLosses(tmpLoss, this.settings);
    } else {
      loss.heatLoss = null;
    }
  }

  collapseLoss(loss: FixtureLossObj) {
    loss.collapse = !loss.collapse;
  }

  saveLosses() {
    let tmpFixtureLosses = new Array<FixtureLoss>();
    let lossIndex = 1;
    this._fixtureLosses.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      lossIndex++;
      let tmpFixtureLoss = this.fixtureLossesService.getLossFromForm(loss.form);
      tmpFixtureLoss.heatLoss = loss.heatLoss;
      tmpFixtureLosses.push(tmpFixtureLoss);
    });
    this.losses.fixtureLosses = tmpFixtureLosses;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }
  setError(bool: boolean) {
    this.showError = bool;
  }
  setCompareVals() {
    if (this.isBaseline) {
      this.fixtureLossesCompareService.baselineFixtureLosses = this.losses.fixtureLosses;
    } else {
      this.fixtureLossesCompareService.modifiedFixtureLosses = this.losses.fixtureLosses;
    }
    if (this.fixtureLossesCompareService.differentArray && !this.isBaseline) {
      if (this.fixtureLossesCompareService.differentArray.length != 0) {
        this.fixtureLossesCompareService.checkFixtureLosses();
      }
    }
  }

}

export interface FixtureLossObj {
  form: FormGroup,
  heatLoss: number,
  collapse: boolean
}