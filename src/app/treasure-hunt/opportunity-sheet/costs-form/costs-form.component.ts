import { Component, OnInit } from '@angular/core';
import { OtherCostItem } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-costs-form',
  templateUrl: './costs-form.component.html',
  styleUrls: ['./costs-form.component.css']
})
export class CostsFormComponent implements OnInit {

  otherCosts: Array<OtherCostItem> = [];
  additionalSavings: OtherCostItem;
  constructor() { }

  ngOnInit() {
  }

  addOtherCost() {
    this.otherCosts.push(
      {
        description: 'Other Cost #' + this.otherCosts.length,
        cost: 0.0
      }
    )
  }

  addAdditionalSavings() {
    this.additionalSavings = {
      description: 'Other Savings',
      cost: 0.0
    }
  }
}
