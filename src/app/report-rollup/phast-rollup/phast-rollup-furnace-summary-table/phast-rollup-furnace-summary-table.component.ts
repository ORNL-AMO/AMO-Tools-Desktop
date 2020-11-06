import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PhastResultsService } from '../../../phast/phast-results.service';
import { PhastResultsData } from '../../report-rollup-models';
import { PhastReportRollupService } from '../../phast-report-rollup.service';

@Component({
  selector: 'app-phast-rollup-furnace-summary-table',
  templateUrl: './phast-rollup-furnace-summary-table.component.html',
  styleUrls: ['./phast-rollup-furnace-summary-table.component.css']
})
export class PhastRollupFurnaceSummaryTableComponent implements OnInit {
  @Input()
  settings: Settings;

  tableData: Array<TableDataItem>;

  constructor(private convertUnitsService: ConvertUnitsService, private phastResultsService: PhastResultsService,
    private phastReportRollupService: PhastReportRollupService) { }

  ngOnInit() {
    this.tableData = new Array();
    //use copy for conversions
    let phastResultsCpy: Array<PhastResultsData> = JSON.parse(JSON.stringify(this.phastReportRollupService.selectedPhastResults));
    phastResultsCpy.forEach(resultItem => {
      let tableRow: TableDataItem = this.getTableRow(resultItem);
      this.tableData.push(tableRow);
    });
  }

  getTableRow(resultItem: PhastResultsData): TableDataItem {
    resultItem.baselineResults.energyPerMass = this.getConvertedValue(resultItem.baselineResults.energyPerMass, resultItem.settings);
    resultItem.modificationResults.energyPerMass = this.getConvertedValue(resultItem.modificationResults.energyPerMass, resultItem.settings);
    return {
      baselineName: resultItem.name,
      modificationName: resultItem.modName,
      baselineEnergyIntensity: resultItem.baselineResults.energyPerMass,
      modiedEnergyIntensity: resultItem.modificationResults.energyPerMass,
      baselineAvailableHeat: this.phastResultsService.getAvailableHeat(resultItem.baselineResultData, resultItem.settings),
      modifiedAvailableHeat: this.phastResultsService.getAvailableHeat(resultItem.modificationResultData, resultItem.settings),
      baselineAnnualCost: resultItem.baselineResults.annualCost,
      modiedAnnualCost: resultItem.modificationResults.annualCost,
      costSavings: resultItem.baselineResults.annualCost - resultItem.modificationResults.annualCost,
      implementationCost: resultItem.modificationResults.implementationCosts,
      paybackPeriod: resultItem.modificationResults.paybackPeriod
    }
  }

  getConvertedValue(val: number, settings: Settings) {
    return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
  }

}


export interface TableDataItem {
  modificationName: string,
  baselineName: string,
  baselineEnergyIntensity: number,
  modiedEnergyIntensity: number,
  baselineAvailableHeat: number,
  modifiedAvailableHeat: number,
  baselineAnnualCost: number,
  modiedAnnualCost: number,
  costSavings: number,
  implementationCost: number,
  paybackPeriod: number
}