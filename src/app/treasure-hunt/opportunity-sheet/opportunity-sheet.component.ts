import { Component, OnInit } from '@angular/core';
import { OtherCostItem } from '../../shared/models/treasure-hunt';

@Component({
  selector: 'app-opportunity-sheet',
  templateUrl: './opportunity-sheet.component.html',
  styleUrls: ['./opportunity-sheet.component.css']
})
export class OpportunitySheetComponent implements OnInit {


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
