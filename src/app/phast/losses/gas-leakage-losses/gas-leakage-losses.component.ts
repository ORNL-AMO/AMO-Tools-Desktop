import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { LeakageLoss } from '../../../shared/models/phast/losses/leakageLoss';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { LeakageFormService } from '../../../calculator/furnaces/leakage/leakage-form.service';

@Component({
  selector: 'app-gas-leakage-losses',
  templateUrl: './gas-leakage-losses.component.html',
  styleUrls: ['./gas-leakage-losses.component.css']
})
export class GasLeakageLossesComponent implements OnInit {
  @Input()
  losses: Losses;
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
  inSetup: boolean;
  @Input()
  modExists: boolean;
  @Input()
  modificationIndex: number;

  _leakageLosses: Array<GasLeakageObj>;
  firstChange: boolean = true;
  lossesLocked: boolean = false;
  resultsUnit: string;
  showError: boolean = false;
  total: number;
  constructor(private leakageFormService: LeakageFormService, private phastService: PhastService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._leakageLosses = new Array();
        this.initForms();
      }
    }
    else {
      this.firstChange = false;
    }
  }
  ngOnInit() {
    if (this.settings.energyResultUnit !== 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }
    if (!this._leakageLosses) {
      this._leakageLosses = new Array<any>();
    }
    this.initForms();
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }
  initForms() {
    if (this.losses.leakageLosses) {
      let lossIndex = 1;
      this.losses.leakageLosses.forEach(loss => {
        let tmpLoss = {
          form: this.leakageFormService.initFormFromLoss(loss),
          heatLoss: loss.heatLoss || 0.0,
          collapse: false
        };
        if (!tmpLoss.form.controls.name.value) {
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          });
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._leakageLosses.push(tmpLoss);
      });
      this.total = this.getTotal();
    }
  }

  addLoss() {
    this._leakageLosses.push({
      form: this.leakageFormService.initForm(this._leakageLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  collapseLoss(loss: GasLeakageObj) {
    loss.collapse = !loss.collapse;
  }

  setError(bool: boolean) {
    this.showError = bool;
  }

  removeLoss(lossIndex: number) {
    this._leakageLosses.splice(lossIndex, 1);
    this.saveLosses();
    this.total = this.getTotal();
  }

  calculate(loss: GasLeakageObj) {
    if (loss.form.status === 'VALID') {
      let tmpLeakageLoss = this.leakageFormService.initLossFromForm(loss.form);
      loss.heatLoss = this.phastService.leakageLosses(tmpLeakageLoss, this.settings);
    }
    else {
      loss.heatLoss = null;
    }
    this.total = this.getTotal();
  }

  saveLosses() {
    let tmpLeakageLosses = new Array<LeakageLoss>();
    let lossIndex = 1;
    this._leakageLosses.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        });
      }
      lossIndex++;
      let tmpLeakageLoss = this.leakageFormService.initLossFromForm(loss.form);
      tmpLeakageLoss.heatLoss = loss.heatLoss;
      tmpLeakageLosses.push(tmpLeakageLoss);
    });
    this.losses.leakageLosses = tmpLeakageLosses;
    this.savedLoss.emit(true);
  }
  changeField(str: string) {
    this.fieldChange.emit(str);
  }
  getTotal() {
    return _.sumBy(this._leakageLosses, 'heatLoss');
  }
}

export interface GasLeakageObj {
  form: FormGroup;
  heatLoss: number;
  collapse: boolean;
}
