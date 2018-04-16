import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-losses-tabs-tooltip',
  templateUrl: './losses-tabs-tooltip.component.html',
  styleUrls: ['./losses-tabs-tooltip.component.css']
})
export class LossesTabsTooltipComponent implements OnInit {
  @Input()
  numLosses: number;
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
      this.message = "different from baseline";
    }
    else if (this.badgeClass[0] == 'input-error') {
      this.message = "input error";
    }
    else if (this.badgeClass[0] == 'missing-data') {
      this.message = "missing data";
    }
    else if (this.badgeClass[0] == 'success') {
      this.message = "all good";
    }
  }
}
