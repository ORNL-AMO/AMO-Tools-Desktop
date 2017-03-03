import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-psat-report',
  templateUrl: './psat-report.component.html',
  styleUrls: ['./psat-report.component.css']
})
export class PsatReportComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Output('closeReport')
  closeReport = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  closeAssessment() {
    this.closeReport.emit(true);
  }

}
