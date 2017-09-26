import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Slag } from '../../../shared/models/phast/losses/slag';
import { Losses } from '../../../shared/models/phast/phast';
import { SlagService } from './slag.service';
import { SlagCompareService } from './slag-compare.service';
//import { WindowRefService } from '../../../indexedDb/window-ref.service';
import { Settings } from '../../../shared/models/settings';
@Component({
  selector: 'app-slag',
  templateUrl: './slag.component.html',
  styleUrls: ['./slag.component.css']
})
export class SlagComponent implements OnInit {
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

  _slagLosses: Array<any>;
  firstChange: boolean = true;

  constructor(private phastService: PhastService, private slagService: SlagService, private slagCompareService: SlagCompareService) { }

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
    if (!this._slagLosses) {
      this._slagLosses = new Array();
    }
    if (this.losses.slagLosses) {
      this.setCompareVals();
      this.slagCompareService.initCompareObjects();
      this.losses.slagLosses.forEach(loss => {
        let tmpLoss = {
          form: this.slagService.getFormFromLoss(loss),
          name: 'Loss #' + (this._slagLosses.length + 1),
          heatLoss: loss.heatLoss || 0.0
        };
        this.calculate(tmpLoss);
        this._slagLosses.push(tmpLoss);
      })
    }

    this.slagService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.slagLosses) {
          this._slagLosses.splice(lossIndex, 1);
          if (this.slagCompareService.differentArray && !this.isBaseline) {
            this.slagCompareService.differentArray.splice(lossIndex, 1);
          }
        }
      }
    })
    if (this.isBaseline) {
      this.slagService.addLossBaselineMonitor.subscribe((val) => {
        if (val == true) {
          this._slagLosses.push({
            form: this.slagService.initForm(),
            name: 'Loss #' + (this._slagLosses.length + 1),
            heatLoss: 0.0
          })
        }
      })
    } else {
      this.slagService.addLossModificationMonitor.subscribe((val) => {
        if (val == true) {
          this._slagLosses.push({
            form: this.slagService.initForm(),
            name: 'Loss #' + (this._slagLosses.length + 1),
            heatLoss: 0.0
          })
        }
      })
    }
  }

  ngOnDestroy() {
    this.slagCompareService.baselineSlag = null;
    this.slagCompareService.modifiedSlag = null;
    this.slagService.deleteLossIndex.next(null);
    this.slagService.addLossBaselineMonitor.next(false);
    this.slagService.addLossModificationMonitor.next(false);
  }


  addLoss() {
    this.slagService.addLoss(this.isBaseline);
    if (this.slagCompareService.differentArray) {
      this.slagCompareService.addObject(this.slagCompareService.differentArray.length - 1);
    }
    this._slagLosses.push({
      form: this.slagService.initForm(),
      name: 'Loss #' + (this._slagLosses.length + 1),
      heatLoss: 0.0
    });
  }

  removeLoss(lossIndex: number) {
    this.slagService.setDelete(lossIndex);
  }

  renameLossess() {
    let index = 1;
    this._slagLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    if (loss.form.status == 'VALID') {
      let tmpLoss: Slag = this.slagService.getLossFromForm(loss.form);
      loss.heatLoss = this.phastService.slagOtherMaterialLosses(tmpLoss, this.settings);
    } else {
      loss.heatLoss = null;
    }
  }

  saveLosses() {
    let tmpSlagLosses = new Array<Slag>();
    this._slagLosses.forEach(loss => {
      let tmpSlag = this.slagService.getLossFromForm(loss.form);
      tmpSlag.heatLoss = loss.heatLoss;
      tmpSlagLosses.push(tmpSlag);
    })
    this.losses.slagLosses = tmpSlagLosses;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.slagCompareService.baselineSlag = this.losses.slagLosses;
    } else {
      this.slagCompareService.modifiedSlag = this.losses.slagLosses;
    }
    if (this.slagCompareService.differentArray && !this.isBaseline) {
      if (this.slagCompareService.differentArray.length != 0) {
        this.slagCompareService.checkSlagLosses();
      }
    }
  }
}
