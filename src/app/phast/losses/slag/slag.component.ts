import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Slag } from '../../../shared/models/phast/losses/slag';
import { Losses } from '../../../shared/models/phast/phast';
import { SlagService } from './slag.service';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
@Component({
  selector: 'app-slag',
  templateUrl: './slag.component.html',
  styleUrls: ['./slag.component.css']
})
export class SlagComponent implements OnInit {
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

  _slagLosses: Array<SlagLossObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  constructor(private phastService: PhastService, private slagService: SlagService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._slagLosses = new Array();
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
    if (!this._slagLosses) {
      this._slagLosses = new Array<SlagLossObj>();
    }
    this.initForms();
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }
  initForms() {
    if (this.losses.slagLosses) {
      let lossIndex = 1;
      this.losses.slagLosses.forEach(loss => {
        let tmpLoss = {
          form: this.slagService.getFormFromLoss(loss),
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
        this._slagLosses.push(tmpLoss);
      });
    }
  }

  addLoss() {
    this._slagLosses.push({
      form: this.slagService.initForm(this._slagLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._slagLosses.splice(lossIndex, 1);
    this.saveLosses();
  }

  calculate(loss: SlagLossObj) {
    if (loss.form.status === 'VALID') {
      let tmpLoss: Slag = this.slagService.getLossFromForm(loss.form);
      loss.heatLoss = this.phastService.slagOtherMaterialLosses(tmpLoss, this.settings);
    } else {
      loss.heatLoss = null;
    }
  }

  saveLosses() {
    let tmpSlagLosses = new Array<Slag>();
    let lossIndex = 1;
    this._slagLosses.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        });
      }
      lossIndex++;
      let tmpSlag = this.slagService.getLossFromForm(loss.form);
      tmpSlag.heatLoss = loss.heatLoss;
      tmpSlagLosses.push(tmpSlag);
    });
    this.losses.slagLosses = tmpSlagLosses;
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }
}

export interface SlagLossObj {
  form: UntypedFormGroup;
  heatLoss?: number;
  collapse: boolean;
}
