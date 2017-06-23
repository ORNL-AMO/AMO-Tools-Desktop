import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast';
import { LeakageLoss } from '../../../shared/models/losses/leakageLoss';
import { GasLeakageLossesService } from './gas-leakage-losses.service';
import { GasLeakageCompareService } from './gas-leakage-compare.service';

@Component({
  selector: 'app-gas-leakage-losses',
  templateUrl: './gas-leakage-losses.component.html',
  styleUrls: ['./gas-leakage-losses.component.css']
})
export class GasLeakageLossesComponent implements OnInit {
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

  _leakageLosses: Array<any>;
  firstChange: boolean = true;

  constructor(private gasLeakageLossesService: GasLeakageLossesService, private phastService: PhastService, private gasLeakageCompareService: GasLeakageCompareService) { }

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
    if (!this._leakageLosses) {
      this._leakageLosses = new Array<any>();
    }
    if (this.losses.leakageLosses) {
     // this.setCompareVals();
     // this.gasLeakageCompareService.initCompareObjects();
      this.losses.leakageLosses.forEach(loss => {
        let tmpLoss = {
          form: this.gasLeakageLossesService.initFormFromLoss(loss),
          name: 'Loss #' + (this._leakageLosses.length + 1),
          heatLoss: loss.heatLoss || 0.0
        };
        this.calculate(tmpLoss);
        this._leakageLosses.unshift(tmpLoss);
      })
    }
  }

  ngOnDestroy(){
    this.gasLeakageCompareService.baselineLeakageLoss = null;
    this.gasLeakageCompareService.modifiedLeakageLoss = null;
  }

  addLoss() {
    this._leakageLosses.unshift({
      form: this.gasLeakageLossesService.initForm(),
      name: 'Loss #' + (this._leakageLosses.length + 1),
      heatLoss: 0.0
    });
    this.lossState.saved = false;
  }


  removeLoss(str: string) {
    this._leakageLosses = _.remove(this._leakageLosses, loss => {
      return loss.name != str;
    });
    this.lossState.saved = false;
    this.renameLossess();
  }

  renameLossess() {
    let index = 1;
    this._leakageLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    loss.heatLoss = this.phastService.leakageLosses(
      loss.form.value.draftPressure,
      loss.form.value.openingArea,
      loss.form.value.leakageGasTemperature,
      loss.form.value.ambientTemperature,
      loss.form.value.coefficient,
      loss.form.value.specificGravity,
      loss.form.value.correctionFactor
    );
  }

  saveLosses() {
    let tmpLeakageLosses = new Array<LeakageLoss>();
    this._leakageLosses.forEach(loss => {
      let tmpLeakageLoss = this.gasLeakageLossesService.initLossFromForm(loss.form);
      tmpLeakageLoss.heatLoss = loss.heatLoss;
      tmpLeakageLosses.unshift(tmpLeakageLoss);
    })
    this.losses.leakageLosses = tmpLeakageLosses;
    this.lossState.numLosses = this.losses.leakageLosses.length;
    this.lossState.saved = true;
    //this.setCompareVals();
    this.savedLoss.emit(true);
  }
  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.gasLeakageCompareService.baselineLeakageLoss = this.losses.leakageLosses;
    } else {
      this.gasLeakageCompareService.modifiedLeakageLoss = this.losses.leakageLosses;
    }
    if (this.gasLeakageCompareService.differentArray) {
      if (this.gasLeakageCompareService.differentArray.length != 0) {
        this.gasLeakageCompareService.checkLeakageLosses();
      }
    }
  }
}
