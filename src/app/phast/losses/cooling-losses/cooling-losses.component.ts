import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { CoolingLossesService } from './cooling-losses.service';
import { Losses } from '../../../shared/models/phast/phast';
import { CoolingLoss, GasCoolingLoss, LiquidCoolingLoss } from '../../../shared/models/phast/losses/coolingLoss';
import { CoolingLossesCompareService } from './cooling-losses-compare.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

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
  @Input()
  isLossesSetup: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  modExists: boolean;

  showError: boolean = false;

  _coolingLosses: Array<CoolingLossObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  disableType: boolean = false;
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
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }

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
          this.saveLosses();
        }
      }
    })
    // if (this.isBaseline) {
    //   this.coolingLossesService.addLossBaselineMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._coolingLosses.push({
    //         coolingMedium: 'Gas',
    //         waterCoolingForm: this.coolingLossesService.initWaterCoolingForm(),
    //         gasCoolingForm: this.coolingLossesService.initGasCoolingForm(this.settings),
    //         liquidCoolingForm: this.coolingLossesService.initLiquidCoolingForm(this.settings),
    //         name: 'Loss #' + (this._coolingLosses.length + 1),
    //         heatLoss: 0.0,
    //         collapse: false
    //       });
    //     }
    //   })
    // } else {
    //   this.coolingLossesService.addLossModificationMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._coolingLosses.push({
    //         coolingMedium: 'Gas',
    //         waterCoolingForm: this.coolingLossesService.initWaterCoolingForm(),
    //         gasCoolingForm: this.coolingLossesService.initGasCoolingForm(this.settings),
    //         liquidCoolingForm: this.coolingLossesService.initLiquidCoolingForm(this.settings),
    //         name: 'Loss #' + (this._coolingLosses.length + 1),
    //         heatLoss: 0.0,
    //         collapse: false
    //       });
    //     }
    //   })
    // }
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
      this.disableForms();
    }
  }

  ngOnDestroy() {
    if (this.isBaseline) {
      // this.coolingLossesService.addLossBaselineMonitor.next(false);
      this.coolingLossesCompareService.baselineCoolingLosses = null;
    } else {
      //this.coolingLossesService.addLossModificationMonitor.next(false);
      this.coolingLossesCompareService.modifiedCoolingLosses = null;
    }
    this.coolingLossesService.deleteLossIndex.next(null);
  }
  disableForms() {
    this._coolingLosses.forEach(loss => {
      loss.gasCoolingForm.disable();
      loss.liquidCoolingForm.disable();
    })
  }
  initCoolingLosses() {
    let lossIndex = 1;
    this.losses.coolingLosses.forEach(loss => {
      let tmpLoss: any;
      if (loss.coolingLossType == 'Gas' || loss.coolingLossType == 'Air') {
        tmpLoss = {
          coolingMedium: loss.coolingLossType,
          gasCoolingForm: this.coolingLossesService.initGasFormFromLoss(loss),
          liquidCoolingForm: this.coolingLossesService.initLiquidCoolingForm(this.settings, lossIndex),
          heatLoss: loss.heatLoss || 0.0,
          collapse: false
        };
      } else if (loss.coolingLossType == 'Liquid') {
        tmpLoss = {
          coolingMedium: loss.coolingLossType,
          gasCoolingForm: this.coolingLossesService.initGasCoolingForm(this.settings, lossIndex),
          liquidCoolingForm: this.coolingLossesService.initLiquidFormFromLoss(loss),
          heatLoss: loss.heatLoss || 0.0,
          collapse: false
        };
      }
     
      if (!tmpLoss.gasCoolingForm.controls.name.value) {
        tmpLoss.gasCoolingForm.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      if (!tmpLoss.liquidCoolingForm.controls.name.value) {
        tmpLoss.gasCoolingForm.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      lossIndex++;
      this.calculate(tmpLoss);
      this._coolingLosses.push(tmpLoss);
    })
  }

  addLoss() {
    // if (this.isLossesSetup) {
    //   this.coolingLossesService.addLoss(this.isBaseline);
    // }
    if (this.coolingLossesCompareService.differentArray) {
      this.coolingLossesCompareService.addObject(this.coolingLossesCompareService.differentArray.length - 1);
    }
    this._coolingLosses.push({
      coolingMedium: 'Gas',
      gasCoolingForm: this.coolingLossesService.initGasCoolingForm(this.settings, this._coolingLosses.length + 1),
      liquidCoolingForm: this.coolingLossesService.initLiquidCoolingForm(this.settings, this._coolingLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  setName(loss: CoolingLossObj) {
    if (loss.coolingMedium == 'Gas') {
      loss.liquidCoolingForm.patchValue({
        name: loss.gasCoolingForm.controls.name.value
      })
    } else if (loss.coolingMedium == 'Liquid') {
      loss.gasCoolingForm.patchValue({
        name: loss.liquidCoolingForm.controls.name.value
      })
    }
  }

  removeLoss(lossIndex) {
    this.coolingLossesService.setDelete(lossIndex);
  }
  calculate(loss: CoolingLossObj) {
    if (loss.coolingMedium == 'Gas' || loss.coolingMedium == 'Air') {
      if (loss.gasCoolingForm.status == 'VALID') {
        let tmpCoolingLoss: CoolingLoss = this.coolingLossesService.initGasLossFromForm(loss.gasCoolingForm);
        loss.heatLoss = this.phastService.gasCoolingLosses(tmpCoolingLoss.gasCoolingLoss, this.settings);
      } else {
        loss.heatLoss = null;
      }
    }
    else if (loss.coolingMedium == 'Liquid') {
      if (loss.liquidCoolingForm.status == 'VALID') {
        let tmpCoolingLoss: CoolingLoss = this.coolingLossesService.initLiquidLossFromForm(loss.liquidCoolingForm);
        loss.heatLoss = this.phastService.liquidCoolingLosses(tmpCoolingLoss.liquidCoolingLoss, this.settings);
      } else {
        loss.heatLoss = null;
      }
    }
  }

  saveLosses() {
    let tmpCoolingLosses = new Array<CoolingLoss>();
    let lossIndex = 1;
    this._coolingLosses.forEach(loss => {
      if (!loss.gasCoolingForm.controls.name.value) {
        loss.gasCoolingForm.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      if (!loss.liquidCoolingForm.controls.name.value) {
        loss.gasCoolingForm.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      let tmpCoolingLoss: CoolingLoss;
      if (loss.coolingMedium == 'Gas' || loss.coolingMedium == 'Air') {
        tmpCoolingLoss = this.coolingLossesService.initGasLossFromForm(loss.gasCoolingForm);
        tmpCoolingLoss.coolingLossType = 'Gas';
        tmpCoolingLoss.heatLoss = loss.heatLoss;
      }
      else if (loss.coolingMedium == 'Liquid') {
        tmpCoolingLoss = this.coolingLossesService.initLiquidLossFromForm(loss.liquidCoolingForm);
        tmpCoolingLoss.coolingLossType = 'Liquid';
        tmpCoolingLoss.heatLoss = loss.heatLoss;
      }
      tmpCoolingLosses.push(tmpCoolingLoss);
      lossIndex++;
    })

    this.losses.coolingLosses = tmpCoolingLosses;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }
  collapseLoss(loss: CoolingLossObj) {
    loss.collapse = !loss.collapse;
  }
  changeField(str: string) {
    this.fieldChange.emit(str);
  }
  focusOut() {
    this.fieldChange.emit('default');
  }
  setError(bool: boolean){
    console.log(bool)
    this.showError = bool;
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

export interface CoolingLossObj {
  coolingMedium: string,
  gasCoolingForm: FormGroup,
  liquidCoolingForm: FormGroup,
  heatLoss: number,
  collapse: boolean
}
