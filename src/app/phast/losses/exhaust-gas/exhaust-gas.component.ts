import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { ExhaustGasEAF } from '../../../shared/models/phast/losses/exhaustGasEAF';
import { ExhaustGasService } from './exhaust-gas.service';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-exhaust-gas',
  templateUrl: './exhaust-gas.component.html',
  styleUrls: ['./exhaust-gas.component.css']
})
export class ExhaustGasComponent implements OnInit {
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

  _exhaustGasLosses: Array<ExhaustGasObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  constructor(private phastService: PhastService, private exhaustGasService: ExhaustGasService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._exhaustGasLosses = new Array();
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
    if (!this._exhaustGasLosses) {
      this._exhaustGasLosses = new Array();
    }
    this.initForms();
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }

  initForms() {
    if (this.losses.exhaustGasEAF) {
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
          });
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._exhaustGasLosses.push(tmpLoss);
      });
    }
  }

  addLoss() {
    this._exhaustGasLosses.push({
      form: this.exhaustGasService.initForm(this._exhaustGasLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._exhaustGasLosses.splice(lossIndex, 1);
    this.saveLosses();
  }

  collapseLoss(loss: ExhaustGasObj) {
    loss.collapse = !loss.collapse;
  }
  calculate(loss: ExhaustGasObj) {
    if (loss.form.status === 'VALID') {
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
        });
      }
      lossIndex++;
      let tmpExhaustGas = this.exhaustGasService.getLossFromForm(loss.form);
      tmpExhaustGases.push(tmpExhaustGas);
    });
    this.losses.exhaustGasEAF = tmpExhaustGases;
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

}

export interface ExhaustGasObj {
  form: UntypedFormGroup;
  heatLoss: number;
  collapse: boolean;
}
