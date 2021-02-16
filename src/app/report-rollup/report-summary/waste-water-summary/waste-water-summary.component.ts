import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterReportRollupService } from '../../waste-water-report-rollup.service';

@Component({
  selector: 'app-waste-water-summary',
  templateUrl: './waste-water-summary.component.html',
  styleUrls: ['./waste-water-summary.component.css', '../report-summary.component.css']
})
export class WasteWaterSummaryComponent implements OnInit {

  savingPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  selectedSub: Subscription;
  numWasteWater: number;
  constructor(public wasteWaterReportRollupService: WasteWaterReportRollupService) { }

  ngOnInit() {
    this.assessmentSub = this.wasteWaterReportRollupService.wasteWaterAssessments.subscribe(val => {
      this.numWasteWater = val.length;
      if (val.length != 0) {
        this.wasteWaterReportRollupService.setAllWasteWaterResults(val);
        this.wasteWaterReportRollupService.initWasteWaterCompare();
      }
    });
    this.selectedSub = this.wasteWaterReportRollupService.selectedWasteWater.subscribe(val => {
      if (val.length != 0) {
        this.wasteWaterReportRollupService.setWasteWaterResultsFromSelected(val);
        this.calcWasteWaterSums();
      }
    });
  }

  ngOnDestroy() {
    this.assessmentSub.unsubscribe();
    this.selectedSub.unsubscribe();
  }

  calcWasteWaterSums() {
    let sumSavings = 0;
    let sumEnergy = 0;
    let sumCost = 0;
    let sumEnergySavings = 0;
    this.wasteWaterReportRollupService.selectedWasteWaterResults.forEach(result => {
      let diffCost = result.baselineResults.AeCost - result.modificationResults.AeCost;
      sumSavings += diffCost;
      sumCost += result.modificationResults.AeCost;
      let diffEnergy = result.baselineResults.AeEnergyAnnual - result.modificationResults.AeEnergyAnnual;
      sumEnergySavings += diffEnergy;
      sumEnergy += result.modificationResults.AeEnergyAnnual;
    })
    this.savingPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }
}
