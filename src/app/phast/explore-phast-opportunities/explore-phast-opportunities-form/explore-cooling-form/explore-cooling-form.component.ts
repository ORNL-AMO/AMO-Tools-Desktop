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

  baselineLosses: Array<LiquidCoolingLoss | GasCoolingLoss>;
  modifiedLosses: Array<LiquidCoolingLoss | GasCoolingLoss>;
  constructor() { }

  ngOnInit() {
    let index = 0;
    this.phast.losses.coolingLosses.forEach(loss => {
      if(loss.coolingLossType == 'Liquid'){
        this.baselineLosses.push(loss.liquidCoolingLoss);
      }else if(loss.coolingLossType == 'Gas'){
        this.baselineLosses.push(loss.gasCoolingLoss);
      }
      if(this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].coolingLossType == 'Liquid'){
        this.modifiedLosses.push(loss.liquidCoolingLoss)
      }else if(this.phast.modifications[this.exploreModIndex].phast.losses.coolingLosses[index].coolingLossType == 'Gas'){
        this.modifiedLosses.push(loss.gasCoolingLoss);
      }
    })
  }

}
