import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OpportunityCost } from '../../../../shared/models/treasure-hunt';

@Component({
    selector: 'app-costs-form',
    templateUrl: './costs-form.component.html',
    styleUrls: ['./costs-form.component.css'],
    standalone: false
})
export class CostsFormComponent implements OnInit {
  @Input()
  opportunityCost: OpportunityCost;
  @Output('emitChangeField')
  emitChangefield = new EventEmitter<string>();
  // otherCosts: Array<OtherCostItem> = [];
  // additionalSavings: OtherCostItem;
  effortLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  constructor() { }

  ngOnInit() {
    if (!this.opportunityCost.costDescription) {
      this.opportunityCost.costDescription = 'Any details that will be useful for implementation i.e. math, who is responsible, how to implement, where data came from.';
    }
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
      description: 'Rebate Savings',
      cost: 0.0
    }
  }

  removeOtherCostItem(index: number) {
    this.opportunityCost.otherCosts.splice(index, 1);
  }

  removeAdditionalSavings() {
    this.opportunityCost.additionalSavings = undefined;
  }

  addAdditionalAnnualSavings() {
    this.opportunityCost.additionalAnnualSavings = {
      description: 'Other Annual Savings',
      cost: 0.0
    }
  }

  removeAdditionalAnnualSavings() {
    this.opportunityCost.additionalAnnualSavings = undefined;
  }

  focusField(str: string) {
    this.emitChangefield.emit(str);
  }
}
