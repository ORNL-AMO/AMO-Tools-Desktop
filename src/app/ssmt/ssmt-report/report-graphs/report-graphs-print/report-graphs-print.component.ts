import { Component, OnInit, Input } from '@angular/core';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { SSMTLosses } from '../../../../shared/models/steam/steam-outputs';

@Component({
    selector: 'app-report-graphs-print',
    templateUrl: './report-graphs-print.component.html',
    styleUrls: ['./report-graphs-print.component.css'],
    standalone: false
})
export class ReportGraphsPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  ssmt: SSMT;
  @Input()
  baselineLosses: SSMTLosses;
  @Input()
  modificationLosses: Array<{ outputData: SSMTLosses, name: string }>;
  @Input()
  xAxisRange: number;

  constructor() { }

  ngOnInit() {
  }
}
