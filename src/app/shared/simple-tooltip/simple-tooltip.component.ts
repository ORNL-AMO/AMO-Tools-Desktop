import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-simple-tooltip',
  templateUrl: './simple-tooltip.component.html',
  styleUrls: ['./simple-tooltip.component.css']
})
export class SimpleTooltipComponent implements OnInit {
  @Input()
  message: string;
  @Input()
  hover: boolean;
  @Input()
  display: boolean;

  constructor() { }

  ngOnInit() {
    if (this.message === null || this.message === undefined) {
      this.message = "This is a placeholder tool tip.";
    }
  }

  ngOnChanges(changes: SimpleChanges) {
  }


}
