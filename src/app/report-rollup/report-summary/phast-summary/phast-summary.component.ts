import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Subscription } from 'rxjs';
import { PhastReportRollupService } from '../../phast-report-rollup.service';
import { ReportRollupService } from '../../report-rollup.service';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { ReportSummaryGraphsService } from '../../report-summary-graphs/report-summary-graphs.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-phast-summary',
  templateUrl: './phast-summary.component.html',
  styleUrls: ['./phast-summary.component.css', '../report-summary.component.css']
})
export class PhastSummaryComponent implements OnInit {
  settings: Settings;
  furnaceSavingsPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  numPhasts: number;
  selectedPhastSub: Subscription;
  phastAssessmentsSub: Subscription;
  constructor(public phastReportRollupService: PhastReportRollupService, private convertUnitsService: ConvertUnitsService,
    private reportRollupService: ReportRollupService, private reportSummaryGraphService: ReportSummaryGraphsService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.settings.getValue();
    this.phastAssessmentsSub = this.phastReportRollupService.phastAssessments.subscribe(items => {
      this.numPhasts = items.length;
      if (items) {
        this.phastReportRollupService.setAllPhastResults(items);
        this.phastReportRollupService.initPhastCompare();
      }
    });
    this.selectedPhastSub = this.phastReportRollupService.selectedPhasts.subscribe(val => {
      if (val.length !== 0) {
        this.phastReportRollupService.setPhastResultsFromSelected(val);
        this.calcPhastSums();
        this.getPhastPieChartData();
        this.getPhastEnergyData();
        this.getTotalEnergy();
      }
    });
  }

  ngOnDestroy() {
    this.selectedPhastSub.unsubscribe();
    this.phastAssessmentsSub.unsubscribe();
  }

  calcPhastSums() {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    this.phastReportRollupService.selectedPhastResults.forEach(result => {
      let diffCost = result.modificationResults.annualCostSavings;
      sumSavings += diffCost;
      sumCost += result.modificationResults.annualCost;
      let diffEnergy = this.convertUnitsService.value(result.modificationResults.annualEnergySavings).from(result.settings.energyResultUnit).to(this.settings.phastRollupUnit);
      sumEnergySavings += diffEnergy;
      sumEnergy += this.convertUnitsService.value(result.modificationResults.annualEnergyUsed).from(result.settings.energyResultUnit).to(this.settings.phastRollupUnit);;
    });
    this.furnaceSavingsPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }

  getPhastPieChartData(){
    let phastArray: Array<PieChartDataItem>;
    phastArray = this.reportSummaryGraphService.reportSummaryGraphData.value;
    let pieChartData: PieChartDataItem = {
      equipmentName: 'Furnaces',
      energyUsed: this.convertUnitsService.value((this.totalEnergy + this.energySavingsPotential)).from(this.settings.phastRollupUnit).to(this.settings.commonRollupUnit),
      annualCost: this.totalCost,
      energySavings: this.energySavingsPotential,
      costSavings: this.furnaceSavingsPotential,
      percentCost: this.furnaceSavingsPotential / this.totalCost * 100,
      percentEnergy: this.energySavingsPotential / this.totalEnergy * 100,
      color: '#bf3d00',
      currencyUnit: this.settings.currency
    }

    phastArray.push(pieChartData);
    this.reportSummaryGraphService.reportSummaryGraphData.next(phastArray);
  }

  getPhastEnergyData(){      
    this.phastReportRollupService.selectedPhastResults.forEach(result => {
      let diffEnergy = this.convertUnitsService.value(result.modificationResults.annualEnergySavings).from(this.settings.phastRollupUnit).to(this.settings.commonRollupUnit);
      let sumEnergySavings = diffEnergy;
      let sumEnergy = this.convertUnitsService.value(result.modificationResults.annualEnergyUsed).from(this.settings.phastRollupUnit).to(this.settings.commonRollupUnit);

      if(result.settings.energySourceType === 'Steam'){
        let phastFuelEnergy = sumEnergy + sumEnergySavings;
        this.reportSummaryGraphService.calculateTotalFuelUsed(phastFuelEnergy);
      }
      if(result.settings.energySourceType === 'Fuel'){
        let phastFuelEnergy = sumEnergy + sumEnergySavings;
        this.reportSummaryGraphService.calculateTotalFuelUsed(phastFuelEnergy);
      }
      if(result.settings.energySourceType === 'Electricity'){
        let phastTotalElectricity = sumEnergy + sumEnergySavings;
        this.reportSummaryGraphService.calculateTotalElectricityUsed(phastTotalElectricity);
      }      
      
    }); 
   
  }

  getTotalEnergy(){
    let phastTotalEnergy = this.convertUnitsService.value((this.totalEnergy + this.energySavingsPotential)).from(this.settings.phastRollupUnit).to(this.settings.commonRollupUnit);
    this.reportSummaryGraphService.calculateTotalEnergyUsed(phastTotalEnergy);
  }

  

}
