import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LiquidCoolingLoss, GasCoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
import { LossTab } from '../../../tabs';
import { CoolingFormService, GasCoolingWarnings, LiquidCoolingWarnings } from '../../../../calculator/furnaces/cooling/cooling-form.service';
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
  showFlowRate: Array<boolean>;
  showTemp: Array<boolean>;
  baselineWarnings: Array<{ flowWarning: string, tempWarning: string }>;
  modificationWarnings: Array<{ flowWarning: string, tempWarning: string }>;
  constructor(private coolingFormService: CoolingFormService) { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initData();
      }
    }
  }
  initData() {
    this.baselineWarnings;
    this.baselineLosses = new Array();
    this.modifiedLosses = new Array();
    this.showFlowRate = new Array<boolean>();
    this.baselineWarnings = new Array<{ flowWarning: string, tempWarning: string }>();
    this.modificationWarnings = new Array<{ flowWarning: string, tempWarning: string }>();
    this.showTemp = new Array<boolean>();
    this.phast.modifications[this.exploreModIndex].exploreOppsShowCooling = { hasOpportunity: false, display: 'Optimize or Improve Furnace Cooling System' }; 

    let index = 0;
    this.phast.losses.coolingLosses.forEach(loss => {
      if (loss.coolingLossType === 'Liquid') {
        this.baselineLosses.push({ loss: loss.liquidCoolingLoss, type: 'Liquid', name: loss.name });
        let tmpWarnings: { flowWarning: string, tempWarning: string } = this.getLiquidWarnings(loss.liquidCoolingLoss);
        this.baselineWarnings.push(tmpWarnings);
      } else if (loss.coolingLossType === 'Gas') {
        this.baselineLosses.push({ loss: loss.gasCoolingLoss, type: 'Gas', name: loss.name });
        let tmpWarnings: { flowWarning: string, tempWarning: string } = this.getGasWarnings(loss.gasCoolingLoss);
        this.baselineWarnings.push(tmpWarnings);
      }
      if (this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].coolingLossType === 'Liquid') {
        this.modifiedLosses.push({ loss: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].liquidCoolingLoss, type: 'Liquid', name: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].name });
        let tmpWarnings: { flowWarning: string, tempWarning: string } = this.getLiquidWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].liquidCoolingLoss);
        this.modificationWarnings.push(tmpWarnings);
      } else if (this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].coolingLossType === 'Gas') {
        this.modifiedLosses.push({ loss: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].gasCoolingLoss, type: 'Gas', name: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].name });
        let tmpWarnings: { flowWarning: string, tempWarning: string } = this.getGasWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].gasCoolingLoss);
        this.modificationWarnings.push(tmpWarnings);
      }
      let check: boolean = (this.baselineLosses[index].loss.flowRate !== this.modifiedLosses[index].loss.flowRate);
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowCooling.hasOpportunity && check) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowCooling = { hasOpportunity: check, display: 'Optimize or Improve Furnace Cooling System' }; 
      }

      this.showFlowRate.push(check);
      check = (this.baselineLosses[index].loss.initialTemperature !== this.modifiedLosses[index].loss.initialTemperature);
      if (!check && this.baselineLosses[index].type === this.modifiedLosses[index].type) {
        if (this.baselineLosses[index].type === 'Gas') {
          check = (this.baselineLosses[index].loss.finalTemperature !== this.modifiedLosses[index].loss.finalTemperature);
        } else if (this.baselineLosses[index].type === 'Liquid') {
          check = (this.baselineLosses[index].loss.outletTemperature !== this.modifiedLosses[index].loss.outletTemperature);
        }
      }
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowCooling.hasOpportunity && check) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowCooling = { hasOpportunity: check, display: 'Optimize or Improve Furnace Cooling System' }; 
      }
      this.showTemp.push(check);
      index++;
    });
  }

  getLiquidWarnings(liquidCoolingLoss: LiquidCoolingLoss): { flowWarning: string, tempWarning: string } {
    let tmpLiquidCoolingWarnings: LiquidCoolingWarnings = this.coolingFormService.checkLiquidWarnings(liquidCoolingLoss);
    return { flowWarning: tmpLiquidCoolingWarnings.liquidFlowWarning, tempWarning: tmpLiquidCoolingWarnings.temperatureWarning };
  }

  getGasWarnings(gasCoolingLoss: GasCoolingLoss): { flowWarning: string, tempWarning: string } {
    let tmpGasCoolingWarnings: GasCoolingWarnings = this.coolingFormService.checkGasWarnings(gasCoolingLoss);
    return { flowWarning: tmpGasCoolingWarnings.gasFlowWarning, tempWarning: tmpGasCoolingWarnings.temperatureWarning };
  }

  toggleCooling() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowCooling.hasOpportunity === false) {
      let index = 0;
      this.baselineLosses.forEach(loss => {
        if (loss.type === this.modifiedLosses[index].type) {
          this.modifiedLosses[index].loss.flowRate = loss.loss.flowRate;
          this.modifiedLosses[index].loss.initialTemperature = loss.loss.initialTemperature;
          this.checkModificationWarning(this.modifiedLosses[index], index);
        }
      });
    }
  }

  toggleFlowRate(index: number, obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }) {
    if (this.showFlowRate[index] === false) {
      if (obj.type === this.modifiedLosses[index].type) {
        this.modifiedLosses[index].loss.flowRate = obj.loss.flowRate;
      }
      this.checkModificationWarning(this.modifiedLosses[index], index);
    }
  }

  toggleTemp(index: number, obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }) {
    if (this.showTemp[index] === false) {
      if (obj.type === this.modifiedLosses[index].type) {
        this.modifiedLosses[index].loss.initialTemperature = obj.loss.initialTemperature;
        if (obj.type === 'Gas') {
          this.modifiedLosses[index].loss.finalTemperature = obj.loss.finalTemperature;
        } else if (obj.type === 'Liquid') {
          this.modifiedLosses[index].loss.outletTemperature = obj.loss.outletTemperature;
        }
        this.checkModificationWarning(this.modifiedLosses[index], index);
      }
    }
  }

  checkBaselineWarning(obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }, index: number) {
    let tmpWarnings: { flowWarning: string, tempWarning: string };
    if (obj.type === 'Gas') {
      tmpWarnings = this.getGasWarnings(obj.loss);
    } else if (obj.type === 'Liquid') {
      tmpWarnings = this.getLiquidWarnings(obj.loss);
    }
    this.baselineWarnings[index] = tmpWarnings;
    this.calculate();
  }

  checkModificationWarning(obj: { loss: LiquidCoolingLoss | GasCoolingLoss, type: string }, index: number) {
    let tmpWarnings: { flowWarning: string, tempWarning: string };
    if (obj.type === 'Gas') {
      tmpWarnings = this.getGasWarnings(obj.loss);
    } else if (obj.type === 'Liquid') {
      tmpWarnings = this.getLiquidWarnings(obj.loss);
    }
    this.modificationWarnings[index] = tmpWarnings;
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
    this.emitCalculate.emit(true);
  }
}
