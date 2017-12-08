import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { FixtureLossesService } from './fixture-losses.service';
import { Losses } from '../../../shared/models/phast/phast';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
import { FixtureLossesCompareService } from "./fixture-losses-compare.service";
import { Settings } from '../../../shared/models/settings';

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
  
  resultsUnit: string;
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
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }
    if (!this._fixtureLosses) {
      this._fixtureLosses = new Array();
    }
    if (this.losses.fixtureLosses) {
      this.setCompareVals();
      this.fixtureLossesCompareService.initCompareObjects();
      this.losses.fixtureLosses.forEach(loss => {
        let tmpLoss = {
          form: this.fixtureLossesService.getFormFromLoss(loss),
          name: 'Loss #' + (this._fixtureLosses.length + 1),
          heatLoss: loss.heatLoss || 0.0
        };
        this.calculate(tmpLoss);
        this._fixtureLosses.push(tmpLoss);
      })
    }

    this.fixtureLossesService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.fixtureLosses) {
          this._fixtureLosses.splice(lossIndex, 1);
          if (this.fixtureLossesCompareService.differentArray && !this.isBaseline) {
            this.fixtureLossesCompareService.differentArray.splice(lossIndex, 1);
          }
        }
      }
    })
    if (this.isBaseline) {
      this.fixtureLossesService.addLossBaselineMonitor.subscribe((val) => {
        if (val == true) {
          this._fixtureLosses.push({
            form: this.fixtureLossesService.initForm(),
            name: 'Loss #' + (this._fixtureLosses.length + 1),
            heatLoss: 0.0
          })
        }
      })
    } else {
      this.fixtureLossesService.addLossModificationMonitor.subscribe((val) => {
        if (val == true) {
          this._fixtureLosses.push({
            form: this.fixtureLossesService.initForm(),
            name: 'Loss #' + (this._fixtureLosses.length + 1),
            heatLoss: 0.0
          })
        }
      })
    }
  }

  ngOnDestroy() {
    if (this.isBaseline) {
      this.fixtureLossesService.addLossBaselineMonitor.next(false);
      this.fixtureLossesCompareService.baselineFixtureLosses = null;
    } else {
      this.fixtureLossesService.addLossModificationMonitor.next(false);
      this.fixtureLossesCompareService.modifiedFixtureLosses = null;
    }
    this.fixtureLossesService.deleteLossIndex.next(null);
  }

  addLoss() {
    if (this.isLossesSetup) {
      this.fixtureLossesService.addLoss(this.isBaseline);
    }
    if (this.fixtureLossesCompareService.differentArray) {
      this.fixtureLossesCompareService.addObject(this.fixtureLossesCompareService.differentArray.length - 1);
    }
    this._fixtureLosses.push({
      form: this.fixtureLossesService.initForm(),
      name: 'Loss #' + (this._fixtureLosses.length + 1),
      heatLoss: 0.0
    });
  }

  removeLoss(lossIndex: number) {
    this.fixtureLossesService.setDelete(lossIndex);
  }

  renameLosses() {
    let index = 1;
    this._fixtureLosses.forEach(fixture => {
      fixture.name = 'Fixture #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    if (loss.form.status == 'VALID') {
      let tmpLoss: FixtureLoss = this.fixtureLossesService.getLossFromForm(loss.form);
      loss.heatLoss = this.phastService.fixtureLosses(tmpLoss, this.settings);
    } else {
      loss.heatLoss = null;
    }
  }

  saveLosses() {
    let tmpFixtureLosses = new Array<FixtureLoss>();
    this._fixtureLosses.forEach(loss => {
      let tmpFixtureLoss = this.fixtureLossesService.getLossFromForm(loss.form);
      tmpFixtureLoss.heatLoss = loss.heatLoss;
      tmpFixtureLosses.push(tmpFixtureLoss);
    });
    this.losses.fixtureLosses = tmpFixtureLosses;
    this.setCompareVals();
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
    if (this.fixtureLossesCompareService.differentArray && !this.isBaseline) {
      if (this.fixtureLossesCompareService.differentArray.length != 0) {
        this.fixtureLossesCompareService.checkFixtureLosses();
      }
    }
  }

}
