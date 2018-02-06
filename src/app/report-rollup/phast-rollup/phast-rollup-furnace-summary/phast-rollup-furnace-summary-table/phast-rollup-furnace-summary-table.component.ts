import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { PhastResultsData } from '../../../report-rollup.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
import { PhastResultsService } from '../../../../phast/phast-results.service';

@Component({
  selector: 'app-phast-rollup-furnace-summary-table',
  templateUrl: './phast-rollup-furnace-summary-table.component.html',
  styleUrls: ['./phast-rollup-furnace-summary-table.component.css']
})
export class PhastRollupFurnaceSummaryTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  resultData: Array<PhastResultsData>;
  @Input()
  printView: boolean;

  constructor(private phastResultsService: PhastResultsService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
  }


  getConvertedValue(val: number, settings: Settings) {
    return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
  }

  getAvailableHeat(data: PhastResults, settings: Settings) {
    let resultCategories: ShowResultsCategories = this.phastResultsService.getResultCategories(settings);
    if (resultCategories.showFlueGas) {
      return data.flueGasAvailableHeat;
    }

    if (resultCategories.showSystemEff) {
      return data.heatingSystemEfficiency;
    }

    if (resultCategories.showEnInput2) {
      return data.availableHeatPercent;
    }

    if (resultCategories.showExGas) {
      return (1 - (data.totalExhaustGasEAF / data.grossHeatInput)) * 100
    }
  }
}
