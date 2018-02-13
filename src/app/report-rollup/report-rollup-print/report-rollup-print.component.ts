import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-report-rollup-print',
  templateUrl: './report-rollup-print.component.html',
  styleUrls: ['./report-rollup-print.component.css']
})
export class ReportRollupPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  constructor() { }

  ngOnInit() {
    
  }

}
