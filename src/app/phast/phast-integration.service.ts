import { Injectable } from '@angular/core';
import { IntegratedAssessment, IntegratedEnergyOptions, ModificationEnergyOption } from '../shared/assessment-integration/assessment-integration.service';
import { Settings } from '../shared/models/settings';
import { EnergyUseReportData, PHAST, PhastResults } from '../shared/models/phast/phast';
import { EnergyUseItem } from '../shared/models/treasure-hunt';
import { ExecutiveSummaryService } from './phast-report/executive-summary.service';
import { PhastResultsService } from './phast-results.service';
import { SigFigsPipe } from '../shared/shared-pipes/sig-figs.pipe';

@Injectable({
  providedIn: 'root'
})
export class PhastIntegrationService {

  constructor(private executiveSummaryService: ExecutiveSummaryService, 
    private sigFigsPipe: SigFigsPipe,
    private phastResultService: PhastResultsService) { }

   
  setIntegratedAssessmentData(integratedAssessment: IntegratedAssessment, settings: Settings) {
    let energyOptions: IntegratedEnergyOptions = {
      baseline: undefined,
      modifications: []
    }
    
    let phast: PHAST = integratedAssessment.assessment.phast;
    let baselinePhastResults: PhastResults = this.phastResultService.getResults(phast, settings);

    let energyUsed: EnergyUseReportData = this.phastResultService.getEnergyUseReportData(phast, baselinePhastResults, settings);
    let baselineEnergies: EnergyUseItem[] = this.setEnergUseItems(energyUsed, baselinePhastResults, settings);
    let baselineExecutiveSummary = this.executiveSummaryService.getSummary(phast, false, settings, phast);

    energyOptions.baseline = {
      name: phast.name,
      annualEnergy: baselinePhastResults.grossHeatInput,
      annualCost: baselineExecutiveSummary.annualCost,
      co2EmissionsOutput: baselineExecutiveSummary.co2EmissionsOutput.totalEmissionOutput,
    };

    integratedAssessment.hasModifications = integratedAssessment.assessment.phast.modifications && integratedAssessment.assessment.phast.modifications.length !== 0;
    if (integratedAssessment.hasModifications) {
    let modificationEnergyOptions: Array<ModificationEnergyOption> = [];

    phast.modifications.map(modification => {
      let modificationPhastResults: PhastResults = this.phastResultService.getResults(modification.phast, settings);
      let energyUsed: EnergyUseReportData = this.phastResultService.getEnergyUseReportData(modification.phast, modificationPhastResults, settings);
      let modificationEnergyUseItems: EnergyUseItem[] = this.setEnergUseItems(energyUsed, modificationPhastResults, settings);
      let modificationExecutiveSummary = this.executiveSummaryService.getSummary(modification.phast, true, settings, phast);

      energyOptions.modifications.push({
        name: modification.phast.name,
        annualEnergy: modificationPhastResults.grossHeatInput,
        annualCost: modificationExecutiveSummary.annualCost,
        modificationId: modification.id,
        co2EmissionsOutput: modificationExecutiveSummary.co2EmissionsOutput.totalEmissionOutput,
      });

      modificationEnergyOptions.push(
        {
          modificationId: modification.id,
          energies: modificationEnergyUseItems
        })
    });
      integratedAssessment.modificationEnergyUseItems = modificationEnergyOptions;
    }

    integratedAssessment.assessmentType = 'PHAST';
    integratedAssessment.baselineEnergyUseItems = baselineEnergies;
    integratedAssessment.thEquipmentType = 'processHeating';
    integratedAssessment.energyOptions = energyOptions; 
    integratedAssessment.navigation = {
      queryParams: undefined,
      url: '/phast/' + integratedAssessment.assessment.id
    }
  }

  setEnergUseItems(energyUsed: EnergyUseReportData, phastResults: PhastResults, settings: Settings) {
    let energies: EnergyUseItem[] = [];
    if (settings.energySourceType === 'Electricity') {
      // todo electricity can have natural gas too? where is this coming from
      if (energyUsed.fuelEnergyUsed) {
        let energyUseItem: EnergyUseItem = {
          type: 'Gas',
          amount: this.sigFigsPipe.transform(energyUsed.fuelEnergyUsed, 5)
          // amount: energyUsed.fuelEnergyUsed
        };
        energies.push(energyUseItem);
      }

      let electricity: EnergyUseItem = {
        type: 'Electricity',
        amount: this.sigFigsPipe.transform(phastResults.electricalHeatDelivered, 5)
        // amount: phastResults.electricalHeatDelivered
      };
        
      if (settings.furnaceType === 'Electric Arc Furnace (EAF)') {
        electricity.amount = phastResults.hourlyEAFResults.electricEnergyUsed
        let coalCarbon: EnergyUseItem = {
          type: 'Other Fuel',
          amount: this.sigFigsPipe.transform(phastResults.hourlyEAFResults.coalCarbonUsed, 5)
          // amount: phastResults.hourlyEAFResults.coalCarbonUsed
        };
        let electrodeEnergy: EnergyUseItem = {
          type: 'Other Fuel',
          amount: this.sigFigsPipe.transform(phastResults.hourlyEAFResults.electrodeEnergyUsed, 5)
          // amount: phastResults.hourlyEAFResults.electrodeEnergyUsed
        };
        let otherFuel: EnergyUseItem = {
          type: 'Other Fuel',
          amount: this.sigFigsPipe.transform(phastResults.hourlyEAFResults.otherFuelUsed, 5)
          // amount: phastResults.hourlyEAFResults.otherFuelUsed
        };
        energies.push(coalCarbon, electrodeEnergy, otherFuel);
      } 
      energies.push(electricity);

    } else if (settings.energySourceType === 'Steam') {
      let steam: EnergyUseItem = {
        type: 'Steam',
        amount: this.sigFigsPipe.transform(energyUsed.steamEnergyUsed, 5)
        // amount: energyUsed.steamEnergyUsed
      };
      energies.push(steam);

    } else {
      let energyUseItem: EnergyUseItem = {
        type: 'Gas',
        amount: this.sigFigsPipe.transform(energyUsed.fuelEnergyUsed, 5)
        // amount: energyUsed.fuelEnergyUsed
      };
      energies.push(energyUseItem);
    }
    return energies;
  }

  
}
