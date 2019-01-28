import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { ReportRollupService, PhastResultsData } from '../../report-rollup.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
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

  convertedSumFuel: number;
  convertedSumElectricity: number;
  convertedSumSteam: number;
  constructor(private reportRollupService: ReportRollupService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
  }

  getConvertedValue(val: number, settings: Settings, convertTo: string) {
    return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(convertTo);
  }

  getResultPercent(value: number, sum: number): number {
    let percent = (value / sum) * 100;
    let val = this.reportRollupService.transform(percent, 4)
    return val;
  }

  getConvertedPercent(value: number, sum: number, settings: Settings) {
    let convertVal = this.getConvertedValue(value, settings, this.settings.phastRollupUnit);
    let percent = (convertVal / sum) * 100;
    let val = this.reportRollupService.transform(percent, 4)
    return val;
  }

  getFuelTotal() {
    return this.convertUnitsService.value(this.totalFuelEnergyUsed).from(this.settings.phastRollupUnit).to(this.settings.phastRollupFuelUnit);
  }

  getElectricityTotal() {
    return this.convertUnitsService.value(this.totalElectricalEnergyUsed).from(this.settings.phastRollupUnit).to(this.settings.phastRollupElectricityUnit);
  }

  getSteamTotal() {
    return this.convertUnitsService.value(this.totalSteamEnergyUsed).from(this.settings.phastRollupUnit).to(this.settings.phastRollupSteamUnit);
  }

}
