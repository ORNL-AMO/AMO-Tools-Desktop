import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Adjustment, PSAT } from '../../shared/models/psat';

@Component({
  selector: 'app-psat-report',
  templateUrl: './psat-report.component.html',
  styleUrls: ['./psat-report.component.css']
})
export class PsatReportComponent implements OnInit {
  @Input()
  baseline: PSAT;
  @Output('closeReport')
  closeReport = new EventEmitter();
  constructor() { }

  ngOnInit() {
    console.log(this.baseline)
  }

  closeAssessment() {
    this.closeReport.emit(true);
  }

}
