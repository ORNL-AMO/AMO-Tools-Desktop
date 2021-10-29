import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirReportRollupService } from '../../compressed-air-report-rollup.service';

@Component({
  selector: 'app-compressed-air-summary',
  templateUrl: './compressed-air-summary.component.html',
  styleUrls: ['./compressed-air-summary.component.css', '../report-summary.component.css']
})
export class CompressedAirSummaryComponent implements OnInit {
  @Input()
  settings: Settings;

  savingPotential: number = 0;
  energySavingsPotential: number = 0;
  totalCost: number = 0;
  totalEnergy: number = 0;
  assessmentSub: Subscription;
  selectedSub: Subscription;
  numCompressedAir: number;
  constructor(public compressedAirReportRollupService: CompressedAirReportRollupService) { }

  ngOnInit() {
    this.assessmentSub = this.compressedAirReportRollupService.compressedAirAssessments.subscribe(val => {
      this.numCompressedAir = val.length;
      if (val.length != 0) {
        this.compressedAirReportRollupService.setAllAssessmentResults(val);
        this.compressedAirReportRollupService.initCompressedAirCompare();
      }
    });
    this.selectedSub = this.compressedAirReportRollupService.selectedAssessments.subscribe(val => {
      if (val.length != 0) {
        this.compressedAirReportRollupService.setAssessmentResultsFromSelected(val);
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
    this.compressedAirReportRollupService.selectedAssessmentResults.forEach(result => {
      let diffCost: number = 0;
      let diffEnergy: number = 0;
      if (result.modificationResults) {
        diffCost = result.baselineResults.total.totalAnnualOperatingCost - result.modificationResults.totalModificationCost;
        sumCost += result.modificationResults.totalModificationCost;
        diffEnergy = result.baselineResults.total.energyUse - result.modificationResults.totalModificationPower;
        sumEnergy += result.modificationResults.totalModificationPower;
      }
      sumSavings += diffCost;
      sumEnergySavings += diffEnergy;
    })
    this.savingPotential = sumSavings;
    this.energySavingsPotential = sumEnergySavings;
    this.totalCost = sumCost;
    this.totalEnergy = sumEnergy;
  }
}
