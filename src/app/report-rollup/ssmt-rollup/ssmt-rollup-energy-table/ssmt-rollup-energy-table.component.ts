import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService } from '../../report-rollup.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { SsmtResultsData } from '../../report-rollup-models';

@Component({
  selector: 'app-ssmt-rollup-energy-table',
  templateUrl: './ssmt-rollup-energy-table.component.html',
  styleUrls: ['./ssmt-rollup-energy-table.component.css']
})
export class SsmtRollupEnergyTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  resultData: Array<SsmtResultsData>;
  @Input()
  totalEnergyUse: number;
  @Input()
  totalCost: number;
  @Input()
  graphColors: Array<string>;

  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.graphColors = graphColors;
  }

  getTotalCostPercent(value: number) {
    if (this.totalCost) {
      let percent = (value / this.totalCost) * 100;
      let val = this.reportRollupService.transform(percent, 4);
      return val;
    }
  }

  getTotalEnergyPercent(value: number) {
    if (this.totalEnergyUse) {
      let percent = (value / this.totalEnergyUse) * 100;
      let val = this.reportRollupService.transform(percent, 4);
      return val;
    }
  }
}
