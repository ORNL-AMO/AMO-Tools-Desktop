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
  @Input()
  direction: string;

  //these positions will need to be adjusted for the tooltip
  //depending on what type of graph it is being added to.
  //adjustLeft should match the value in the css class for the button element,
  //adjustTop/adjustBottom, should be the value - 50
  //If the class uses percentages, provide [adjustPercent]="true", otherwise keep it false.
  //Look for these classes in 'app.component.css' to get the appropriate values:
  //  '.percent-chart-btn'
  //  '.percent-chart-table-btn'
  //  '.pie-chart-btn'
  //  '.bar-chart-btn'
  //  '.rollup-bar-chart-btn'
  // OR
  // you may need to find #gridToggle in the line chart css classes
  // Example: motor-performance-graph.component.css: '#gridToggle'
  // All in all, keep adjusting those values in the parent components until it is formatted correctly.
  @Input()
  adjustLeft: number;
  @Input()
  adjustTop: number;
  @Input()
  adjustBottom: number;
  @Input()
  adjustPercent: boolean;

  adjustLeftStr: string;
  adjustTopStr: string;
  adjustBottomStr: string;



  constructor() { }

  ngOnInit() {
    if (this.message === null || this.message === undefined) {
      this.message = "This is a placeholder tool tip.";
    }
    if (this.adjustLeft === null || this.adjustLeft === undefined) {
      this.adjustLeft = 0;
    }
    if ((this.adjustTop === null || this.adjustTop === undefined) && (this.adjustBottom === null || this.adjustBottom === undefined)) {
      //this.adjustTop = 0;
    }

    if (this.adjustPercent) {
      this.adjustLeftStr = this.adjustLeft + "%";
      this.adjustTopStr = this.adjustTop + "%";
      this.adjustBottomStr = this.adjustBottom + "%";
    }
    else {
      this.adjustLeftStr = this.adjustLeft + "px";
      this.adjustTopStr = this.adjustTop + "px";
      this.adjustBottomStr = this.adjustBottom + "px";
    }
  }

  ngOnChanges(changes: SimpleChanges) {
  }


}
