import { Injectable } from '@angular/core';
import { PhastService } from '../phast.service';
import { PHAST, PhastResults, ExecutiveSummary, Modification } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { PhastResultsService } from '../phast-results.service';

@Injectable()
export class ExecutiveSummaryService {

  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService) { }
  getSummary(phast: PHAST, isMod: boolean, settings: Settings, baseline: PHAST, baselineSummary?: ExecutiveSummary): ExecutiveSummary {
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
      tmpAnnualCost = annualEnergyUsed * (phast.operatingCosts.fuelCost / 1000000);
    } else if (settings.energySourceType == 'Electricity') {
      tmpAnnualCost = annualEnergyUsed * phast.operatingCosts.electricityCost;
    } else if (settings.energySourceType == 'Steam') {
      tmpAnnualCost = annualEnergyUsed * (phast.operatingCosts.steamCost / 1000000);
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

  buildSummaryNotes(modifications: Modification[]): Array<SummaryNote> {
    let tmpNotesArr: Array<SummaryNote> = new Array<SummaryNote>();
    modifications.forEach(mod => {
      if (mod.notes) {
        if (mod.notes.atmosphereNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Atmosphere Losses', mod.notes.atmosphereNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.auxiliaryPowerNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Auxiliary Power Losses', mod.notes.auxiliaryPowerNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.chargeNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Charge Materials', mod.notes.chargeNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.coolingNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Cooling Losses', mod.notes.coolingNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.energyInputExhaustGasNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Energy Input', mod.notes.energyInputExhaustGasNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.exhaustGasNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Exhaust Gas Losses', mod.notes.exhaustGasNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.extendedNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Extended Surface Losses', mod.notes.extendedNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.fixtureNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Fixture Losses', mod.notes.fixtureNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.flueGasNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Flue Gas Losses', mod.notes.flueGasNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.heatSystemEfficiencyNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Heat System Efficiency', mod.notes.heatSystemEfficiencyNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.leakageNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Leakage Losses', mod.notes.leakageNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.openingNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Opening Losses', mod.notes.openingNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.operationsNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Operations', mod.notes.operationsNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.otherNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Other Losses', mod.notes.otherNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.slagNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Slag Losses', mod.notes.slagNotes);
          tmpNotesArr.push(note);
        }
        if (mod.notes.wallNotes) {
          let note = this.buildNoteObject(mod.phast.name, 'Wall Losses', mod.notes.wallNotes);
          tmpNotesArr.push(note);
        }
      }
    })
    return tmpNotesArr;
  }
  buildNoteObject(modName: string, lossName: string, note: string): SummaryNote {
    let summaryNote: SummaryNote = {
      modificationName: modName,
      lossName: lossName,
      note: note
    }
    return summaryNote;
  }



}


export interface SummaryNote {
  modificationName: string,
  lossName: string,
  note: string
}