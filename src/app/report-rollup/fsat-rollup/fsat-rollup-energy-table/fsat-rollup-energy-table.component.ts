import { Component, OnInit, Input } from '@angular/core';
import { FsatResultsData, ReportRollupService } from '../../report-rollup.service';
import { Settings } from '../../../shared/models/settings';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-fsat-rollup-energy-table',
  templateUrl: './fsat-rollup-energy-table.component.html',
  styleUrls: ['./fsat-rollup-energy-table.component.css']
})
export class FsatRollupEnergyTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  resultData: Array<FsatResultsData>;
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
      let val = this.reportRollupService.transform(percent, 4)
      return val;
    }
  }

  getTotalEnergyPercent(value: number) {
    if (this.totalEnergyUse) {
      let percent = (value / this.totalEnergyUse) * 100;
      let val = this.reportRollupService.transform(percent, 4)
      return val;
    }
  }
}
