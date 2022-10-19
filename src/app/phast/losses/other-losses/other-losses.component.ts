import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { OtherLossesService } from './other-losses.service';
import { Losses } from '../../../shared/models/phast/phast';
import { OtherLoss } from '../../../shared/models/phast/losses/otherLoss';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-other-losses',
  templateUrl: './other-losses.component.html',
  styleUrls: ['./other-losses.component.css']
})
export class OtherLossesComponent implements OnInit {
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

  _otherLosses: Array<OtherLossObj>;
  firstChange: boolean = true;
  lossesLocked: boolean = false;
  total: number;
  resultsUnit: string;
  constructor(private otherLossesService: OtherLossesService) { }

  ngOnInit() {
    if (this.settings.energyResultUnit !== 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }
    if (!this._otherLosses) {
      this._otherLosses = new Array();
    }
    this.initForms();
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._otherLosses = new Array();
        this.initForms();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  initForms() {
    if (this.losses.otherLosses) {
      this.losses.otherLosses.forEach(loss => {
        let tmpLoss = {
          form: this.otherLossesService.getFormFromLoss(loss),
          name: 'Loss #' + (this._otherLosses.length + 1),
          collapse: false
        };
        this._otherLosses.push(tmpLoss);
      });
      this.total = this.getTotal();
    }
  }

  collapseLoss(loss: OtherLossObj) {
    loss.collapse = !loss.collapse;
  }

  addLoss() {
    this._otherLosses.push({
      form: this.otherLossesService.initForm(),
      name: 'Loss #' + (this._otherLosses.length + 1),
      collapse: false
    }); ;
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._otherLosses.splice(lossIndex, 1);
    this.saveLosses();
    this.total = this.getTotal();
  }

  renameLoss() {
    let index = 1;
    this._otherLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    });
  }

  saveLosses() {
    let tmpLosses = new Array<OtherLoss>();
    this._otherLosses.forEach(loss => {
      let tmpLoss = this.otherLossesService.getLossFromForm(loss.form);
      tmpLosses.push(tmpLoss);
    });
    this.losses.otherLosses = tmpLosses;
    this.total = this.getTotal();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  getTotal() {
    return _.sumBy(this.losses.otherLosses, 'heatLoss');
  }
}

export interface OtherLossObj {
  form: UntypedFormGroup;
  name: string;
  collapse: boolean;
}
