import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { ReportRollupService, PsatCompare, PsatResultsData } from '../../report-rollup.service';
import * as _ from 'lodash';
import { PsatService } from '../../../psat/psat.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-psat-summary',
  templateUrl: './psat-summary.component.html',
  styleUrls: ['./psat-summary.component.css', '../report-summary.component.css']
})
export class PsatSummaryComponent implements OnInit {

  @Input()
  numPsats: number;

  pumpSavingsPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  allSub: Subscription;
  selectedSub: Subscription;
  resultsSub: Subscription;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.assessmentSub = this.reportRollupService.psatAssessments.subscribe(val => {
      this.numPsats = val.length
      if (val.length != 0) {
        this.reportRollupService.initResultsArr(val);
      }
    })

    this.allSub = this.reportRollupService.allPsatResults.subscribe(val => {
      if (val.length != 0) {
        this.reportRollupService.initPsatCompare(val);
      }
    })
    this.selectedSub = this.reportRollupService.selectedPsats.subscribe(val => {
      if (val.length != 0) {
        this.reportRollupService.getResultsFromSelected(val);
      }
    })

    this.resultsSub = this.reportRollupService.psatResults.subscribe(val => {
      if (val.length != 0) {
        this.calcPsatSums(val);
      }
    })
  }

  ngOnDestroy(){
    this.assessmentSub.unsubscribe();
    this.allSub.unsubscribe();
    this.selectedSub.unsubscribe();
    this.resultsSub.unsubscribe();
  }

  calcPsatSums(resultsData: Array<PsatResultsData>) {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    resultsData.forEach(result => {
      let diffCost = result.baselineResults.annual_cost - result.modificationResults.annual_cost;
      sumSavings += diffCost;
      sumCost += result.modificationResults.annual_cost;
      let diffEnergy = result.baselineResults.annual_energy - result.modificationResults.annual_energy;
      sumEnergySavings += diffEnergy;
      sumEnergy += result.modificationResults.annual_energy;
    })
    this.pumpSavingsPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }
}