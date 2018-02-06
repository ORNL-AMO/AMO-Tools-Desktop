import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { ReportRollupService, PhastResultsData } from '../../report-rollup.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { SigFigsPipe } from '../../../shared/sig-figs.pipe';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';


@Component({
  selector: 'app-phast-rollup-energy-use-table',
  templateUrl: './phast-rollup-energy-use-table.component.html',
  styleUrls: ['./phast-rollup-energy-use-table.component.css']
})
export class PhastRollupEnergyUseTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  resultData: Array<PhastResultsData>;
  @Input()
  graphColors: Array<string>;
  @Input()
  totalSteamEnergyUsed: number;
  @Input()
  totalElectricalEnergyUsed: number;
  @Input()
  totalFuelEnergyUsed: number;
  @Input()
  totalFuelCost: number;
  @Input()
  totalSteamCost: number;
  @Input()
  totalElectricalCost: number;
  @Input()
  totalEnergy: number;
  @Input()
  totalCost: number;

  constructor(private reportRollupService: ReportRollupService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {

  }

  getConvertedValue(val: number, settings: Settings) {
    return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
  }

  getResultPercent(value: number, sum: number): number {
    let percent = (value / sum) * 100;
    let val = this.reportRollupService.transform(percent, 4)
    return val;
  }

  getConvertedPercent(value: number, sum: number, settings: Settings) {
    let convertVal = this.getConvertedValue(value, settings);
    let percent = (convertVal / sum) * 100;
    let val = this.reportRollupService.transform(percent, 4)
    return val;
  }
}
