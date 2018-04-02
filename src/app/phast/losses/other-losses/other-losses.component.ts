import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { OtherLossesService } from './other-losses.service';
import { Losses } from '../../../shared/models/phast/phast';
import { OtherLoss } from '../../../shared/models/phast/losses/otherLoss';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

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
  isLossesSetup: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  modExists: boolean;

  _otherLosses: Array<OtherLossObj>;
  firstChange: boolean = true;
  lossesLocked: boolean = false;
  constructor(private otherLossesService: OtherLossesService) { }

  ngOnInit() {
    if (!this._otherLosses) {
      this._otherLosses = new Array();
    }
    this.initForms();
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
      this.disableForms();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.losses) {
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
      })
    }
  }

  collapseLoss(loss: OtherLossObj) {
    loss.collapse = !loss.collapse;
  }

  disableForms() {
    this._otherLosses.forEach(loss => {
      loss.form.disable();
    })
  }

  addLoss() {
    this._otherLosses.push({
      form: this.otherLossesService.initForm(),
      name: 'Loss #' + (this._otherLosses.length + 1),
      collapse: false
    });;
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._otherLosses.splice(lossIndex, 1);
    this.saveLosses();
  }

  renameLoss() {
    let index = 1;
    this._otherLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  saveLosses() {
    let tmpLosses = new Array<OtherLoss>();
    this._otherLosses.forEach(loss => {
      let tmpLoss = this.otherLossesService.getLossFromForm(loss.form);
      tmpLosses.push(tmpLoss);
    })
    this.losses.otherLosses = tmpLosses;
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }
}

export interface OtherLossObj {
  form: FormGroup,
  name: string,
  collapse: boolean
}