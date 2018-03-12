import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { OtherLossesService } from './other-losses.service';
import { Losses } from '../../../shared/models/phast/phast';
import { OtherLoss } from '../../../shared/models/phast/losses/otherLoss';
import { OtherLossesCompareService } from './other-losses-compare.service';
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
  constructor(private otherLossesService: OtherLossesService, private otherLossCompareService: OtherLossesCompareService) { }

  ngOnInit() {
    if (!this._otherLosses) {
      this._otherLosses = new Array();
    }
    if (this.losses.otherLosses) {
      this.setCompareVals();
      this.otherLossCompareService.initCompareObjects();
      this.losses.otherLosses.forEach(loss => {
        let tmpLoss = {
          form: this.otherLossesService.getFormFromLoss(loss),
          name: 'Loss #' + (this._otherLosses.length + 1),
          collapse: false
        };
        this._otherLosses.push(tmpLoss);
      })
    }

    if(this.inSetup && this.modExists){
      this.lossesLocked = true;
      this.disableForms();
    }
  }

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

  collapseLoss(loss: OtherLossObj){
    loss.collapse = !loss.collapse;
  }
  
  disableForms(){
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
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.otherLossCompareService.baselineOtherLoss = this.losses.otherLosses;
    } else {
      this.otherLossCompareService.modifiedOtherLoss = this.losses.otherLosses;
    }
    if (this.otherLossCompareService.differentArray && !this.isBaseline) {
      if (this.otherLossCompareService.differentArray.length != 0) {
        this.otherLossCompareService.checkOtherLosses();
      }
    }
  }
}

export interface OtherLossObj{
  form: FormGroup,
  name: string,
  collapse: boolean
}