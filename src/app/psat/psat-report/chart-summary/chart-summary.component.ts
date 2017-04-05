import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';

@Component({
  selector: 'app-chart-summary',
  templateUrl: './chart-summary.component.html',
  styleUrls: ['./chart-summary.component.css']
})
export class ChartSummaryComponent implements OnInit {
  @Input()
  baseline: PSAT;

  columnStyle: string;

  constructor() { }

  ngOnInit() {
    this.setColumns();
  }

  setColumns() {
    if (this.baseline.modifications.length == 1) {
      this.columnStyle = 'col-6';
    }
    else if (this.baseline.modifications.length == 2) {
      this.columnStyle = 'col-4';
    }
    else if (this.baseline.modifications.length == 3) {
      this.columnStyle = 'col-3';
    }
  }

}
