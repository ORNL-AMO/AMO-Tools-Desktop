import { Injectable } from '@angular/core';
import { PhastService } from '../phast.service';
import { PHAST, PhastResults, ExecutiveSummary, Modification } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../phast-results.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Co2SavingsPhastService } from '../losses/operations/co2-savings-phast/co2-savings-phast.service';
@Injectable()
export class ExecutiveSummaryService {

  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService, private convertUnitsService: ConvertUnitsService, private co2SavingPhastService: Co2SavingsPhastService) { }

  getSummary(phast: PHAST, isMod: boolean, settings: Settings, baseline: PHAST, baselineSummary?: ExecutiveSummary): ExecutiveSummary {
    let executiveSummary: ExecutiveSummary = this.initSummary();
    let phastResults: PhastResults = this.phastResultsService.getResults(phast, settings);
    executiveSummary.annualEnergyUsed = this.calcAnnualEnergy(phastResults, phast);
    executiveSummary.energyPerMass = this.calcEnergyPer(phast, settings, phastResults.grossHeatInput);
    executiveSummary = this.calcAnnualCosts(executiveSummary, phastResults, settings, phast);
    if (isMod && baselineSummary) {
      let actualSummaryCost = baselineSummary.annualCost
      if (settings.currency !== "$") {
        actualSummaryCost = this.convertUnitsService.convertValue(actualSummaryCost, settings.currency, "$")
      }
      executiveSummary.annualCostSavings = actualSummaryCost - executiveSummary.annualCost;
      executiveSummary.annualEnergySavings = baselineSummary.annualEnergyUsed - executiveSummary.annualEnergyUsed;
      executiveSummary.percentSavings = Number(Math.round(((((executiveSummary.annualCostSavings) * 100) / actualSummaryCost) * 100) / 100).toFixed(0));
      executiveSummary.implementationCosts = phast.implementationCost;
      if (executiveSummary.annualCostSavings > 0 && phast.implementationCost) {
        executiveSummary.paybackPeriod = (phast.implementationCost / executiveSummary.annualCostSavings) * 12;
      } else {
        executiveSummary.paybackPeriod = 0;
      }
    }
    if (settings.currency !== "$") {
      executiveSummary.annualCost = this.convertUnitsService.value(executiveSummary.annualCost).from("$").to(settings.currency);
      executiveSummary.annualCostSavings = this.convertUnitsService.value(executiveSummary.annualCostSavings).from("$").to(settings.currency);
      executiveSummary.implementationCosts = this.convertUnitsService.value(executiveSummary.implementationCosts).from("$").to(settings.currency);
    }

    executiveSummary.co2EmissionsOutput = phastResults.co2EmissionsOutput;
    return executiveSummary;
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

  calcAnnualCosts(resultsSummary: ExecutiveSummary, phastResults: PhastResults, settings: Settings, phast: PHAST): ExecutiveSummary {
    //gross heat * operating hours * cost
    let annualTotalEnergy = JSON.parse(JSON.stringify(resultsSummary.annualEnergyUsed));

    if (settings.energySourceType === 'Electricity') {
      if (settings.furnaceType === 'Electric Arc Furnace (EAF)') {
        resultsSummary.annualNaturalGasCost = phastResults.annualEAFResults.naturalGasUsed * phast.operatingCosts.fuelCost;
        resultsSummary.annualCarbonCoalCost = phast.losses.energyInputEAF[0].coalCarbonInjection * phast.operatingCosts.coalCarbonCost;
        resultsSummary.annualElectrodeCost = phast.losses.energyInputEAF[0].electrodeUse * phast.operatingCosts.electrodeCost;
        resultsSummary.annualOtherFuelCost = phastResults.annualEAFResults.otherFuelUsed * phast.operatingCosts.otherFuelCost;
        resultsSummary.annualElectricityCost = phastResults.annualEAFResults.electricEnergyUsed * phast.operatingCosts.electricityCost;
        resultsSummary.annualTotalFuelCost = resultsSummary.annualNaturalGasCost + resultsSummary.annualCarbonCoalCost + resultsSummary.annualElectrodeCost + resultsSummary.annualOtherFuelCost;
        resultsSummary.annualCost = resultsSummary.annualTotalFuelCost + resultsSummary.annualElectricityCost;
      } else {
        let totalHeatInput: number = 0; 
        if (phast.losses && phast.losses.energyInputExhaustGasLoss) {
          phast.losses.energyInputExhaustGasLoss.forEach(loss => {
            totalHeatInput += loss.totalHeatInput
          });
        }
        resultsSummary.annualElectricityCost = phastResults.electricalHeatDelivered * phast.operatingHours.hoursPerYear * phast.operatingCosts.electricityCost;
        resultsSummary.annualTotalFuelCost = totalHeatInput * phast.operatingHours.hoursPerYear * phast.operatingCosts.fuelCost;
      }

      resultsSummary.annualCost = resultsSummary.annualTotalFuelCost + resultsSummary.annualElectricityCost;
    } 
 
    if (settings.unitsOfMeasure === 'Metric') {
      annualTotalEnergy = this.convertUnitsService.value(annualTotalEnergy).from(settings.energyResultUnit).to('GJ');
    } else {
      annualTotalEnergy = this.convertUnitsService.value(annualTotalEnergy).from(settings.energyResultUnit).to('MMBtu');
    }
    
    if (settings.energySourceType === 'Fuel') {
      resultsSummary.annualCost = annualTotalEnergy * phast.operatingCosts.fuelCost;
    } else if (settings.energySourceType === 'Steam') {
      resultsSummary.annualCost = annualTotalEnergy * phast.operatingCosts.steamCost;
    } 

    return resultsSummary;
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
