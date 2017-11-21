import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { ReportRollupService, PsatCompare, PhastResultsData } from '../../report-rollup.service';
import * as _ from 'lodash';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-phast-summary',
  templateUrl: './phast-summary.component.html',
  styleUrls: ['./phast-summary.component.css', '../report-summary.component.css']
})
export class PhastSummaryComponent implements OnInit {
  furnaceSavingsPotential: number = 0;
  numPhasts: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  constructor(private reportRollupService: ReportRollupService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.reportRollupService.phastAssessments.subscribe(val => {
      this.numPhasts = val.length;
      if (val.length != 0) {
        this.reportRollupService.initPhastResultsArr(val);
      }
    })
    this.reportRollupService.allPhastResults.subscribe(val => {
      if (val.length != 0) {
        this.reportRollupService.initPhastCompare(val);
      }
    })
    this.reportRollupService.selectedPhasts.subscribe(val => {
      if (val.length != 0) {
        this.reportRollupService.getPhastResultsFromSelected(val);
      }
    })

    this.reportRollupService.phastResults.subscribe(val => {
      if (val.length != 0) {
        this.calcPhastSums(val);
      }
    })
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
      let diffEnergy = result.modificationResults.annualEnergySavings;
      sumEnergySavings += diffEnergy;
      sumEnergy += result.modificationResults.annualEnergyUsed;
    })
    this.furnaceSavingsPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }

}
