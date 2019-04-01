import { Component, OnInit, Input } from '@angular/core';
import { OtherCostItem, OpportunitySheet, OpportunityCost } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-costs-form',
  templateUrl: './costs-form.component.html',
  styleUrls: ['./costs-form.component.css']
})
export class CostsFormComponent implements OnInit {
  @Input()
  opportunityCost: OpportunityCost;

  // otherCosts: Array<OtherCostItem> = [];
  // additionalSavings: OtherCostItem;
  constructor() { }

  ngOnInit() {
  }

  addOtherCost() {
    this.opportunityCost.otherCosts.push(
      {
        description: 'Other Cost #' + (this.opportunityCost.otherCosts.length + 1),
        cost: 0.0
      }
    )
  }

  addAdditionalSavings() {
    this.opportunityCost.additionalSavings = {
      description: 'Other Savings',
      cost: 0.0
    }
  }

  removeOtherCostItem(index: number){
    this.opportunityCost.otherCosts.splice(index, 1);
  }


  removeAdditionalSavings(){
    this.opportunityCost.additionalSavings = undefined;
  }
}
