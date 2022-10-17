import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { AuxiliaryPowerLoss } from '../../../shared/models/phast/losses/auxiliaryPowerLoss';
import { Losses } from '../../../shared/models/phast/phast';
import { AuxiliaryPowerLossesService } from './auxiliary-power-losses.service';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-auxiliary-power-losses',
  templateUrl: './auxiliary-power-losses.component.html',
  styleUrls: ['./auxiliary-power-losses.component.css']
})
export class AuxiliaryPowerLossesComponent implements OnInit {
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

  inputError: boolean = false;
  resultsUnit: string;
  _auxiliaryPowerLosses: Array<AuxPowLossObj>;
  firstChange: boolean = true;
  lossesLocked: boolean = false;
  constructor(private phastService: PhastService, private auxiliaryPowerLossesService: AuxiliaryPowerLossesService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._auxiliaryPowerLosses = new Array();
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
    if (!this._auxiliaryPowerLosses) {
      this._auxiliaryPowerLosses = new Array();
    }
    this.initForms();
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }

  initForms() {
    if (this.losses.auxiliaryPowerLosses) {
      let lossIndex = 1;
      this.losses.auxiliaryPowerLosses.forEach(loss => {
        let tmpLoss = {
          form: this.auxiliaryPowerLossesService.getFormFromLoss(loss),
          powerUsed: loss.powerUsed || 0.0,
          collapse: false
        };
        if (!tmpLoss.form.controls.name.value) {
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          });
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._auxiliaryPowerLosses.push(tmpLoss);
      });
    }
  }

  addLoss() {
    this._auxiliaryPowerLosses.push({
      form: this.auxiliaryPowerLossesService.initForm(this._auxiliaryPowerLosses.length + 1),
      powerUsed: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._auxiliaryPowerLosses.splice(lossIndex, 1);
    this.saveLosses();
  }

  calculate(loss: AuxPowLossObj) {
    if (loss.form.status === 'VALID') {
      let tmpLoss: AuxiliaryPowerLoss = this.auxiliaryPowerLossesService.getLossFromForm(loss.form);
      console.log('calculate, tmpLoss = ');
      console.log(tmpLoss);
      loss.powerUsed = this.phastService.auxiliaryPowerLoss(tmpLoss, this.settings);
    } else {
      loss.powerUsed = null;
    }
  }

  saveLosses() {
    let tmpAuxLosses = new Array<AuxiliaryPowerLoss>();
    let lossIndex = 1;
    this._auxiliaryPowerLosses.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        });
      }
      lossIndex++;
      let tmpAuxLoss = this.auxiliaryPowerLossesService.getLossFromForm(loss.form);
      tmpAuxLoss.powerUsed = loss.powerUsed;
      tmpAuxLosses.push(tmpAuxLoss);
    });
    this.losses.auxiliaryPowerLosses = tmpAuxLosses;
    this.savedLoss.emit(true);
  }

  collapseLoss(loss: AuxPowLossObj) {
    loss.collapse = !loss.collapse;
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  focusOut() {
    this.fieldChange.emit('default');
  }

  setInputError(bool: boolean) {
    this.inputError = bool;
  }

}

export interface AuxPowLossObj {
  form: UntypedFormGroup;
  powerUsed: number;
  collapse: boolean;
}
