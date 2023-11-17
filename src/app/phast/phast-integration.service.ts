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
    let {energyValue, treasureHuntUnit} = this.checkConvertEnergy(baselinePhastResults.grossHeatInput, settings, treasureHuntSettings);
    
    energyOptions.baseline = {
      name: phast.name,
      annualEnergy: energyValue,
      annualCost: baselineExecutiveSummary.annualCost,
      co2EmissionsOutput: baselineExecutiveSummary.co2EmissionsOutput.totalEmissionOutput,
      energyThDisplayUnits: treasureHuntUnit
    };

    integratedAssessment.hasModifications = integratedAssessment.assessment.phast.modifications && integratedAssessment.assessment.phast.modifications.length !== 0;
    if (integratedAssessment.hasModifications) {
      let modificationEnergyOptions: Array<ModificationEnergyOption> = [];

      phast.modifications.map(modification => {
        let modificationPhastResults: PhastResults = this.phastResultService.getResults(modification.phast, settings);
        let energyUsed: EnergyUseReportData = this.phastResultService.getEnergyUseReportData(modification.phast, modificationPhastResults, settings);
        let modificationExecutiveSummary: ExecutiveSummary = this.executiveSummaryService.getSummary(modification.phast, true, settings, phast);
        let modificationEnergyUseItems: EnergyUseItem[] = this.setEnergyUseItems(energyUsed, modificationPhastResults, modificationExecutiveSummary, settings, treasureHuntSettings);
        let {energyValue, treasureHuntUnit} = this.checkConvertEnergy(modificationPhastResults.grossHeatInput, settings, treasureHuntSettings);

        energyOptions.modifications.push({
          name: modification.phast.name,
          annualEnergy: energyValue,
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

  checkConvertEnergy(energyValue: number, settings: Settings, treasureHuntSettings: Settings) {
    let treasureHuntUnit: string = treasureHuntSettings.unitsOfMeasure === "Imperial"? 'MMBtu' : 'GJ';
    let assessmentUnit: string = settings.unitsOfMeasure === "Imperial"? 'MMBtu' : 'GJ';
    let shouldConvert: boolean = settings.unitsOfMeasure !== treasureHuntSettings.unitsOfMeasure;
    
    if (shouldConvert && settings.energySourceType !== 'Electricity') {
      // fuel- fired and steam - phast grossHeatInput results in MMBTU/GJ 
      energyValue = this.convertUnitsService.convertValue(energyValue, assessmentUnit, treasureHuntUnit);
    } else if (settings.energySourceType === 'Electricity') {
      // EAF and electro - phast grossHeatInput results already in kWh
      treasureHuntUnit = 'kWh';
    }
    return {energyValue, treasureHuntUnit};
  }

  setEnergyUseItems(energyUsed: EnergyUseReportData, phastResults: PhastResults, executiveSummary: ExecutiveSummary, settings: Settings, treasureHuntSettings: Settings) {
    let energies: EnergyUseItem[] = [];
    
    if (settings.energySourceType === 'Electricity') {
      if (energyUsed.fuelEnergyUsed) {

        let energyUseItem: EnergyUseItem = {
          type: 'Gas',
          amount: this.checkConvertEnergy(energyUsed.fuelEnergyUsed, settings, treasureHuntSettings).energyValue,
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

        let coalCarbon: EnergyUseItem = {
          type: 'Other Fuel',
          amount: this.checkConvertEnergy(phastResults.hourlyEAFResults.coalCarbonUsed, settings, treasureHuntSettings).energyValue,
          integratedEnergyCost: executiveSummary.annualCarbonCoalCost,
          integratedEmissionRate: phastResults.co2EmissionsOutput.coalCarbonEmissionsOutput
        };

        let electrodeEnergy: EnergyUseItem = {
          type: 'Other Fuel',
          amount: this.checkConvertEnergy(phastResults.hourlyEAFResults.electrodeEnergyUsed, settings, treasureHuntSettings).energyValue,
          integratedEnergyCost: executiveSummary.annualElectrodeCost,
          integratedEmissionRate: phastResults.co2EmissionsOutput.electrodeEmissionsOutput
        };
        
        let otherFuel: EnergyUseItem = {
          type: 'Other Fuel',
          amount: this.checkConvertEnergy(phastResults.hourlyEAFResults.otherFuelUsed, settings, treasureHuntSettings).energyValue,
          integratedEnergyCost: executiveSummary.annualOtherFuelCost,
          integratedEmissionRate: phastResults.co2EmissionsOutput.otherFuelEmissionsOutput
        };
        energies.push(coalCarbon, electrodeEnergy, otherFuel);
      } 
      energies.push(electricity);

    } else if (settings.energySourceType === 'Steam') {
      // in steam assesment energy used is === grossHeatInput ... 
      let steam: EnergyUseItem = {
        type: 'Steam',
        amount: this.checkConvertEnergy(energyUsed.steamEnergyUsed, settings, treasureHuntSettings).energyValue,
        integratedEnergyCost: executiveSummary.annualCost,
        integratedEmissionRate: undefined
      };
      energies.push(steam);
    } else {

      let energyUseItem: EnergyUseItem = {
        type: 'Gas',
        amount: this.checkConvertEnergy(energyUsed.fuelEnergyUsed, settings, treasureHuntSettings).energyValue,
        integratedEnergyCost: executiveSummary.annualCost,
        // * if fuel-fired natural gas - PHAST results doesn't itemize emissions output by energy type
        integratedEmissionRate: phastResults.co2EmissionsOutput.totalEmissionOutput,
      };
      energies.push(energyUseItem);
    }

    return energies;
  }

  
}
