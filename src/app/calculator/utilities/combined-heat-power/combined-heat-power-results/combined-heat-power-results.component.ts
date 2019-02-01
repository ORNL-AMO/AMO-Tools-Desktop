import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { CombinedHeatPowerOutput } from '../../../../shared/models/standalone';
@Component({
  selector: 'app-combined-heat-power-results',
  templateUrl: './combined-heat-power-results.component.html',
  styleUrls: ['./combined-heat-power-results.component.css']
})
export class CombinedHeatPowerResultsComponent implements OnInit {
  @Input()
  results: CombinedHeatPowerOutput;

  @ViewChild('copyTable') copyTable: ElementRef;
  tableString: any;
  constructor() { }

  ngOnInit() {
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
