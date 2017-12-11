import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { OtherLossesService } from './other-losses.service';
import { Losses } from '../../../shared/models/phast/phast';
import { OtherLoss } from '../../../shared/models/phast/losses/otherLoss';
import { OtherLossesCompareService } from './other-losses-compare.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-other-losses',
  templateUrl: './other-losses.component.html',
  styleUrls: ['./other-losses.component.css']
})
export class OtherLossesComponent implements OnInit {
  @Input()
  losses: Losses;
  @Input()
  saveClicked: boolean;
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
  
  _otherLosses: Array<any>;
  firstChange: boolean = true;
  constructor(private otherLossesService: OtherLossesService, private otherLossCompareService: OtherLossesCompareService) { }


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
        this.calculate(tmpLoss);
        this._otherLosses.push(tmpLoss);
      })
    }
    this.otherLossesService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.otherLosses) {
          this._otherLosses.splice(lossIndex, 1);
          if (this.otherLossCompareService.differentArray && !this.isBaseline) {
            this.otherLossCompareService.differentArray.splice(lossIndex, 1);
          }
        }
      }
    })
    if (this.isBaseline) {
      this.otherLossesService.addLossBaselineMonitor.subscribe((val) => {
        if (val == true) {
          this._otherLosses.push({
            form: this.otherLossesService.initForm(),
            name: 'Loss #' + (this._otherLosses.length + 1)
          })
        }
      })
    } else {
      this.otherLossesService.addLossModificationMonitor.subscribe((val) => {
        if (val == true) {
          this._otherLosses.push({
            form: this.otherLossesService.initForm(),
            name: 'Loss #' + (this._otherLosses.length + 1)
          })
        }
      })
    }

    if(this.inSetup && this.modExists){
      this.disableForms();
    }
  }

  collapseLoss(loss: any){
    loss.collapse = !loss.collapse;
  }
  
  disableForms(){
    this._otherLosses.forEach(loss => {
      loss.form.disable();
    })
  }
  
  addLoss() {
    if (this.isLossesSetup) {
      this.otherLossesService.addLoss(this.isBaseline);
    }
    if (this.otherLossCompareService.differentArray) {
      this.otherLossCompareService.addObject(this.otherLossCompareService.differentArray.length - 1);
    }
    this._otherLosses.push({
      form: this.otherLossesService.initForm(),
      name: 'Loss #' + (this._otherLosses.length + 1),
      collapse: false
    });;
  }

  removeLoss(lossIndex: number) {
    this.otherLossesService.setDelete(lossIndex);
  }

  renameLoss() {
    let index = 1;
    this._otherLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    loss.heatLoss = loss.form.value.heatLoss;
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
