import { Component, OnInit, Input } from '@angular/core';
import { OpportunitySummary, OpportunityCost } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-opportunity-summary',
  templateUrl: './opportunity-summary.component.html',
  styleUrls: ['./opportunity-summary.component.css']
})
export class OpportunitySummaryComponent implements OnInit {
  @Input()
  opportunitySummaries: Array<OpportunitySummary>;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

  getMaterialCost(oppCost: OpportunityCost): number {
    if (oppCost){
      return oppCost.material;
    }else{
      return 0;
    }
  }

  getLaborCost(oppCost: OpportunityCost): number {
    if (oppCost){
      return oppCost.labor;
    }else{
      return 0;
    }
  }

  getOtherCost(oppCost: OpportunityCost): number {
    if (oppCost && oppCost.otherCosts && oppCost.otherCosts.length != 0){
      let total: number = 0;
      oppCost.otherCosts.forEach(oCost => {
        total = total + oCost.cost;
      })
      return total;
    }else{
      return 0;
    }
  }
}
