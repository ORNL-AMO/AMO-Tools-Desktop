import { Injectable } from '@angular/core';
import { IntegratedAssessment, IntegratedEnergyOptions, ModificationEnergyOption } from '../shared/assessment-integration/assessment-integration.service';
import { Settings } from '../shared/models/settings';
import { EnergyUseReportData, ExecutiveSummary, PHAST, PhastResults } from '../shared/models/phast/phast';
import { EnergyUseItem } from '../shared/models/treasure-hunt';
import { ExecutiveSummaryService } from './phast-report/executive-summary.service';
import { PhastResultsService } from './phast-results.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

@Injectable({
  providedIn: 'root'
})
export class PhastIntegrationService {

  constructor(private executiveSummaryService: ExecutiveSummaryService, private convertUnitsService: ConvertUnitsService,
    private phastResultService: PhastResultsService) { }

  setIntegratedAssessmentData(integratedAssessment: IntegratedAssessment, settings: Settings, treasureHuntSettings: Settings) {
    let energyOptions: IntegratedEnergyOptions = {
      baseline: undefined,
      modifications: []
    }
    
    let phast: PHAST = integratedAssessment.assessment.phast;
    let baselinePhastResults: PhastResults = this.phastResultService.getResults(phast, settings);
    
    let energyUsed: EnergyUseReportData = this.phastResultService.getEnergyUseReportData(phast, baselinePhastResults, settings);
    let baselineExecutiveSummary = this.executiveSummaryService.getSummary(phast, false, settings, phast);
    let baselineEnergies: EnergyUseItem[] = this.setEnergyUseItems(energyUsed, baselinePhastResults, baselineExecutiveSummary, settings, treasureHuntSettings);
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
        let modificationExecutiveSummary: ExecutiveSummary = this.executiveSummaryService.getSummary(modification.phast, true, settings, phast);
        let modificationEnergyUseItems: EnergyUseItem[] = this.setEnergyUseItems(energyUsed, modificationPhastResults, modificationExecutiveSummary, settings, treasureHuntSettings);

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

  setEnergyUseItems(energyUsed: EnergyUseReportData, phastResults: PhastResults, executiveSummary: ExecutiveSummary, settings: Settings, treasureHuntSettings: Settings) {
    let energies: EnergyUseItem[] = [];
    let treasureHuntUnit: string = treasureHuntSettings.unitsOfMeasure === "Imperial"? 'MMBtu' : 'GJ';
    let assessmentUnit: string = settings.unitsOfMeasure === "Imperial"? 'MMBtu' : 'GJ';
    let shouldConvert: boolean = settings.unitsOfMeasure !== treasureHuntSettings.unitsOfMeasure;
    
    if (settings.energySourceType === 'Electricity') {
      if (energyUsed.fuelEnergyUsed) {
        let fuelEnergyUsed: number = energyUsed.fuelEnergyUsed;
        if (shouldConvert) {
          fuelEnergyUsed = this.convertUnitsService.convertValue(energyUsed.fuelEnergyUsed, assessmentUnit, treasureHuntUnit);
        }
        let energyUseItem: EnergyUseItem = {
          type: 'Gas',
          amount: fuelEnergyUsed,
          integratedEnergyCost: executiveSummary.annualNaturalGasCost,
          integratedEmissionRate: phastResults.co2EmissionsOutput.fuelEmissionOutput
        }
        energies.push(energyUseItem);
      }
      // units in kW only
      let electricity: EnergyUseItem = {
        type: 'Electricity',
        amount: phastResults.electricalHeatDelivered,
        integratedEnergyCost: executiveSummary.annualElectricityCost,
        integratedEmissionRate: phastResults.co2EmissionsOutput.electricityEmissionOutput
      };
        
      if (settings.furnaceType === 'Electric Arc Furnace (EAF)') {
        electricity.amount = phastResults.hourlyEAFResults.electricEnergyUsed;


        let coalCarbonUsed: number = phastResults.hourlyEAFResults.coalCarbonUsed
        if (shouldConvert) {
          coalCarbonUsed = this.convertUnitsService.convertValue(coalCarbonUsed, assessmentUnit, treasureHuntUnit);
        }

        let coalCarbon: EnergyUseItem = {
          type: 'Other Fuel',
          amount: coalCarbonUsed,
          integratedEnergyCost: executiveSummary.annualCarbonCoalCost,
          integratedEmissionRate: phastResults.co2EmissionsOutput.coalCarbonEmissionsOutput
        };

        let electrodeEnergyUsed: number = phastResults.hourlyEAFResults.electrodeEnergyUsed;
        if (shouldConvert) {
          electrodeEnergyUsed = this.convertUnitsService.convertValue(electrodeEnergyUsed, assessmentUnit, treasureHuntUnit);
        }
        let electrodeEnergy: EnergyUseItem = {
          type: 'Other Fuel',
          amount: electrodeEnergyUsed,
          integratedEnergyCost: executiveSummary.annualElectrodeCost,
          integratedEmissionRate: phastResults.co2EmissionsOutput.electrodeEmissionsOutput
        };
        

        let otherFuelUsed: number = phastResults.hourlyEAFResults.otherFuelUsed;
        if (shouldConvert) {
          otherFuelUsed = this.convertUnitsService.convertValue(otherFuelUsed, assessmentUnit, treasureHuntUnit);
        }
        let otherFuel: EnergyUseItem = {
          type: 'Other Fuel',
          amount: otherFuelUsed,
          integratedEnergyCost: executiveSummary.annualOtherFuelCost,
          integratedEmissionRate: phastResults.co2EmissionsOutput.otherFuelEmissionsOutput
        };
        energies.push(coalCarbon, electrodeEnergy, otherFuel);
      } 
      energies.push(electricity);

    } else if (settings.energySourceType === 'Steam') {
      treasureHuntUnit = treasureHuntSettings.unitsOfMeasure === "Imperial"? 'klb' : 'tonne';
      let steamUsed: number = energyUsed.steamEnergyUsed;
      if (shouldConvert) {
        steamUsed = this.convertUnitsService.convertValue(steamUsed, assessmentUnit, treasureHuntUnit);
        this.convertUnitsService.convertValue(steamUsed, assessmentUnit, treasureHuntUnit);
      }
      // in steam assesment energy used is === grossHeatInput ... 
      let steam: EnergyUseItem = {
        type: 'Steam',
        amount: steamUsed,
        integratedEnergyCost: executiveSummary.annualCost,
        integratedEmissionRate: undefined
      };
      energies.push(steam);
      
    } else {
      treasureHuntUnit = treasureHuntSettings.unitsOfMeasure === "Imperial"? 'MMBtu' : 'GJ';
      assessmentUnit = settings.unitsOfMeasure === "Imperial"? 'MMBtu' : 'GJ';
      let energyUseItem: EnergyUseItem = {
        type: 'Gas',
        amount: energyUsed.fuelEnergyUsed,
        integratedEnergyCost: executiveSummary.annualCost,
        integratedEmissionRate: phastResults.co2EmissionsOutput.fuelEmissionOutput,
      };
      energies.push(energyUseItem);
    }
    return energies;
  }

  
}
