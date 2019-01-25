import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PsatResultsData, ReportRollupService } from '../../report-rollup.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';


@Component({
  selector: 'app-psat-rollup-energy-table',
  templateUrl: './psat-rollup-energy-table.component.html',
  styleUrls: ['./psat-rollup-energy-table.component.css']
})
export class PsatRollupEnergyTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  resultData: Array<PsatResultsData>;
  @Input()
  totalEnergyUse: number;
  @Input()
  totalCost: number;
  @Input()
  graphColors: Array<string>;

  // graphColors: Array<string>;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    // this.graphColors = graphColors;
  }

  getTotalCostPercent(value: number) {
    if (this.totalCost) {
      let percent = (value / this.totalCost) * 100;
      let val = this.reportRollupService.transform(percent, 4)
      return val;
    }
  }

  getTotalEnergyPercent(value: number) {
    if (this.totalEnergyUse) {
      let percent = (value / this.totalEnergyUse) * 100;
      let val = this.reportRollupService.transform(percent, 4)
      return val;    }
  }

}
