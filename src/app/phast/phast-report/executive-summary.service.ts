import { Injectable } from '@angular/core';
import { PhastService } from '../phast.service';
import { PHAST, PhastResults, ExecutiveSummary, Modification } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../phast-results.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Injectable()
export class ExecutiveSummaryService {

  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService, private convertUnitsService: ConvertUnitsService) { }

  getSummary(phast: PHAST, isMod: boolean, settings: Settings, baseline: PHAST, baselineSummary?: ExecutiveSummary): ExecutiveSummary {
    let tmpResultsSummary = this.initSummary();
    let tmpPhastResults = this.phastResultsService.getResults(phast, settings);
    tmpResultsSummary.annualEnergyUsed = this.calcAnnualEnergy(tmpPhastResults, phast);
    tmpResultsSummary.energyPerMass = this.calcEnergyPer(phast, settings, tmpPhastResults.grossHeatInput);
    tmpResultsSummary.annualCost = this.calcAnnualCost(tmpResultsSummary.annualEnergyUsed, settings, phast);
    if (isMod && baselineSummary) {
      let actualSummaryCost = baselineSummary.annualCost
      if (settings.currency !== "$") {
        actualSummaryCost = this.convertUnitsService.convertValue(actualSummaryCost, settings.currency, "$")
      }
      tmpResultsSummary.annualCostSavings = actualSummaryCost - tmpResultsSummary.annualCost;
      tmpResultsSummary.annualEnergySavings = baselineSummary.annualEnergyUsed - tmpResultsSummary.annualEnergyUsed;
      tmpResultsSummary.percentSavings = Number(Math.round(((((tmpResultsSummary.annualCostSavings) * 100) / actualSummaryCost) * 100) / 100).toFixed(0));
      tmpResultsSummary.implementationCosts = phast.implementationCost;
      if (tmpResultsSummary.annualCostSavings > 0 && phast.implementationCost) {
        tmpResultsSummary.paybackPeriod = (phast.implementationCost / tmpResultsSummary.annualCostSavings) * 12;
      } else {
        tmpResultsSummary.paybackPeriod = 0;
      }
    }
    if (settings.currency !== "$") {
      tmpResultsSummary.annualCost = this.convertUnitsService.value(tmpResultsSummary.annualCost).from("$").to(settings.currency);
      tmpResultsSummary.annualCostSavings = this.convertUnitsService.value(tmpResultsSummary.annualCostSavings).from("$").to(settings.currency);
      tmpResultsSummary.implementationCosts = this.convertUnitsService.value(tmpResultsSummary.implementationCosts).from("$").to(settings.currency);
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

  calcEnergyPer(phast: PHAST, settings: Settings, calculatedEnergyUsed: number): number {
    //Energy Intensity for Charge Materials
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
    // let calculatedEnergyUsed = this.phastService.sumHeatInput(phast.losses, settings);
    let calculatedEnergyIntensity = (calculatedEnergyUsed / sumFeedRate) || 0;
    if (settings.energyResultUnit === 'MMBtu') {
      calculatedEnergyIntensity = this.convertUnitsService.value(calculatedEnergyIntensity).from('MMBtu').to('Btu');
    } else if (settings.energyResultUnit === 'GJ') {
      calculatedEnergyIntensity = this.convertUnitsService.value(calculatedEnergyIntensity).from('GJ').to('kJ');
    }
    return calculatedEnergyIntensity;
  }

  calcAnnualCost(annualEnergyUsed: number, settings: Settings, phast: PHAST): number {
    //gross heat * operating hours * cost
    let tmpAnnualCost = 0;
    //use copy of annualEnergy value to prevent altering input
    let tmpAnnualEnergy = JSON.parse(JSON.stringify(annualEnergyUsed));

    //convert our annual energy to cost unit
    if (settings.energySourceType === 'Electricity') {
      tmpAnnualEnergy = this.convertUnitsService.value(tmpAnnualEnergy).from(settings.energyResultUnit).to('kWh');
    } else if (settings.unitsOfMeasure === 'Metric') {
      tmpAnnualEnergy = this.convertUnitsService.value(tmpAnnualEnergy).from(settings.energyResultUnit).to('GJ');
    } else {
      tmpAnnualEnergy = this.convertUnitsService.value(tmpAnnualEnergy).from(settings.energyResultUnit).to('MMBtu');
    }

    //annual cost = annual energy in cost unit * cost
    if (settings.energySourceType === 'Fuel') {
      tmpAnnualCost = tmpAnnualEnergy * phast.operatingCosts.fuelCost;
    } else if (settings.energySourceType === 'Electricity') {
      tmpAnnualCost = tmpAnnualEnergy * phast.operatingCosts.electricityCost;
    } else if (settings.energySourceType === 'Steam') {
      tmpAnnualCost = tmpAnnualEnergy * phast.operatingCosts.steamCost;
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
    };
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
    });
    return tmpNotesArr;
  }
  buildNoteObject(modName: string, lossName: string, note: string): SummaryNote {
    let summaryNote: SummaryNote = {
      modificationName: modName,
      lossName: lossName,
      note: note
    };
    return summaryNote;
  }



}


export interface SummaryNote {
  modificationName: string;
  lossName: string;
  note: string;
}
