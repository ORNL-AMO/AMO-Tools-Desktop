import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { FixtureLossesService } from './fixture-losses.service';
import { Losses } from '../../../shared/models/phast/phast';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
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
  constructor(private phastService: PhastService, private fixtureLossesService: FixtureLossesService) { }
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

    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
      this.disableForms();
    }
  }

  disableForms() {
    this._fixtureLosses.forEach(loss => {
      loss.form.disable();
    })
  }
  addLoss() {
    this._fixtureLosses.push({
      form: this.fixtureLossesService.initForm(this._fixtureLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._fixtureLosses.splice(lossIndex, 1);
    this.saveLosses();
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
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }
  setError(bool: boolean) {
    this.showError = bool;
  }


}

export interface FixtureLossObj {
  form: FormGroup,
  heatLoss: number,
  collapse: boolean
}