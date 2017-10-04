import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../../phast.service';
import { PHAST, PhastResults, ExecutiveSummary } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PhastResultsService } from '../../phast-results.service';

@Component({
  selector: 'app-executive-summary',
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.css']
})
export class ExecutiveSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;

  baseline: ExecutiveSummary;

  modifications: Array<ExecutiveSummary>;

  constructor(private phastResultsService: PhastResultsService, private phastService: PhastService) { }

  ngOnInit() {
    this.baseline = this.getSummary(this.phast, false);
    this.modifications = new Array<ExecutiveSummary>();
    this.phast.modifications.forEach(mod => {
      let tmpSummary = this.getSummary(mod.phast, true);
      this.modifications.push(tmpSummary);
    })
  }

  getSummary(phast: PHAST, isMod: boolean): ExecutiveSummary {
    let tmpResultsSummary = this.initSummary();
    let tmpPhastResults = this.phastResultsService.getResults(phast, this.settings);
    tmpResultsSummary.annualEnergyUsed = this.calcAnnualEnergy(tmpPhastResults);
    tmpResultsSummary.energyPerMass = this.calcEnergyPer(phast);
    tmpResultsSummary.annualCost = this.calcAnnualCost(tmpResultsSummary.annualEnergyUsed);
    if (isMod) {
      tmpResultsSummary.annualCostSavings = this.baseline.annualCost - tmpResultsSummary.annualCost;
      tmpResultsSummary.annualEnergySavings = this.baseline.annualEnergyUsed - tmpResultsSummary.annualEnergyUsed;
      tmpResultsSummary.percentSavings = Number(Math.round(((((tmpResultsSummary.annualCostSavings) * 100) / this.baseline.annualCost) * 100) / 100).toFixed(0));
    }
    return tmpResultsSummary;
  }

  calcPercentSavings() {

  }

  calcAnnualEnergy(results: PhastResults): number {
    //gross heat * operating hours
    let tmpAnnualEnergy = results.grossHeatInput * this.phast.operatingHours.hoursPerYear;
    return tmpAnnualEnergy;
  }

  calcEnergyPer(phast: PHAST): number {
    //Energy Intensity for Charge Materials
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let calculatedEnergyUsed = this.phastService.sumHeatInput(phast.losses, this.settings);
    let calculatedEnergyIntensity = (calculatedEnergyUsed / sumFeedRate) || 0;
    return calculatedEnergyIntensity;
  }

  calcAnnualCost(annualEnergyUsed: number): number {
    //gross heat * operating hours * cost
    let tmpAnnualCost = 0;
    if (this.settings.energySourceType == 'Fuel') {
      tmpAnnualCost = annualEnergyUsed * this.phast.operatingCosts.fuelCost;
    } else if (this.settings.energySourceType == 'Electricity') {
      tmpAnnualCost = annualEnergyUsed * this.phast.operatingCosts.electricityCost;
    } else if (this.settings.energySourceType == 'Steam') {
      tmpAnnualCost = annualEnergyUsed * this.phast.operatingCosts.steamCost;
    }
    return tmpAnnualCost;
  }

  initSummary(): ExecutiveSummary {
    let tmpSummary: ExecutiveSummary = {
      percentSavings: 0,
      annualEnergyUsed: 0,
      energyPerMass: 0,
      annualEnergySavings: 0,
      annualCost: 0,
      annualCostSavings: 0,
      implementationCosts: 0,
      paybackPeriod: 0
    }
    return tmpSummary;
  }

}
