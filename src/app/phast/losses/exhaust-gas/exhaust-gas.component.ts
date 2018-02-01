import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { ExhaustGasEAF } from '../../../shared/models/phast/losses/exhaustGasEAF';
import { ExhaustGasService } from './exhaust-gas.service';
import { ExhaustGasCompareService } from './exhaust-gas-compare.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-exhaust-gas',
  templateUrl: './exhaust-gas.component.html',
  styleUrls: ['./exhaust-gas.component.css']
})
export class ExhaustGasComponent implements OnInit {
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

  _exhaustGasLosses: Array<ExhaustGasObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  constructor(private phastService: PhastService, private exhaustGasService: ExhaustGasService, private exhaustGasCompareService: ExhaustGasCompareService) { }

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
    if (!this._exhaustGasLosses) {
      this._exhaustGasLosses = new Array();
    }
    if (this.losses.exhaustGasEAF) {
      this.setCompareVals();
      this.exhaustGasCompareService.initCompareObjects();
      let lossIndex = 1;
      this.losses.exhaustGasEAF.forEach(loss => {
        let tmpLoss = {
          form: this.exhaustGasService.getFormFromLoss(loss),
          heatLoss: 0.0,
          collapse: false
        };
        if (!tmpLoss.form.controls.name.value) {
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          })
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._exhaustGasLosses.push(tmpLoss);
      })
    }

    this.exhaustGasService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.exhaustGasEAF) {
          this._exhaustGasLosses.splice(lossIndex, 1);
          if (this.exhaustGasCompareService.differentArray && !this.isBaseline) {
            this.exhaustGasCompareService.differentArray.splice(lossIndex, 1);
          }
          this.saveLosses();
        }
      }
    })
    // if (this.isBaseline) {
    //   this.exhaustGasService.addLossBaselineMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._exhaustGasLosses.push({
    //         form: this.exhaustGasService.initForm(),
    //         name: 'Loss #' + (this._exhaustGasLosses.length + 1),
    //         heatLoss: 0.0,
    //         collapse: false
    //       })
    //     }
    //   })
    // } else {
    //   this.exhaustGasService.addLossModificationMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._exhaustGasLosses.push({
    //         form: this.exhaustGasService.initForm(),
    //         name: 'Loss #' + (this._exhaustGasLosses.length + 1),
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
      // this.exhaustGasService.addLossBaselineMonitor.next(false);
      this.exhaustGasCompareService.baselineExhaustGasLosses = null;
    } else {
      // this.exhaustGasService.addLossModificationMonitor.next(false);
      this.exhaustGasCompareService.modifiedExhaustGasLosses = null;
    }
    this.exhaustGasService.deleteLossIndex.next(null);
  }

  disableForms() {
    this._exhaustGasLosses.forEach(loss => {
      loss.form.disable();
    })
  }

  addLoss() {
    // if (this.isLossesSetup) {
    //   this.exhaustGasService.addLoss(this.isBaseline);
    // }
    if (this.exhaustGasCompareService.differentArray) {
      this.exhaustGasCompareService.addObject(this.exhaustGasCompareService.differentArray.length - 1);
    }
    this._exhaustGasLosses.push({
      form: this.exhaustGasService.initForm(this._exhaustGasLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this.exhaustGasService.setDelete(lossIndex);
  }

  collapseLoss(loss: ExhaustGasObj) {
    loss.collapse = !loss.collapse;
  }
  calculate(loss: ExhaustGasObj) {
    if (loss.form.status == 'VALID') {
      let tmpGas = this.exhaustGasService.getLossFromForm(loss.form);
      loss.heatLoss = this.phastService.exhaustGasEAF(tmpGas, this.settings);
    } else {
      loss.heatLoss = null;
    }
  }

  saveLosses() {
    let tmpExhaustGases = new Array<ExhaustGasEAF>();
    let lossIndex = 1;
    this._exhaustGasLosses.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      lossIndex++;
      let tmpExhaustGas = this.exhaustGasService.getLossFromForm(loss.form);
      tmpExhaustGases.push(tmpExhaustGas);
    })
    this.losses.exhaustGasEAF = tmpExhaustGases;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.exhaustGasCompareService.baselineExhaustGasLosses = this.losses.exhaustGasEAF;
    } else {
      this.exhaustGasCompareService.modifiedExhaustGasLosses = this.losses.exhaustGasEAF;
    }
    if (this.exhaustGasCompareService.differentArray && !this.isBaseline) {
      if (this.exhaustGasCompareService.differentArray.length != 0) {
        this.exhaustGasCompareService.checkExhaustGasLosses();
      }
    }
  }
}

export interface ExhaustGasObj {
  form: FormGroup,
  heatLoss: number,
  collapse: boolean
}