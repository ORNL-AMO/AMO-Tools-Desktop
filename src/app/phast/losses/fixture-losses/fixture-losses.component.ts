import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { FixtureFormService } from '../../../calculator/furnaces/fixture/fixture-form.service';

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
  inSetup: boolean;
  @Input()
  modExists: boolean;
  @Input()
  modificationIndex: number;

  showError: boolean = false;
  resultsUnit: string;
  _fixtureLosses: Array<FixtureLossObj>;
  firstChange: boolean = true;
  lossesLocked: boolean = false;
  total: number;
  constructor(private phastService: PhastService, private fixtureFormService: FixtureFormService) { }
  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._fixtureLosses = new Array();
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
    if (!this._fixtureLosses) {
      this._fixtureLosses = new Array();
    }
    this.initForms();
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }

  initForms() {
    if (this.losses.fixtureLosses) {
      let lossIndex = 1;
      this.losses.fixtureLosses.forEach(loss => {
        let tmpLoss = {
          form: this.fixtureFormService.getFormFromLoss(loss),
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
        this._fixtureLosses.push(tmpLoss);
      });
      this.total = this.getTotal();
    }
  }

  addLoss() {
    this._fixtureLosses.push({
      form: this.fixtureFormService.initForm(this._fixtureLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._fixtureLosses.splice(lossIndex, 1);
    this.saveLosses();
    this.total = this.getTotal();
  }

  calculate(loss: FixtureLossObj) {
    if (loss.form.status === 'VALID') {
      let tmpLoss: FixtureLoss = this.fixtureFormService.getLossFromForm(loss.form);
      loss.heatLoss = this.phastService.fixtureLosses(tmpLoss, this.settings);
    } else {
      loss.heatLoss = null;
    }
    this.total = this.getTotal();
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
        });
      }
      lossIndex++;
      let tmpFixtureLoss: FixtureLoss = this.fixtureFormService.getLossFromForm(loss.form);
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
  getTotal() {
    return _.sumBy(this._fixtureLosses, 'heatLoss');
  }

}

export interface FixtureLossObj {
  form: FormGroup;
  heatLoss: number;
  collapse: boolean;
}
