import { Component, OnInit, Input } from '@angular/core';
import { ReportRollupService } from '../../report-rollup.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Subscription } from 'rxjs';
import { PhastResultsData } from '../../report-rollup-models';

@Component({
  selector: 'app-phast-summary',
  templateUrl: './phast-summary.component.html',
  styleUrls: ['./phast-summary.component.css', '../report-summary.component.css']
})
export class PhastSummaryComponent implements OnInit {
  @Input()
  settings: Settings;

  furnaceSavingsPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  resultsSub: Subscription;
  constructor(public reportRollupService: ReportRollupService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.resultsSub = this.reportRollupService.phastResults.subscribe(val => {
       if (val.length !== 0) {
         this.calcPhastSums(val);
       }
     });
  }

  ngOnDestroy() {
    this.resultsSub.unsubscribe();
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
      sumEnergy += this.convertUnitsService.value(result.modificationResults.annualEnergyUsed).from(result.settings.energyResultUnit).to(this.settings.phastRollupUnit); ;
    });
    this.furnaceSavingsPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }

}
