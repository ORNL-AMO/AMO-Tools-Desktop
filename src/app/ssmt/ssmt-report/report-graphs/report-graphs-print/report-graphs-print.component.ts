import { Component, OnInit, Input } from '@angular/core';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { ReportGraphsService } from '../report-graphs.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-report-graphs-print',
  templateUrl: './report-graphs-print.component.html',
  styleUrls: ['./report-graphs-print.component.css']
})
export class ReportGraphsPrintComponent implements OnInit {
  @Input()
  ssmtOptions: Array<{ name: string, ssmt: SSMT, index: number }>;
  @Input()
  settings: Settings;
  @Input()
  modExists: boolean;

  baselineSsmt: { name: string, ssmt: SSMT, index: number };
  graphColors: Array<string>;
  constructor(private reportGraphsService: ReportGraphsService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.baselineSsmt = this.ssmtOptions[0];
  }

  

}
