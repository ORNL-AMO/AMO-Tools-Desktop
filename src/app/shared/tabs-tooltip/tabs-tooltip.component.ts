import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-tabs-tooltip',
  templateUrl: './tabs-tooltip.component.html',
  styleUrls: ['./tabs-tooltip.component.css']
})
export class TabsTooltipComponent implements OnInit {
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
