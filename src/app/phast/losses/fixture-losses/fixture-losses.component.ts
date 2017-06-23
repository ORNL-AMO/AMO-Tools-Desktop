import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { FixtureLossesService } from './fixture-losses.service';
import { Losses } from '../../../shared/models/phast';
import { FixtureLoss } from '../../../shared/models/losses/fixtureLoss';
import { FixtureLossesCompareService } from "./fixture-losses-compare.service";

@Component({
  selector: 'app-fixture-losses',
  templateUrl: './fixture-losses.component.html',
  styleUrls: ['./fixture-losses.component.css']
})
export class FixtureLossesComponent implements OnInit {
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

  _fixtureLosses: Array<any>;
  firstChange: boolean = true;
  constructor(private phastService: PhastService, private fixtureLossesService: FixtureLossesService, private fixtureLossesCompareService: FixtureLossesCompareService) { }
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
    if (!this._fixtureLosses) {
      this._fixtureLosses = new Array();
    }
    if (this.losses.fixtureLosses) {
     // this.setCompareVals();
     // this.fixtureLossesCompareService.initCompareObjects();
      this.losses.fixtureLosses.forEach(loss => {
        let tmpLoss = {
          form: this.fixtureLossesService.getFormFromLoss(loss),
          name: 'Loss #' + (this._fixtureLosses.length + 1),
          heatLoss: loss.heatLoss || 0.0
        };
        this.calculate(tmpLoss);
        this._fixtureLosses.unshift(tmpLoss);
      })
    }
  }

  ngOnDestroy(){
    this.fixtureLossesCompareService.baselineFixtureLosses = null;
    this.fixtureLossesCompareService.modifiedFixtureLosses = null;
  }

  addLoss() {
    this._fixtureLosses.unshift({
      form: this.fixtureLossesService.initForm(),
      name: 'Loss #' + (this._fixtureLosses.length + 1),
      heatLoss: 0.0
    });
    this.lossState.saved = false;
  }

  removeLoss(str: string) {
    this._fixtureLosses = _.remove(this._fixtureLosses, fixture => {
      return fixture.name != str;
    });
    this.lossState.saved = false;
    this.renameLosses();
  }

  renameLosses() {
    let index = 1;
    this._fixtureLosses.forEach(fixture => {
      fixture.name = 'Fixture #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    loss.heatLoss = this.phastService.fixtureLosses(
      loss.form.value.specificHeat,
      loss.form.value.feedRate,
      loss.form.value.initialTemp,
      loss.form.value.finalTemp,
      loss.form.value.correctionFactor
    );
  }

  saveLosses() {
    let tmpFixtureLosses = new Array<FixtureLoss>();
    this._fixtureLosses.forEach(loss => {
      let tmpFixtureLoss = this.fixtureLossesService.getLossFromForm(loss.form);
      tmpFixtureLoss.heatLoss = loss.heatLoss;
      tmpFixtureLosses.unshift(tmpFixtureLoss);
    });
    this.losses.fixtureLosses = tmpFixtureLosses;
    this.lossState.numLosses = this.losses.fixtureLosses.length;
    this.lossState.saved = true;
    //this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.fixtureLossesCompareService.baselineFixtureLosses = this.losses.fixtureLosses;
    } else {
      this.fixtureLossesCompareService.modifiedFixtureLosses = this.losses.fixtureLosses;
    }
    if (this.fixtureLossesCompareService.differentArray) {
      if (this.fixtureLossesCompareService.differentArray.length != 0) {
        this.fixtureLossesCompareService.checkFixtureLosses();
      }
    }
  }

}
