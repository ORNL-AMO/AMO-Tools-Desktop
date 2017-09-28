import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { CoolingLossesService } from './cooling-losses.service';
import { Losses } from '../../../shared/models/phast/phast';
import { CoolingLoss, GasCoolingLoss, LiquidCoolingLoss, WaterCoolingLoss } from '../../../shared/models/phast/losses/coolingLoss';
import { CoolingLossesCompareService } from './cooling-losses-compare.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-cooling-losses',
  templateUrl: './cooling-losses.component.html',
  styleUrls: ['./cooling-losses.component.css']
})
export class CoolingLossesComponent implements OnInit {
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

  _coolingLosses: Array<any>;
  firstChange: boolean = true;
  constructor(private coolingLossesService: CoolingLossesService, private phastService: PhastService, private coolingLossesCompareService: CoolingLossesCompareService) { }

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
    if (!this._coolingLosses) {
      this._coolingLosses = new Array();
    }
    if (this.losses.coolingLosses) {
      this.setCompareVals();
      this.coolingLossesCompareService.initCompareObjects();
      this.initCoolingLosses();
    }

    this.coolingLossesService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.coolingLosses) {
          this._coolingLosses.splice(lossIndex, 1);
          if (this.coolingLossesCompareService.differentArray && !this.isBaseline) {
            this.coolingLossesCompareService.differentArray.splice(lossIndex, 1);
          }
        }
      }
    })
    if (this.isBaseline) {
      this.coolingLossesService.addLossBaselineMonitor.subscribe((val) => {
        if (val == true) {
          this._coolingLosses.push({
            coolingMedium: 'Gas',
            waterCoolingForm: this.coolingLossesService.initWaterCoolingForm(),
            gasCoolingForm: this.coolingLossesService.initGasCoolingForm(),
            liquidCoolingForm: this.coolingLossesService.initLiquidCoolingForm(),
            name: 'Loss #' + (this._coolingLosses.length + 1),
            heatLoss: 0.0
          });
        }
      })
    } else {
      this.coolingLossesService.addLossModificationMonitor.subscribe((val) => {
        if (val == true) {
          this._coolingLosses.push({
            coolingMedium: 'Gas',
            waterCoolingForm: this.coolingLossesService.initWaterCoolingForm(),
            gasCoolingForm: this.coolingLossesService.initGasCoolingForm(),
            liquidCoolingForm: this.coolingLossesService.initLiquidCoolingForm(),
            name: 'Loss #' + (this._coolingLosses.length + 1),
            heatLoss: 0.0
          });
        }
      })
    }
  }

  ngOnDestroy() {
    this.coolingLossesCompareService.baselineCoolingLosses = null;
    this.coolingLossesCompareService.modifiedCoolingLosses = null;
    this.coolingLossesService.deleteLossIndex.next(null);
    this.coolingLossesService.addLossBaselineMonitor.next(false);
    this.coolingLossesService.addLossModificationMonitor.next(false);
  }

  initCoolingLosses() {
    this.losses.coolingLosses.forEach(loss => {
      let tmpLoss: any;
      if (loss.coolingLossType == 'Gas' || loss.coolingLossType == 'Air') {
        tmpLoss = {
          coolingMedium: loss.coolingLossType,
          waterCoolingForm: this.coolingLossesService.initWaterCoolingForm(),
          gasCoolingForm: this.coolingLossesService.initGasFormFromLoss(loss.gasCoolingLoss),
          liquidCoolingForm: this.coolingLossesService.initLiquidCoolingForm(),
          name: 'Loss #' + (this._coolingLosses.length + 1),
          heatLoss: loss.heatLoss || 0.0
        };
      } else if (loss.coolingLossType == 'Liquid') {
        tmpLoss = {
          coolingMedium: loss.coolingLossType,
          waterCoolingForm: this.coolingLossesService.initWaterCoolingForm(),
          gasCoolingForm: this.coolingLossesService.initGasCoolingForm(),
          liquidCoolingForm: this.coolingLossesService.initLiquidFormFromLoss(loss.liquidCoolingLoss),
          name: 'Loss #' + (this._coolingLosses.length + 1),
          heatLoss: loss.heatLoss || 0.0
        };
      }
      else if (loss.coolingLossType == 'Water') {
        tmpLoss = {
          coolingMedium: loss.coolingLossType,
          waterCoolingForm: this.coolingLossesService.initWaterFormFromLoss(loss.waterCoolingLoss),
          gasCoolingForm: this.coolingLossesService.initGasCoolingForm(),
          liquidCoolingForm: this.coolingLossesService.initLiquidCoolingForm(),
          name: 'Loss #' + (this._coolingLosses.length + 1),
          heatLoss: loss.heatLoss || 0.0
        };
      }
      this.calculate(tmpLoss);
      this._coolingLosses.push(tmpLoss);
    })
  }

  addLoss() {
    this.coolingLossesService.addLoss(this.isBaseline);
    if (this.coolingLossesCompareService.differentArray) {
      this.coolingLossesCompareService.addObject(this.coolingLossesCompareService.differentArray.length - 1);
    }
    this._coolingLosses.push({
      coolingMedium: 'Gas',
      waterCoolingForm: this.coolingLossesService.initWaterCoolingForm(),
      gasCoolingForm: this.coolingLossesService.initGasCoolingForm(),
      liquidCoolingForm: this.coolingLossesService.initLiquidCoolingForm(),
      name: 'Loss #' + (this._coolingLosses.length + 1),
      heatLoss: 0.0
    });
  }

  removeLoss(lossIndex) {
    this.coolingLossesService.setDelete(lossIndex);
  }

  renameLosses() {
    let index = 1;
    this._coolingLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    if (loss.coolingMedium == 'Gas' || loss.coolingMedium == 'Air') {
      if (loss.gasCoolingForm.status == 'VALID') {
        let tmpGasCoolingLoss: GasCoolingLoss = this.coolingLossesService.initGasLossFromForm(loss.gasCoolingForm);
        loss.heatLoss = this.phastService.gasCoolingLosses(tmpGasCoolingLoss, this.settings);
      } else {
        loss.heatLoss = null;
      }
    }
    else if (loss.coolingMedium == 'Liquid') {
      if (loss.liquidCoolingForm.status == 'VALID') {
        let tmpLiquidCoolingLoss: LiquidCoolingLoss = this.coolingLossesService.initLiquidLossFromForm(loss.liquidCoolingForm);
        loss.heatLoss = this.phastService.liquidCoolingLosses(tmpLiquidCoolingLoss, this.settings);
      } else {
        loss.heatLoss = null;
      }
    }
    else if (loss.coolingMedium == 'Water') {
      if (loss.waterCoolingForm.status == 'VALID') {
        let tmpWaterCoolingLoss: WaterCoolingLoss = this.coolingLossesService.initWaterLossFromForm(loss.waterCoolingForm);
        loss.heatLoss = this.phastService.waterCoolingLosses(tmpWaterCoolingLoss);
      } else {
        loss.heatLoss = null;
      }
    }
  }

  saveLosses() {
    let tmpCoolingLosses = new Array<CoolingLoss>();
    this._coolingLosses.forEach(loss => {
      let tmpCoolingLoss: CoolingLoss;
      if (loss.coolingMedium == 'Gas' || loss.coolingMedium == 'Air') {
        tmpCoolingLoss = {
          coolingLossType: 'Gas',
          gasCoolingLoss: this.coolingLossesService.initGasLossFromForm(loss.gasCoolingForm),
          heatLoss: loss.heatLoss
        };
      }
      else if (loss.coolingMedium == 'Liquid') {
        tmpCoolingLoss = {
          coolingLossType: 'Liquid',
          liquidCoolingLoss: this.coolingLossesService.initLiquidLossFromForm(loss.liquidCoolingForm),
          heatLoss: loss.heatLoss
        };
      }
      else if (loss.coolingMedium == 'Water') {
        tmpCoolingLoss = {
          coolingLossType: 'Water',
          waterCoolingLoss: this.coolingLossesService.initWaterLossFromForm(loss.waterCoolingForm),
          heatLoss: loss.heatLoss
        };
      }
      tmpCoolingLosses.push(tmpCoolingLoss);
    })
    this.losses.coolingLosses = tmpCoolingLosses;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.coolingLossesCompareService.baselineCoolingLosses = this.losses.coolingLosses;
    } else {
      this.coolingLossesCompareService.modifiedCoolingLosses = this.losses.coolingLosses;
    }
    if (this.coolingLossesCompareService.differentArray) {
      if (this.coolingLossesCompareService.differentArray.length != 0 && !this.isBaseline) {
        this.coolingLossesCompareService.checkCoolingLosses();
      }
    }
  }
}
