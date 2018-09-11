import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LiquidCoolingLoss, GasCoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { LossTab } from '../../../tabs';
import { GasCoolingWarnings, LiquidCoolingWarnings, CoolingLossesService } from '../../../losses/cooling-losses/cooling-losses.service';
@Component({
  selector: 'app-explore-cooling-form',
  templateUrl: './explore-cooling-form.component.html',
  styleUrls: ['./explore-cooling-form.component.css']
})
export class ExploreCoolingFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('changeTab')
  changeTab = new EventEmitter<LossTab>();

  baselineLosses: Array<{ loss: LiquidCoolingLoss | GasCoolingLoss, type: string, name: string }>;
  modifiedLosses: Array<{ loss: LiquidCoolingLoss | GasCoolingLoss, type: string, name: string }>;
  showCooling: boolean = false;
  showFlowRate: Array<boolean>;
  showTemp: Array<boolean>;
  baselineWarnings: Array<{ flowWarning: string, tempWarning: string }>;
  modificationWarnings: Array<{ flowWarning: string, tempWarning: string }>;
  constructor(private coolingLossesService: CoolingLossesService) { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.showCooling = false;
        this.initData();
      }
    }
  }

  initData() {
    this.baselineWarnings
    this.baselineLosses = new Array();
    this.modifiedLosses = new Array();
    this.showFlowRate = new Array<boolean>();
    this.baselineWarnings = new Array<{ flowWarning: string, tempWarning: string }>();
    this.modificationWarnings = new Array<{ flowWarning: string, tempWarning: string }>();
    this.showTemp = new Array<boolean>();

    let index = 0;
    this.phast.losses.coolingLosses.forEach(loss => {
      if (loss.coolingLossType == 'Liquid') {
        this.baselineLosses.push({ loss: loss.liquidCoolingLoss, type: 'Liquid', name: loss.name });
        let tmpWarnings: { flowWarning: string, tempWarning: string } = this.getLiquidWarnings(loss.liquidCoolingLoss);
        this.baselineWarnings.push(tmpWarnings)
      } else if (loss.coolingLossType == 'Gas') {
        this.baselineLosses.push({ loss: loss.gasCoolingLoss, type: 'Gas', name: loss.name });
        let tmpWarnings: { flowWarning: string, tempWarning: string } = this.getGasWarnings(loss.gasCoolingLoss);
        this.baselineWarnings.push(tmpWarnings)
      }
      if (this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].coolingLossType == 'Liquid') {
        this.modifiedLosses.push({ loss: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].liquidCoolingLoss, type: 'Liquid', name: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].name })
        let tmpWarnings: { flowWarning: string, tempWarning: string } = this.getLiquidWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].liquidCoolingLoss);
        this.modificationWarnings.push(tmpWarnings)
      } else if (this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].coolingLossType == 'Gas') {
        this.modifiedLosses.push({ loss: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].gasCoolingLoss, type: 'Gas', name: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].name });
        let tmpWarnings: { flowWarning: string, tempWarning: string } = this.getGasWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].gasCoolingLoss);
        this.modificationWarnings.push(tmpWarnings)
      }
      let check: boolean = (this.baselineLosses[index].loss.flowRate != this.modifiedLosses[index].loss.flowRate);
      if (!this.showCooling && check) {
        this.showCooling = check;
      }

      this.showFlowRate.push(check);
      check = (this.baselineLosses[index].loss.initialTemperature != this.modifiedLosses[index].loss.initialTemperature)
      if (!check && this.baselineLosses[index].type == this.modifiedLosses[index].type) {
        if (this.baselineLosses[index].type == 'Gas') {
          check = (this.baselineLosses[index].loss.finalTemperature != this.modifiedLosses[index].loss.finalTemperature)
        } else if (this.baselineLosses[index].type == 'Liquid') {
          check = (this.baselineLosses[index].loss.outletTemperature != this.modifiedLosses[index].loss.outletTemperature)
        }
      }
      if (!this.showCooling && check) {
        this.showCooling = check;
      }
      this.showTemp.push(check);
      index++
    })
  }

  getLiquidWarnings(liquidCoolingLoss: LiquidCoolingLoss): { flowWarning: string, tempWarning: string } {
    let tmpLiquidCoolingWarnings: LiquidCoolingWarnings = this.coolingLossesService.checkLiquidWarnings(liquidCoolingLoss);
    return { flowWarning: tmpLiquidCoolingWarnings.liquidFlowWarning, tempWarning: tmpLiquidCoolingWarnings.temperatureWarning };
  }

  getGasWarnings(gasCoolingLoss: GasCoolingLoss): { flowWarning: string, tempWarning: string } {
    let tmpGasCoolingWarnings: GasCoolingWarnings = this.coolingLossesService.checkGasWarnings(gasCoolingLoss);
    return { flowWarning: tmpGasCoolingWarnings.gasFlowWarning, tempWarning: tmpGasCoolingWarnings.temperatureWarning };
  }

  toggleCooling() {
    if (this.showCooling == false) {
      let index = 0;
      this.baselineLosses.forEach(loss => {
        if (loss.type == this.modifiedLosses[index].type) {
          this.modifiedLosses[index].loss.flowRate = loss.loss.flowRate;
          this.modifiedLosses[index].loss.initialTemperature = loss.loss.initialTemperature;
          this.checkModificationWarning(this.modifiedLosses[index], index)
        }
      })
    }
  }

  toggleFlowRate(index: number, obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }) {
    if (this.showFlowRate[index] == false) {
      if (obj.type == this.modifiedLosses[index].type) {
        this.modifiedLosses[index].loss.flowRate = obj.loss.flowRate;
      }
      this.checkModificationWarning(this.modifiedLosses[index], index)
    }
  }

  // checkFlowRate(num: number, flowRate: number, index: number) {
  //   if (flowRate < 0) {
  //     if (num == 1) {
  //       this.flowError1[index] = 'Flow rate must be equal or greater than 0';
  //     } else if (num == 2) {
  //       this.flowError2[index] = 'Flow rate must be equal or greater than 0';
  //     }
  //   } else {
  //     if (num == 1) {
  //       this.flowError1[index] = null;
  //     } else if (num == 2) {
  //       this.flowError2[index] = null;
  //     }
  //   }
  //   this.calculate();
  // }

  toggleTemp(index: number, obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }) {
    if (this.showTemp[index] == false) {
      if (obj.type == this.modifiedLosses[index].type) {
        this.modifiedLosses[index].loss.initialTemperature = obj.loss.initialTemperature;
        if (obj.type == 'Gas') {
          this.modifiedLosses[index].loss.finalTemperature = obj.loss.finalTemperature;
        } else if (obj.type == 'Liquid') {
          this.modifiedLosses[index].loss.outletTemperature = obj.loss.outletTemperature;
        }
        this.checkModificationWarning(this.modifiedLosses[index], index)
      }
    }
  }

  // checkTemp(num: number, obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }, index: number) {
  //   if (obj.type == this.modifiedLosses[index].type) {
  //     if (obj.type == 'Liquid') {
  //       if (obj.loss.initialTemperature > this.modifiedLosses[index].loss.outletTemperature) {
  //         if (num == 1) {
  //           this.tempError1[index] = 'Inlet temperature greater the outlet temperature.';
  //         } else if (num == 2) {
  //           this.tempError2[index] = 'Inlet temperature greater the outlet temperature.';
  //         }
  //       } else {
  //         this.noTempError(num, index);
  //       }
  //     } else if (obj.type == 'Gas') {
  //       if (obj.loss.initialTemperature > this.modifiedLosses[index].loss.finalTemperature) {
  //         if (num == 1) {
  //           this.tempError1[index] = 'Inlet temperature greater the outlet temperature.';
  //         } else if (num == 2) {
  //           this.tempError2[index] = 'Inlet temperature greater the outlet temperature.';
  //         }
  //       } else {
  //         this.noTempError(num, index);
  //       }
  //     }
  //   }
  //   else {
  //     this.noTempError(num, index);
  //   }
  //   this.calculate();
  // }

  // noTempError(num: number, index: number) {
  //   if (num == 1) {
  //     this.tempError1[index] = null;
  //   } else if (num == 2) {
  //     this.tempError2[index] = null;
  //   }
  // }

  checkBaselineWarning(obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }, index: number) {
    let tmpWarnings: { flowWarning: string, tempWarning: string };
    if (obj.type == 'Gas') {
      tmpWarnings = this.getGasWarnings(obj.loss);
    } else if (obj.type == 'Liquid') {
      tmpWarnings = this.getLiquidWarnings(obj.loss);
    }
    this.baselineWarnings[index] = tmpWarnings;
    this.calculate();
  }

  checkModificationWarning(obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }, index: number) {
    let tmpWarnings: { flowWarning: string, tempWarning: string };
    if (obj.type == 'Gas') {
      tmpWarnings = this.getGasWarnings(obj.loss);
    } else if (obj.type == 'Liquid') {
      tmpWarnings = this.getLiquidWarnings(obj.loss);
    }
    this.modificationWarnings[index] = tmpWarnings;
    console.log(this.modificationWarnings);
    this.calculate();
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Cooling',
      componentStr: 'cooling-losses',
    });
  }

  focusOut() {
    this.changeField.emit('default');
  }

  calculate() {
    this.emitCalculate.emit(true)
  }
}
