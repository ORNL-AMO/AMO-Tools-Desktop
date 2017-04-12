import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';

@Component({
  selector: 'app-chart-summary',
  templateUrl: './chart-summary.component.html',
  styleUrls: ['./chart-summary.component.css']
})
export class ChartSummaryComponent implements OnInit {
  @Input()
  psat: PSAT;

  columnStyle: string = 'col-8';

  constructor() { }

  ngOnInit() {
    this.setColumns();
  }

  setColumns() {
    if (this.psat.modifications) {
      if (this.psat.modifications.length == 1) {
        this.columnStyle = 'col-6';
      }
      else if (this.psat.modifications.length == 2) {
        this.columnStyle = 'col-4';
      }
      else if (this.psat.modifications.length == 3) {
        this.columnStyle = 'col-3';
      }
    }
  }

}
