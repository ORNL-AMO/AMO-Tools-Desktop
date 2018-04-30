import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LiquidCoolingLoss, GasCoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { LossTab } from '../../../tabs';
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

  baselineLosses: Array<{ loss: LiquidCoolingLoss | GasCoolingLoss, type: string }>;
  modifiedLosses: Array<{ loss: LiquidCoolingLoss | GasCoolingLoss, type: string }>;
  showCooling: boolean = false;
  showFlowRate: Array<boolean>;
  showTemp: Array<boolean>;
  flowError1: Array<string>;
  flowError2: Array<string>;
  tempError1: Array<string>;
  tempError2: Array<string>;
  constructor() { }

  ngOnInit() {
    this.baselineLosses = new Array();
    this.modifiedLosses = new Array();
    this.showFlowRate = new Array<boolean>();
    this.flowError1 = new Array<string>();
    this.flowError2 = new Array<string>();
    this.tempError1 = new Array<string>();
    this.tempError2 = new Array<string>();
    this.showTemp = new Array<boolean>();

    let index = 0;
    this.phast.losses.coolingLosses.forEach(loss => {
      this.flowError1.push(null);
      this.flowError2.push(null);
      this.tempError1.push(null);
      this.tempError2.push(null);
      if (loss.coolingLossType == 'Liquid') {
        this.baselineLosses.push({ loss: loss.liquidCoolingLoss, type: 'Liquid' });
      } else if (loss.coolingLossType == 'Gas') {
        this.baselineLosses.push({ loss: loss.gasCoolingLoss, type: 'Gas' });
      }
      if (this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].coolingLossType == 'Liquid') {
        this.modifiedLosses.push({ loss: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].liquidCoolingLoss, type: 'Liquid' })
      } else if (this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].coolingLossType == 'Gas') {
        this.modifiedLosses.push({ loss: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].gasCoolingLoss, type: 'Gas' });
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
    })
  }


  toggleCooling() {
    if (this.showCooling == false) {
      let index = 0;
      this.baselineLosses.forEach(loss => {
        if (loss.type == this.modifiedLosses[index].type) {
          this.modifiedLosses[index].loss.flowRate = loss.loss.flowRate;
          this.modifiedLosses[index].loss.initialTemperature = loss.loss.initialTemperature;
        }
      })
    }
  }

  toggleFlowRate(index: number, obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }) {
    if (this.showFlowRate[index] == false) {
      if (obj.type == this.modifiedLosses[index].type) {
        this.modifiedLosses[index].loss.flowRate = obj.loss.flowRate;
      }
    }
  }

  checkFlowRate(num: number, flowRate: number, index: number) {
    if (flowRate < 0) {
      if (num == 1) {
        this.flowError1[index] = 'Flow rate must be equal or greater than 0';
      } else if (num == 2) {
        this.flowError2[index] = 'Flow rate must be equal or greater than 0';
      }
    } else {
      if (num == 1) {
        this.flowError1[index] = null;
      } else if (num == 2) {
        this.flowError2[index] = null;
      }
    }
    this.calculate();
  }

  toggleTemp(index: number, obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }) {
    if (this.showTemp[index] == false) {
      if (obj.type == this.modifiedLosses[index].type) {
        this.modifiedLosses[index].loss.initialTemperature = obj.loss.initialTemperature;
        if (obj.type == 'Gas') {
          this.modifiedLosses[index].loss.finalTemperature = obj.loss.finalTemperature;
        } else if (obj.type == 'Liquid') {
          this.modifiedLosses[index].loss.outletTemperature = obj.loss.outletTemperature;
        }
      }
    }
  }

  checkTemp(num: number, obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }, index: number) {
    if (obj.type == this.modifiedLosses[index].type) {
      if (obj.type == 'Liquid') {
        if (obj.loss.initialTemperature > this.modifiedLosses[index].loss.outletTemperature) {
          if (num == 1) {
            this.tempError1[index] = 'Inlet temperature greater the outlet temperature.';
          } else if (num == 2) {
            this.tempError2[index] = 'Inlet temperature greater the outlet temperature.';
          }
        } else {
          this.noTempError(num, index);
        }
      } else if (obj.type == 'Gas') {
        if (obj.loss.initialTemperature > this.modifiedLosses[index].loss.finalTemperature) {
          if (num == 1) {
            this.tempError1[index] = 'Inlet temperature greater the outlet temperature.';
          } else if (num == 2) {
            this.tempError2[index] = 'Inlet temperature greater the outlet temperature.';
          }
        } else {
          this.noTempError(num, index);
        }
      }
    }
    else {
      this.noTempError(num, index);
    }
    this.calculate();
  }

  noTempError(num: number, index: number) {
    if (num == 1) {
      this.tempError1[index] = null;
    } else if (num == 2) {
      this.tempError2[index] = null;
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Cooling',
      componentStr: 'cooling-losses',
    });
  }

  focusOut() {

  }

  calculate() {
    this.emitCalculate.emit(true)
  }
}
