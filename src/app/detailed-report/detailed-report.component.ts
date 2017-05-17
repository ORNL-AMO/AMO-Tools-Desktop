import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { PSAT } from '../shared/models/psat';

@Component({
  selector: 'app-detailed-report',
  templateUrl: './detailed-report.component.html',
  styleUrls: ['./detailed-report.component.css']
})
export class DetailedReportComponent implements OnInit {
  @Input()
  assessments: Array<Assessment>;


  constructor() { }

  ngOnInit() {
  }

}
