import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { PsatReportRollupService } from '../../psat-report-rollup.service';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { ReportSummaryGraphsService } from '../../report-summary-graphs/report-summary-graphs.service';

@Component({
  selector: 'app-psat-summary',
  templateUrl: './psat-summary.component.html',
  styleUrls: ['./psat-summary.component.css', '../report-summary.component.css']
})
export class PsatSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  pumpSavingsPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  selectedSub: Subscription;
  numPsats: number;
  constructor(public psatReportRollupService: PsatReportRollupService, private reportSummaryGraphService: ReportSummaryGraphsService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.assessmentSub = this.psatReportRollupService.psatAssessments.subscribe(val => {
      this.numPsats = val.length;
      if (val.length !== 0) {
        this.psatReportRollupService.setAllPsatResults(val);
        this.psatReportRollupService.initPsatCompare();
      }
    });

    this.selectedSub = this.psatReportRollupService.selectedPsats.subscribe(val => {
      if (val.length !== 0) {
        this.psatReportRollupService.setResultsFromSelected(val);
        this.calcPsatSums();
        this.getPsatPieChartData();
        this.getTotalEnergy();
        this.getTotalElectricity();
      }
    });
  }

  ngOnDestroy() {
    this.assessmentSub.unsubscribe();
    this.selectedSub.unsubscribe();
  }

  calcPsatSums() {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    this.psatReportRollupService.selectedPsatResults.forEach(result => {
      let diffCost = result.baselineResults.annual_cost - result.modificationResults.annual_cost;
      sumSavings += diffCost;
      sumCost += result.modificationResults.annual_cost;
      let diffEnergy = result.baselineResults.annual_energy - result.modificationResults.annual_energy;
      sumEnergySavings += diffEnergy;
      sumEnergy += result.modificationResults.annual_energy;
    });
    this.pumpSavingsPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }

  getPsatPieChartData(){
    let psatArray: Array<PieChartDataItem>;
    psatArray = this.reportSummaryGraphService.reportSummaryGraphData.getValue();
    let pieChartData: PieChartDataItem = {
      equipmentName: 'Pumps',
      energyUsed: this.convertUnitsService.value((this.totalEnergy + this.energySavingsPotential)).from('MWh').to(this.settings.energyResultUnit),
      annualCost: this.totalCost,
      energySavings: this.energySavingsPotential,
      costSavings: this.pumpSavingsPotential,
      percentCost: this.pumpSavingsPotential / this.totalCost * 100,
      percentEnergy: this.energySavingsPotential / this.totalEnergy * 100,
      color: '#2980b9',
      currencyUnit: this.settings.currency
    }
    psatArray.push(pieChartData);
    this.reportSummaryGraphService.reportSummaryGraphData.next(psatArray);
  }

  getTotalEnergy(){
    let psatTotalEnergy = this.convertUnitsService.value((this.totalEnergy + this.energySavingsPotential)).from('MWh').to(this.settings.energyResultUnit);
    this.reportSummaryGraphService.calculateTotalEnergyUsed(psatTotalEnergy);
  }

  getTotalElectricity(){
    let psatTotalElectricity = this.convertUnitsService.value((this.totalEnergy + this.energySavingsPotential)).from('MWh').to(this.settings.energyResultUnit);
    this.reportSummaryGraphService.calculateTotalElectricityUsed(psatTotalElectricity);
  }
  
}
