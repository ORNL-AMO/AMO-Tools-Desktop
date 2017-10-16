import { Injectable } from '@angular/core';
import { PhastService } from '../phast.service';
import { PHAST, PhastResults, ExecutiveSummary } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { PhastResultsService } from '../phast-results.service';

@Injectable()
export class ExecutiveSummaryService {

  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService) { }
  getSummary(phast: PHAST, isMod: boolean,  settings: Settings, baseline: PHAST, baselineSummary?: ExecutiveSummary): ExecutiveSummary {
    let tmpResultsSummary = this.initSummary();
    let tmpPhastResults = this.phastResultsService.getResults(phast, settings);
    tmpResultsSummary.annualEnergyUsed = this.calcAnnualEnergy(tmpPhastResults, baseline);
    tmpResultsSummary.energyPerMass = this.calcEnergyPer(phast, settings);
    tmpResultsSummary.annualCost = this.calcAnnualCost(tmpResultsSummary.annualEnergyUsed, settings, baseline);
    if (isMod && baselineSummary) {
      tmpResultsSummary.annualCostSavings = baselineSummary.annualCost - tmpResultsSummary.annualCost;
      tmpResultsSummary.annualEnergySavings = baselineSummary.annualEnergyUsed - tmpResultsSummary.annualEnergyUsed;
      tmpResultsSummary.percentSavings = Number(Math.round(((((tmpResultsSummary.annualCostSavings) * 100) / baselineSummary.annualCost) * 100) / 100).toFixed(0));
      tmpResultsSummary.implementationCosts = phast.implementationCost;
      if (tmpResultsSummary.annualCostSavings > 0) {
        tmpResultsSummary.paybackPeriod = (phast.implementationCost / tmpResultsSummary.annualCostSavings) * 12;
      }
    }
    return tmpResultsSummary;
  }

  calcPercentSavings() {

  }

  calcAnnualEnergy(results: PhastResults, phast: PHAST): number {
    //gross heat * operating hours
    let tmpAnnualEnergy = results.grossHeatInput * phast.operatingHours.hoursPerYear;
    return tmpAnnualEnergy;
  }

  calcEnergyPer(phast: PHAST, settings: Settings): number {
    //Energy Intensity for Charge Materials
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    let calculatedEnergyUsed = this.phastService.sumHeatInput(phast.losses, settings);
    let calculatedEnergyIntensity = (calculatedEnergyUsed / sumFeedRate) || 0;
    return calculatedEnergyIntensity;
  }

  calcAnnualCost(annualEnergyUsed: number, settings: Settings, phast: PHAST): number {
    //gross heat * operating hours * cost
    let tmpAnnualCost = 0;
    if (settings.energySourceType == 'Fuel') {
      tmpAnnualCost = annualEnergyUsed * phast.operatingCosts.fuelCost;
    } else if (settings.energySourceType == 'Electricity') {
      tmpAnnualCost = annualEnergyUsed * phast.operatingCosts.electricityCost;
    } else if (settings.energySourceType == 'Steam') {
      tmpAnnualCost = annualEnergyUsed * phast.operatingCosts.steamCost;
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
