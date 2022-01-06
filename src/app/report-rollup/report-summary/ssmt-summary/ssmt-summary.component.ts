import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { SsmtReportRollupService } from '../../ssmt-report-rollup.service';
import { ReportRollupService } from '../../report-rollup.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { ReportSummaryGraphsService } from '../../report-summary-graphs/report-summary-graphs.service';

@Component({
  selector: 'app-ssmt-summary',
  templateUrl: './ssmt-summary.component.html',
  styleUrls: ['./ssmt-summary.component.css', '../report-summary.component.css']
})
export class SsmtSummaryComponent implements OnInit {

  settings: Settings;
  ssmtSavingPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  selectedSub: Subscription;
  numSsmt: number;

  constructor(public ssmtReportRollupService: SsmtReportRollupService, private reportRollupService: ReportRollupService, private reportSummaryGraphService: ReportSummaryGraphsService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.settings.getValue();
    this.assessmentSub = this.ssmtReportRollupService.ssmtAssessments.subscribe(val => {
      this.numSsmt = val.length;
      if (val.length != 0) {
        this.ssmtReportRollupService.setAllSsmtResults(val);
        this.ssmtReportRollupService.initSsmtCompare();
      }
    });
    this.selectedSub = this.ssmtReportRollupService.selectedSsmt.subscribe(val => {
      if (val.length != 0) {
        this.ssmtReportRollupService.setSsmtResultsFromSelected(val);
        this.calcSsmtSums();
        this.getSteamPieChartData();
        this.getTotalEnergy();
        this.getTotalFuel();
      }
    });
  }

  ngOnDestroy() {
    this.assessmentSub.unsubscribe();
    this.selectedSub.unsubscribe();
  }

  calcSsmtSums() {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    this.ssmtReportRollupService.selectedSsmtResults.forEach(result => {
      let diffCost = result.baselineResults.operationsOutput.totalOperatingCost - result.modificationResults.operationsOutput.totalOperatingCost;
      sumSavings += diffCost;
      sumCost += result.modificationResults.operationsOutput.totalOperatingCost;
      let diffEnergy = result.baselineResults.operationsOutput.boilerFuelUsage - result.modificationResults.operationsOutput.boilerFuelUsage;
      sumEnergySavings += diffEnergy;
      sumEnergy += result.modificationResults.operationsOutput.boilerFuelUsage;
    })
    this.ssmtSavingPotential = sumSavings;
    this.energySavingsPotential = this.convertUnitsService.value(sumEnergySavings).from('MMBtu').to(this.settings.steamRollupUnit);
    this.totalCost = sumCost;
    this.totalEnergy = this.convertUnitsService.value(sumEnergy).from('MMBtu').to(this.settings.steamRollupUnit);
  }

  getSteamPieChartData(){
    let steamArray: Array<PieChartDataItem>;
    steamArray = this.reportSummaryGraphService.reportSummaryGraphData.getValue();
    let pieChartData: PieChartDataItem = {
      equipmentName: 'Steam',
      energyUsed: this.totalEnergy + this.energySavingsPotential,
      annualCost: this.totalCost,
      energySavings: this.energySavingsPotential,
      costSavings: this.ssmtSavingPotential,
      percentCost: this.ssmtSavingPotential / this.totalCost * 100,
      percentEnergy: this.energySavingsPotential / this.totalEnergy * 100,
      color: '#F39C12',
      currencyUnit: this.settings.currency
    }

    steamArray.push(pieChartData);
    this.reportSummaryGraphService.reportSummaryGraphData.next(steamArray);
  }

  getTotalEnergy(){
    let steamTotalEnergy = this.totalEnergy + this.energySavingsPotential;
    this.reportSummaryGraphService.calculateTotalEnergyUsed(steamTotalEnergy);
  }

  getTotalFuel(){
    let steamTotalFuel = this.totalEnergy + this.energySavingsPotential;
    this.reportSummaryGraphService.calculateTotalFuelUsed(steamTotalFuel);
  }

}
