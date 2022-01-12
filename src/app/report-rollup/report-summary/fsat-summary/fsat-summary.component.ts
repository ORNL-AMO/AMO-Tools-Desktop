import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { FsatReportRollupService } from '../../fsat-report-rollup.service';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { ReportSummaryGraphsService } from '../../report-summary-graphs/report-summary-graphs.service';

@Component({
  selector: 'app-fsat-summary',
  templateUrl: './fsat-summary.component.html',
  styleUrls: ['./fsat-summary.component.css', '../report-summary.component.css']
})
export class FsatSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  
  fanSavingPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  selectedSub: Subscription;
  numFsats: number;
  constructor(public fsatReportRollupService: FsatReportRollupService, private reportSummaryGraphService: ReportSummaryGraphsService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.assessmentSub = this.fsatReportRollupService.fsatAssessments.subscribe(val => {
      this.numFsats = val.length;
      if (val.length != 0) {
        this.fsatReportRollupService.setAllFsatResults(val);
        this.fsatReportRollupService.initFsatCompare();
      }
    });

    this.selectedSub = this.fsatReportRollupService.selectedFsats.subscribe(val => {
      if (val.length != 0) {
        this.fsatReportRollupService.setFsatResultsFromSelected(val);
        this.calcFsatSums();
        this.getFsatPieChartData();
        this.getTotalElectricity();
        this.getTotalEnergy();
      }
    });
  }

  ngOnDestroy() {
    this.assessmentSub.unsubscribe();
    this.selectedSub.unsubscribe();
  }

  calcFsatSums() {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    this.fsatReportRollupService.selectedFsatResults.forEach(result => {
      let diffCost = result.baselineResults.annualCost - result.modificationResults.annualCost;
      sumSavings += diffCost;
      sumCost += result.modificationResults.annualCost;
      let diffEnergy = result.baselineResults.annualEnergy - result.modificationResults.annualEnergy;
      sumEnergySavings += diffEnergy;
      sumEnergy += result.modificationResults.annualEnergy;
    })
    if(this.settings.fansRollupUnit !== 'MWh'){
      this.energySavingsPotential = this.convertUnitsService.value(sumEnergySavings).from('MWh').to(this.settings.fansRollupUnit);
      this.totalEnergy = this.convertUnitsService.value(sumEnergy).from('MWh').to(this.settings.fansRollupUnit);
    } else {
      this.energySavingsPotential = sumEnergySavings;
      this.totalEnergy = sumEnergy;
    }
    this.fanSavingPotential = sumSavings;
    this.totalCost = sumCost;
  }

  getFsatPieChartData(){
    let fsatArray: Array<PieChartDataItem>;
    fsatArray = this.reportSummaryGraphService.reportSummaryGraphData.getValue();
    let pieChartData: PieChartDataItem = {
      equipmentName: 'Fans',
      energyUsed: this.convertUnitsService.value((this.totalEnergy + this.energySavingsPotential)).from(this.settings.fansRollupUnit).to(this.settings.commonRollupUnit),
      annualCost: this.totalCost,
      energySavings: this.energySavingsPotential,
      costSavings: this.fanSavingPotential,
      percentCost: this.fanSavingPotential / this.totalCost * 100,
      percentEnergy: this.energySavingsPotential / this.totalEnergy * 100,
      color: '#FFE400',
      currencyUnit: this.settings.currency
    }

    fsatArray.push(pieChartData);
    this.reportSummaryGraphService.reportSummaryGraphData.next(fsatArray);
  }

  getTotalEnergy(){
    let fsatTotalEnergy = this.convertUnitsService.value((this.totalEnergy + this.energySavingsPotential)).from(this.settings.fansRollupUnit).to(this.settings.commonRollupUnit);
    this.reportSummaryGraphService.calculateTotalEnergyUsed(fsatTotalEnergy);
  }

  getTotalElectricity(){
    let fsatTotalElectricity = this.convertUnitsService.value((this.totalEnergy + this.energySavingsPotential)).from(this.settings.fansRollupUnit).to(this.settings.commonRollupUnit);
    this.reportSummaryGraphService.calculateTotalElectricityUsed(fsatTotalElectricity);
  }

}
