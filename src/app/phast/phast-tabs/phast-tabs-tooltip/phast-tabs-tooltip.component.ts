import { Component, OnInit, SimpleChanges, Input } from '@angular/core';

@Component({
  selector: 'app-phast-tabs-tooltip',
  templateUrl: './phast-tabs-tooltip.component.html',
  styleUrls: ['./phast-tabs-tooltip.component.css']
})
export class PhastTabsTooltipComponent implements OnInit {
  @Input()
  badgeClass: string;
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
    if (this.badgeClass == 'input-error') {
      this.message = "input error";
    }
    else if (this.badgeClass == 'missing-data') {
      this.message = "missing data";
    }
    else if (this.badgeClass == 'success') {
      this.message = "all good";
    }
  }
}
