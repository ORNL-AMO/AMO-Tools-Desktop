import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';

@Component({
  selector: 'app-output-summary',
  templateUrl: './output-summary.component.html',
  styleUrls: ['./output-summary.component.css']
})
export class OutputSummaryComponent implements OnInit {
  @Input()
  baseline: PSAT;
  
  constructor() { }

  ngOnInit() {
  }

}
