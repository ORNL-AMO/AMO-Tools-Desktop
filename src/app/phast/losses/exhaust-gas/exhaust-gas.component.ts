import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { ExhaustGasEAF } from '../../../shared/models/phast/losses/exhaustGasEAF';
import { ExhaustGasService } from './exhaust-gas.service';
import { ExhaustGasCompareService } from './exhaust-gas-compare.service';
import { Settings } from '../../../shared/models/settings';

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

  _exhaustGasLosses: Array<any>;
  firstChange: boolean = true;

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
    if (!this._exhaustGasLosses) {
      this._exhaustGasLosses = new Array();
    }
    if (this.losses.exhaustGasEAF) {
      this.setCompareVals();
      this.exhaustGasCompareService.initCompareObjects();
      this.losses.exhaustGasEAF.forEach(loss => {
        let tmpLoss = {
          form: this.exhaustGasService.getFormFromLoss(loss),
          name: 'Loss #' + (this._exhaustGasLosses.length + 1),
          heatLoss: 0.0
        };
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
        }
      }
    })
    if (this.isBaseline) {
      this.exhaustGasService.addLossBaselineMonitor.subscribe((val) => {
        if (val == true) {
          this._exhaustGasLosses.push({
            form: this.exhaustGasService.initForm(),
            name: 'Loss #' + (this._exhaustGasLosses.length + 1),
            heatLoss: 0.0
          })
        }
      })
    } else {
      this.exhaustGasService.addLossModificationMonitor.subscribe((val) => {
        if (val == true) {
          this._exhaustGasLosses.push({
            form: this.exhaustGasService.initForm(),
            name: 'Loss #' + (this._exhaustGasLosses.length + 1),
            heatLoss: 0.0
          })
        }
      })
    }
  }

  ngOnDestroy() {
    this.exhaustGasCompareService.baselineExhaustGasLosses = null;
    this.exhaustGasCompareService.modifiedExhaustGasLosses = null;
    this.exhaustGasService.deleteLossIndex.next(null);
    this.exhaustGasService.addLossBaselineMonitor.next(false);
    this.exhaustGasService.addLossModificationMonitor.next(false);
  }
  addLoss() {
    this.exhaustGasService.addLoss(this.isBaseline);
    if (this.exhaustGasCompareService.differentArray) {
      this.exhaustGasCompareService.addObject(this.exhaustGasCompareService.differentArray.length - 1);
    }
    this._exhaustGasLosses.push({
      form: this.exhaustGasService.initForm(),
      name: 'Loss #' + (this._exhaustGasLosses.length + 1),
      heatLoss: 0.0
    });
  }

  removeLoss(lossIndex: number) {
    this.exhaustGasService.setDelete(lossIndex);
  }

  renameLossess() {
    let index = 1;
    this._exhaustGasLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    if (loss.form.status == 'VALID') {
      let tmpGas = this.exhaustGasService.getLossFromForm(loss.form);
      loss.heatLoss = this.phastService.exhaustGasEAF(tmpGas, this.settings);
    }else {
      loss.heatLoss = null;
    }
  }

  saveLosses() {
    let tmpExhaustGases = new Array<ExhaustGasEAF>();
    this._exhaustGasLosses.forEach(loss => {
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
