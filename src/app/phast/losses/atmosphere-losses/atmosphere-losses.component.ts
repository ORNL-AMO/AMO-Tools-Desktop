import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { AtmosphereLossesService } from './atmosphere-losses.service';
import { Losses } from '../../../shared/models/phast/phast';
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
import { AtmosphereLossesCompareService } from './atmosphere-losses-compare.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-atmosphere-losses',
  templateUrl: './atmosphere-losses.component.html',
  styleUrls: ['./atmosphere-losses.component.css']
})
export class AtmosphereLossesComponent implements OnInit {
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

  _atmosphereLosses: Array<AtmoLossObj>;
  firstChange: boolean = true;
  inputError: boolean = false;
  resultsUnit: string;
  lossesLocked: boolean = false;
  constructor(private atmosphereLossesService: AtmosphereLossesService, private phastService: PhastService, private atmosphereLossesCompareService: AtmosphereLossesCompareService) { }

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

    if (!this._atmosphereLosses) {
      this._atmosphereLosses = new Array();
    }
    if (this.losses.atmosphereLosses) {
      this.setCompareVals();
      this.atmosphereLossesCompareService.initCompareObjects();
      let lossIndex = 1;
      this.losses.atmosphereLosses.forEach(loss => {
        let tmpLoss = {
          form: this.atmosphereLossesService.getAtmosphereForm(loss),
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
        this._atmosphereLosses.push(tmpLoss);
      })
    }
    this.atmosphereLossesService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.atmosphereLosses) {
          this._atmosphereLosses.splice(lossIndex, 1);
          if (this.atmosphereLossesCompareService.differentArray && !this.isBaseline) {
            this.atmosphereLossesCompareService.differentArray.splice(lossIndex, 1);
          }
          this.saveLosses();
        }
      }
    })
    // if (this.isBaseline) {
    //   this.atmosphereLossesService.addLossBaselineMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._atmosphereLosses.push({
    //         form: this.atmosphereLossesService.initForm(),
    //         name: 'Loss #' + (this._atmosphereLosses.length + 1),
    //         heatLoss: 0.0,
    //         collapse: false
    //       })
    //     }
    //   })
    // } else {
    //   this.atmosphereLossesService.addLossModificationMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._atmosphereLosses.push({
    //         form: this.atmosphereLossesService.initForm(),
    //         name: 'Loss #' + (this._atmosphereLosses.length + 1),
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
      //      this.atmosphereLossesService.addLossBaselineMonitor.next(false);
      this.atmosphereLossesCompareService.baselineAtmosphereLosses = null;
    } else {
      this.atmosphereLossesCompareService.modifiedAtmosphereLosses = null;
      // this.atmosphereLossesService.addLossModificationMonitor.next(false);
    }
    this.atmosphereLossesService.deleteLossIndex.next(null);
  }

  disableForms() {
    this._atmosphereLosses.forEach(loss => {
      loss.form.disable();
    })
  }

  addLoss() {
    // if (this.isLossesSetup) {
    //   this.atmosphereLossesService.addLoss(this.isBaseline);
    // }
    if (this.atmosphereLossesCompareService.differentArray) {
      this.atmosphereLossesCompareService.addObject(this.atmosphereLossesCompareService.differentArray.length - 1);
    }

    this._atmosphereLosses.push({
      form: this.atmosphereLossesService.initForm(this._atmosphereLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }
  collapseLoss(loss: any) {
    loss.collapse = !loss.collapse;
  }

  removeLoss(lossIndex: number) {
    this.atmosphereLossesService.setDelete(lossIndex);
  }

  calculate(loss: any) {
    if (loss.form.status == 'VALID') {
      let tmpAtmosphereLoss = this.atmosphereLossesService.getLossFromForm(loss.form);
      loss.heatLoss = this.phastService.atmosphere(tmpAtmosphereLoss, this.settings);
    } else {
      loss.heatLoss = null;
    }
  }

  saveLosses() {
    let tmpAtmosphereLosses = new Array<AtmosphereLoss>();
    let lossIndex = 1;
    this._atmosphereLosses.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      lossIndex++;
      let tmpAtmosphereLoss = this.atmosphereLossesService.getLossFromForm(loss.form);
      tmpAtmosphereLoss.heatLoss = loss.heatLoss;
      tmpAtmosphereLosses.push(tmpAtmosphereLoss);
    })
    this.losses.atmosphereLosses = tmpAtmosphereLosses;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.atmosphereLossesCompareService.baselineAtmosphereLosses = this.losses.atmosphereLosses;
    } else {
      this.atmosphereLossesCompareService.modifiedAtmosphereLosses = this.losses.atmosphereLosses;
    }
    if (this.atmosphereLossesCompareService.differentArray && !this.isBaseline) {
      if (this.atmosphereLossesCompareService.differentArray.length != 0) {
        this.atmosphereLossesCompareService.checkAtmosphereLosses();
      }
    }
  }

  setInputError(bool: boolean){
    this.inputError = bool;
  }
}


export interface AtmoLossObj {
  form: FormGroup,
  heatLoss: number,
  collapse: boolean
}