import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses, PHAST } from '../../../shared/models/phast/phast';
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { AtmosphereFormService } from '../../../calculator/furnaces/atmosphere/atmosphere-form.service';

@Component({
  selector: 'app-atmosphere-losses',
  templateUrl: './atmosphere-losses.component.html',
  styleUrls: ['./atmosphere-losses.component.css']
})
export class AtmosphereLossesComponent implements OnInit {
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

  _atmosphereLosses: Array<AtmoLossObj>;
  firstChange: boolean = true;
  inputError: boolean = false;
  resultsUnit: string;
  lossesLocked: boolean = false;
  selectedMod: PHAST;
  constructor(private atmosphereFormService: AtmosphereFormService, private phastService: PhastService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._atmosphereLosses = new Array();
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

    if (!this._atmosphereLosses) {
      this._atmosphereLosses = new Array();
    }
    this.initForms();
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }

  initForms() {
    if (this.losses.atmosphereLosses) {
      let lossIndex = 1;
      this.losses.atmosphereLosses.forEach(loss => {
        let tmpLoss = {
          form: this.atmosphereFormService.getAtmosphereForm(loss),
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
        this._atmosphereLosses.push(tmpLoss);
      });
    }
  }

  addLoss() {
    this._atmosphereLosses.push({
      form: this.atmosphereFormService.initForm(this._atmosphereLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }
  collapseLoss(loss: any) {
    loss.collapse = !loss.collapse;
  }

  removeLoss(lossIndex: number) {
    this._atmosphereLosses.splice(lossIndex, 1);
    this.saveLosses();
  }

  calculate(loss: any) {
    if (loss.form.status === 'VALID') {
      let tmpAtmosphereLoss = this.atmosphereFormService.getLossFromForm(loss.form);
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
        });
      }
      lossIndex++;
      let tmpAtmosphereLoss = this.atmosphereFormService.getLossFromForm(loss.form);
      tmpAtmosphereLoss.heatLoss = loss.heatLoss;
      tmpAtmosphereLosses.push(tmpAtmosphereLoss);
    });
    this.losses.atmosphereLosses = tmpAtmosphereLosses;
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setInputError(bool: boolean) {
    this.inputError = bool;
  }
}


export interface AtmoLossObj {
  form: UntypedFormGroup;
  heatLoss: number;
  collapse: boolean;
}
