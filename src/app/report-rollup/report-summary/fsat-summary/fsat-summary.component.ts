import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportRollupService } from '../../report-rollup.service';
import { FsatResultsData } from '../../report-rollup-models';
import { FsatReportRollupService } from '../../fsat-report-rollup.service';

@Component({
  selector: 'app-fsat-summary',
  templateUrl: './fsat-summary.component.html',
  styleUrls: ['./fsat-summary.component.css', '../report-summary.component.css']
})
export class FsatSummaryComponent implements OnInit {

  fanSavingPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  allSub: Subscription;
  selectedSub: Subscription;
  resultsSub: Subscription;
  numFsats: number;
  constructor(public fsatReportRollupService: FsatReportRollupService) { }

  ngOnInit() {
    this.assessmentSub = this.fsatReportRollupService.fsatAssessments.subscribe(val => {
      this.numFsats = val.length;
      if (val.length != 0) {
        this.fsatReportRollupService.initFsatResultsArr(val);
      }
    })

    this.allSub = this.fsatReportRollupService.allFsatResults.subscribe(val => {
      if (val.length != 0) {
        this.fsatReportRollupService.initFsatCompare(val);
      }
    })
    this.selectedSub = this.fsatReportRollupService.selectedFsats.subscribe(val => {
      if (val.length != 0) {
        this.fsatReportRollupService.getFsatResultsFromSelected(val);
      }
    })

    this.resultsSub = this.fsatReportRollupService.fsatResults.subscribe(val => {
      if (val.length != 0) {
        this.calcFsatSums(val);
      }
    })
  }

  ngOnDestroy(){
    this.assessmentSub.unsubscribe();
    this.allSub.unsubscribe();
    this.selectedSub.unsubscribe();
    this.resultsSub.unsubscribe();
  }

  calcFsatSums(resultsData: Array<FsatResultsData>) {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    resultsData.forEach(result => {
      let diffCost = result.baselineResults.annualCost - result.modificationResults.annualCost;
      sumSavings += diffCost;
      sumCost += result.modificationResults.annualCost;
      let diffEnergy = result.baselineResults.annualEnergy - result.modificationResults.annualEnergy;
      sumEnergySavings += diffEnergy;
      sumEnergy += result.modificationResults.annualEnergy;
    })
    this.fanSavingPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }

}
