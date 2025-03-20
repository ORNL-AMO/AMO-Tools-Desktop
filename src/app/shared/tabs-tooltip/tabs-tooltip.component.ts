import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-tabs-tooltip',
    templateUrl: './tabs-tooltip.component.html',
    styleUrls: ['./tabs-tooltip.component.css'],
    standalone: false
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
    this.setMessage();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.badgeClass) {
      if (this.badgeClass !== undefined) {
        this.setMessage();
      }
    }
  }


  setMessage() {
    if (this.badgeClass == 'loss-different') {
      this.message = 'Different from Baseline';
    } else if (this.badgeClass == 'input-error') {
      this.message = 'Input Warning';
    }
    else if (this.badgeClass == 'missing-data') {
      this.message = 'Invalid Input';
    }
    else if (this.badgeClass == 'success') {
      this.message = 'No Changes';
    }
  }
}
