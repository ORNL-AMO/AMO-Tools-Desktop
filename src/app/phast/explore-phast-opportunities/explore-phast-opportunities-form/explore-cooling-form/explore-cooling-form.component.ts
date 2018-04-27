import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LiquidCoolingLoss, GasCoolingLoss } from '../../../../shared/models/phast/losses/coolingLoss';
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

  baselineLosses: Array<{ loss: LiquidCoolingLoss | GasCoolingLoss, type: string }>;
  modifiedLosses: Array<{ loss: LiquidCoolingLoss | GasCoolingLoss, type: string }>;
  showCooling: boolean = false;
  showFlowRate: Array<boolean>;
  liquidFlowError1: Array<string>;
  liquidFlowError2: Array<string>;
  gasFlowError1: Array<string>;
  gasFlowError2: Array<string>;

  constructor() { }

  ngOnInit() {
    this.baselineLosses = new Array();
    this.modifiedLosses = new Array();
    this.showFlowRate = new Array<boolean>();
    this.liquidFlowError1 = new Array<string>();
    this.liquidFlowError2 = new Array<string>();
    this.gasFlowError1 = new Array<string>();
    this.gasFlowError2 = new Array<string>();

    let index = 0;
    this.phast.losses.coolingLosses.forEach(loss => {
      this.showFlowRate.push(false);
      this.liquidFlowError1.push(null);
      this.liquidFlowError2.push(null);
      this.gasFlowError1.push(null);
      this.gasFlowError2.push(null);
      if (loss.coolingLossType == 'Liquid') {
        console.log(loss.liquidCoolingLoss)
        this.baselineLosses.push({ loss: loss.liquidCoolingLoss, type: 'Liquid' });
      } else if (loss.coolingLossType == 'Gas') {
        this.baselineLosses.push({ loss: loss.gasCoolingLoss, type: 'Gas' });
      }
      if (this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].coolingLossType == 'Liquid') {
        this.modifiedLosses.push({ loss: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].liquidCoolingLoss, type: 'Liquid' })
      } else if (this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].coolingLossType == 'Gas') {
        this.modifiedLosses.push({ loss: this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].gasCoolingLoss, type: 'Gas' });
      }
    })
  }


  toggleCooling() {

  }

  toggleFeedRate() {

  }


  checkLiquidFlow() {

  }

  checkGasFlow() {

  }








  focusField(str: string) {
    this.changeField.emit(str);
    //   this.changeTab.emit( {
    //     tabName: 'Charge Material',
    //     step: 1,
    //     next: 2,
    //     componentStr: 'charge-material',
    //     showAdd: true  
    // });
  }

  focusOut() {

  }

  calculate() {
    this.emitCalculate.emit(true)
  }
}
