import { Component, OnInit, SimpleChanges, Input } from '@angular/core';

@Component({
  selector: 'app-modify-conditions-tabs-tooltip',
  templateUrl: './modify-conditions-tabs-tooltip.component.html',
  styleUrls: ['./modify-conditions-tabs-tooltip.component.css']
})
export class ModifyConditionsTabsTooltipComponent implements OnInit {
  @Input()
  badgeClass: Array<string>;
  @Input()
  reveal: boolean;
  @Input()
  display: boolean;

  message: string;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.badgeClass) {
      if (this.badgeClass !== undefined) {
        this.setMessage();
      }
    }
  }

  setMessage() {
    if (this.badgeClass[0] == 'loss-different') {
      this.message = "Different from baseline scenario.";
    }
    else if (this.badgeClass[0] == 'input-error') {
      this.message = "There is an input error.";
    }
    else if (this.badgeClass[0] == 'missing-data') {
      this.message = "There is missing data.";
    }
    else if (this.badgeClass[0] == 'success') {
      this.message = "Scenario is all good.";
    }
  }
}
