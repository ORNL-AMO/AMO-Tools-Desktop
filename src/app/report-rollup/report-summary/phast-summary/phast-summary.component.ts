import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Subscription } from 'rxjs';
import { PhastResultsData } from '../../report-rollup-models';
import { PhastReportRollupService } from '../../phast-report-rollup.service';
import { ReportRollupService } from '../../report-rollup.service';

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
  resultsSub: Subscription;
  numPhasts: number;
  allPhastSub: Subscription;
  selectedPhastSub: Subscription;
  phastAssessmentsSub: Subscription;
  constructor(public phastReportRollupService: PhastReportRollupService, private convertUnitsService: ConvertUnitsService,
    private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.settings.getValue();
    this.resultsSub = this.phastReportRollupService.phastResults.subscribe(val => {
      this.numPhasts = val.length;
      if (val.length !== 0) {
        this.calcPhastSums(val);
      }
    });
    this.allPhastSub = this.phastReportRollupService.allPhastResults.subscribe(val => {
      if (val.length !== 0) {
        this.phastReportRollupService.initPhastCompare(val);
      }
    });
    this.selectedPhastSub = this.phastReportRollupService.selectedPhasts.subscribe(val => {
      if (val.length !== 0) {
        this.phastReportRollupService.getPhastResultsFromSelected(val);
      }
    });
    this.phastAssessmentsSub = this.phastReportRollupService.phastAssessments.subscribe(items => {
      if (items) {
        this.phastReportRollupService.initPhastResultsArr(items);
      }
    });
  }

  ngOnDestroy() {
    this.resultsSub.unsubscribe();
    this.allPhastSub.unsubscribe();
    this.selectedPhastSub.unsubscribe();
    this.phastAssessmentsSub.unsubscribe();
  }

  calcPhastSums(resultsData: Array<PhastResultsData>) {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    resultsData.forEach(result => {
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

}
