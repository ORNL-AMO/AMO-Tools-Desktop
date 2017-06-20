import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Slag } from '../../../shared/models/losses/slag';
import { Losses } from '../../../shared/models/phast';
import { SlagService } from './slag.service';
import { SlagCompareService } from './slag-compare.service';
//import { WindowRefService } from '../../../indexedDb/window-ref.service';

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
  lossState: any;
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
        this._slagLosses.unshift(tmpLoss);
      })
    }
  }

  addLoss() {
    this._slagLosses.unshift({
      form: this.slagService.initForm(),
      name: 'Loss #' + (this._slagLosses.length + 1),
      heatLoss: 0.0
    });
    this.lossState.saved = false;
  }


  removeLoss(str: string) {
    this._slagLosses = _.remove(this._slagLosses, loss => {
      return loss.name != str;
    });
    this.lossState.saved = false;
    this.renameLossess();
  }
  renameLossess() {
    let index = 1;
    this._slagLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    loss.heatLoss = this.phastService.slagOtherMaterialLosses(
      loss.form.value.weight,
      loss.form.value.inletTemperature,
      loss.form.value.outletTemperature,
      loss.form.value.specificHeat,
      loss.form.value.correctionFactor
    );
  }

  saveLosses() {
    let tmpSlagLosses = new Array<Slag>();
    this._slagLosses.forEach(loss => {
      let tmpSlag = this.slagService.getLossFromForm(loss.form);
      tmpSlag.heatLoss = loss.heatLoss;
      tmpSlagLosses.unshift(tmpSlag);
    })
    this.losses.slagLosses = tmpSlagLosses;
    this.lossState.numLosses = this.losses.slagLosses.length;
    this.lossState.saved = true;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals(){
    if(this.isBaseline){
      this.slagCompareService.baselineSlag = this.losses.slagLosses;
    }else{
      this.slagCompareService.modifiedSlag = this.losses.slagLosses;
    }
    if(this.slagCompareService.differentArray){
      if(this.slagCompareService.differentArray.length != 0){
        this.slagCompareService.checkSlagLosses();
      }
    }
  }
}
