import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { ReportRollupService } from '../../report-rollup.service';
import * as _ from 'lodash';
import { PsatService } from '../../../psat/psat.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-psat-summary',
  templateUrl: './psat-summary.component.html',
  styleUrls: ['./psat-summary.component.css']
})
export class PsatSummaryComponent implements OnInit {

  // @Input()
  // psats: Array<Assessment>;

  pumpSavingsPotential: number = 0;
  numPsats: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.reportRollupService.psatAssessments.subscribe(val => {
      this.numPsats = val.length
      this.calcPsatSums(val);
    })
  }

  calcPsatSums(assessments: Array<Assessment>) {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    //TODO: Refactor Settings before calculating this.
    // assessments.forEach(assessment => {
    //   if (assessment.psat.modifications) {
    //     let minCost = _.minBy(assessment.psat.modifications, (mod) => { return mod.psat.outputs.annual_cost })
    //     let diffCost = assessment.psat.outputs.annual_cost - minCost.psat.outputs.annual_cost;
    //     sumSavings += diffCost;
    //     sumCost += minCost.psat.outputs.annual_cost;
    //     let diffEnergy = assessment.psat.outputs.annual_energy - minCost.psat.outputs.annual_energy;
    //     sumEnergySavings += diffEnergy;
    //     sumEnergy += minCost.psat.outputs.annual_energy;

    //   }
    // })
    this.pumpSavingsPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }


}
