import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { ReportRollupService, PsatCompare, PhastResultsData } from '../../report-rollup.service';
import * as _ from 'lodash';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-phast-summary',
  templateUrl: './phast-summary.component.html',
  styleUrls: ['./phast-summary.component.css', '../report-summary.component.css']
})
export class PhastSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  numPhasts: number;

  furnaceSavingsPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  constructor(private reportRollupService: ReportRollupService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    // this.reportRollupService.phastAssessments.subscribe(val => {
    //   this.numPhasts = val.length;
    //   if (val.length != 0) {
    //     this.reportRollupService.initPhastResultsArr(val);
    //   }
    // })
    // this.reportRollupService.allPhastResults.subscribe(val => {
    //   if (val.length != 0) {
    //     this.reportRollupService.initPhastCompare(val);
    //   }
    // })
    // this.reportRollupService.selectedPhasts.subscribe(val => {
    //   if (val.length != 0) {
    //     this.reportRollupService.getPhastResultsFromSelected(val);
    //   }
    // })

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
      let diffEnergy = this.convertUnitsService.value(result.modificationResults.annualEnergySavings).from(result.settings.energyResultUnit).to(this.settings.phastRollupUnit);
      sumEnergySavings += diffEnergy;
      sumEnergy += this.convertUnitsService.value(result.modificationResults.annualEnergyUsed).from(result.settings.energyResultUnit).to(this.settings.phastRollupUnit);;
    })
    this.furnaceSavingsPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }

}
