import { Injectable } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories, CalculatedByPhast, EAFResults, EnergyUseReportData } from '../shared/models/phast/phast';
import { PhastService } from './phast.service';
import { Settings } from '../shared/models/settings';
import { AuxEquipmentService } from './aux-equipment/aux-equipment.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { EnergyInputExhaustGasService } from './losses/energy-input-exhaust-gas-losses/energy-input-exhaust-gas.service';
import { EnergyInputService } from './losses/energy-input/energy-input.service';
import { FlueGasFormService } from '../calculator/furnaces/flue-gas/flue-gas-form.service';
import { Co2SavingsPhastService } from './losses/operations/co2-savings-phast/co2-savings-phast.service';
import { EnergyInputEAF } from '../shared/models/phast/losses/energyInputEAF';
import { FlueGasByVolumeSuiteResults, MaterialInputProperties } from '../shared/models/phast/losses/flueGas';
import { SqlDbApiService } from '../tools-suite-api/sql-db-api.service';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../shared/models/materials';

import { EnergyExhaustGasOutput } from '../tools-suite-api/process-heating-api.service';


@Injectable()
export class PhastResultsService {

  constructor(private phastService: PhastService,
    private flueGasFormService: FlueGasFormService,
    private auxEquipmentService: AuxEquipmentService,
    private convertUnitsService: ConvertUnitsService,
    private energyInputExhaustGasService: EnergyInputExhaustGasService,
    private energyInputService: EnergyInputService,
    private sqlDbApiService: SqlDbApiService,
    private co2SavingPhastService: Co2SavingsPhastService,
    ) { }
  checkLoss(loss: any) {
    if (!loss) {
      return false;
    }
    else if (loss.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  initResults(): PhastResults {
    let results: PhastResults = {
      totalInput: 0,
      totalChargeMaterialLoss: 0,
      totalWallLoss: 0,
      totalOtherLoss: 0,
      totalOpeningLoss: 0,
      totalLeakageLoss: 0,
      totalFixtureLoss: 0,
      totalExtSurfaceLoss: 0,
      totalCoolingLoss: 0,
      totalAtmosphereLoss: 0,
      totalFlueGas: 0,
      totalSlag: 0,
      totalAuxPower: 0,
      totalEnergyInputEAF: 0,
      totalEnergyInput: 0,
      totalExhaustGas: 0,
      electricalHeaterLosses: 0,
      totalExhaustGasEAF: 0,
      totalSystemLosses: 0,
      exothermicHeat: 0,
      energyInputTotalChemEnergy: 0,
      energyInputHeatDelivered: 0,
      energyInputTotal: 0,
      flueGasSystemLosses: 0,
      flueGasGrossHeat: 0,
      flueGasAvailableHeat: 0,
      grossHeatInput: 0,
      heatingSystemEfficiency: 0,
      calculatedExcessAir: 0,
      calculatedFlueGasO2: 0,
      availableHeatPercent: 0,
      hourlyEAFResults: {
        naturalGasUsed: 0,
        otherFuelUsed: 0,
        electricEnergyUsed: 0,
        electrodeHeatingValue: 0,
        coalHeatingValue: 0,
        totalFuelEnergyUsed: 0,
        coalCarbonUsed: 0,
        electrodeEnergyUsed: 0,
      },
      annualEAFResults: {
        naturalGasUsed: 0,
        otherFuelUsed: 0,
        electricEnergyUsed: 0,
        totalFuelEnergyUsed: 0,
        electrodeHeatingValue: 0,
        coalHeatingValue: 0,
        coalCarbonUsed: 0,
        electrodeEnergyUsed: 0,
      },
      co2EmissionsOutput: {
        hourlyTotalEmissionOutput: undefined,
        totalEmissionOutput: undefined,
        fuelEmissionOutput: undefined,
        electricityEmissionOutput: undefined,
        emissionsSavings: undefined,
        electrodeEmissionsOutput: undefined,
        otherFuelEmissionsOutput: undefined,
        coalCarbonEmissionsOutput: undefined,
      }
    };
    return results;
  }

  getResults(phast: PHAST, settings: Settings): PhastResults {
    let resultCats: ShowResultsCategories = this.getResultCategories(settings);
    let results: PhastResults = this.initResults();
    results.exothermicHeat = 0 - Math.abs(this.phastService.sumChargeMaterialExothermic(phast.losses.chargeMaterials, settings));
    results.totalInput = this.phastService.sumHeatInput(phast.losses, settings);
    if (this.checkLoss(phast.losses.wallLosses)) {
      results.totalWallLoss = this.phastService.sumWallLosses(phast.losses.wallLosses, settings);
    }
    if (this.checkLoss(phast.losses.atmosphereLosses)) {
      results.totalAtmosphereLoss = this.phastService.sumAtmosphereLosses(phast.losses.atmosphereLosses, settings);
    }
    if (this.checkLoss(phast.losses.otherLosses)) {
      results.totalOtherLoss = this.phastService.sumOtherLosses(phast.losses.otherLosses);
    }
    if (this.checkLoss(phast.losses.coolingLosses)) {
      results.totalCoolingLoss = this.phastService.sumCoolingLosses(phast.losses.coolingLosses, settings);
    }
    if (this.checkLoss(phast.losses.openingLosses)) {
      results.totalOpeningLoss = this.phastService.sumOpeningLosses(phast.losses.openingLosses, settings);
    }
    if (this.checkLoss(phast.losses.fixtureLosses)) {
      results.totalFixtureLoss = this.phastService.sumFixtureLosses(phast.losses.fixtureLosses, settings);
    }
    if (this.checkLoss(phast.losses.leakageLosses)) {
      results.totalLeakageLoss = this.phastService.sumLeakageLosses(phast.losses.leakageLosses, settings);
    }
    if (this.checkLoss(phast.losses.extendedSurfaces)) {
      results.totalExtSurfaceLoss = this.phastService.sumExtendedSurface(phast.losses.extendedSurfaces, settings);
    }
    if (this.checkLoss(phast.losses.chargeMaterials)) {
      results.totalChargeMaterialLoss = this.phastService.sumChargeMaterials(phast.losses.chargeMaterials, settings, undefined);
    }
    if (resultCats.showAuxPower && this.checkLoss(phast.losses.auxiliaryPowerLosses)) {
      results.totalAuxPower = this.phastService.sumAuxilaryPowerLosses(phast.losses.auxiliaryPowerLosses);
    }

    if (resultCats.showSlag && this.checkLoss(phast.losses.slagLosses)) {
      results.totalSlag = this.phastService.sumSlagLosses(phast.losses.slagLosses, settings);
    }
    if (resultCats.showExGas && this.checkLoss(phast.losses.exhaustGasEAF)) {
      results.totalExhaustGasEAF = this.phastService.sumExhaustGasEAF(phast.losses.exhaustGasEAF, settings);
      results.grossHeatInput = results.totalInput - Math.abs(results.exothermicHeat);
    }

    //EAF
    if (resultCats.showEnInput1 && this.checkLoss(phast.losses.energyInputEAF)) {
      let tmpForm = this.energyInputService.getFormFromLoss(phast.losses.energyInputEAF[0], undefined);
      if (tmpForm.status === 'VALID') {
        results = this.setEAFResults(phast, results, settings);
      }
      //if no exhaust gas EAF
      if (!this.checkLoss(phast.losses.exhaustGasEAF)) {
        results.energyInputTotal = phast.losses.energyInputEAF[0].electricityInput + results.energyInputTotalChemEnergy;
        results.energyInputHeatDelivered = phast.losses.energyInputEAF[0].electricityInput;
        results.totalExhaustGasEAF = results.energyInputTotal - results.totalInput - results.exothermicHeat;
        results.grossHeatInput = results.energyInputHeatDelivered + results.energyInputTotalChemEnergy;
      }
    }

    if (resultCats.showEnInput2 && this.checkLoss(phast.losses.energyInputExhaustGasLoss)) {
      let tmpForm = this.energyInputExhaustGasService.getFormFromLoss(phast.losses.energyInputExhaustGasLoss[0]);
      if (tmpForm.status === 'VALID') {
        let energyInputResults: EnergyExhaustGasOutput = this.phastService.energyInputExhaustGasLosses(phast.losses.energyInputExhaustGasLoss[0], settings);
        results.energyInputHeatDelivered = energyInputResults.fuelHeatDelivered;
        results.totalExhaustGas = energyInputResults.exhaustGasLosses;
        results.availableHeatPercent = energyInputResults.availableHeat;
        results.electricalHeatDelivered = results.totalInput - energyInputResults.fuelHeatDelivered;
        results.electricalHeaterLosses = results.electricalHeatDelivered * ((1 / energyInputResults.electricalEfficiency) - 1);
        results.totalAdditionalFuelHeat = phast.losses.energyInputExhaustGasLoss[0].totalHeatInput;
        results.totalProvidedElectricalHeat = results.electricalHeatDelivered + results.electricalHeaterLosses;
        results.grossHeatInput = results.totalInput - Math.abs(results.exothermicHeat) + energyInputResults.exhaustGasLosses + results.electricalHeaterLosses;
      }
    }

    if (phast.systemEfficiency && resultCats.showSystemEff) {
      results.heatingSystemEfficiency = phast.systemEfficiency;
      let grossHeatInput = (results.totalInput / (phast.systemEfficiency / 100));
      results.totalSystemLosses = grossHeatInput * (1 - (phast.systemEfficiency / 100));
      results.grossHeatInput = results.totalInput + results.totalSystemLosses - Math.abs(results.exothermicHeat);
    }

    if (resultCats.showFlueGas && this.checkLoss(phast.losses.flueGasLosses)) {
      let tmpFlueGas = phast.losses.flueGasLosses[0];
      if (tmpFlueGas) {
        if (tmpFlueGas.flueGasType === 'By Mass') {
          let tmpForm = this.flueGasFormService.initByMassFormFromLoss(tmpFlueGas, true);
          if (tmpForm.status === 'VALID') {
            let gases: Array<SolidLiquidFlueGasMaterial> = this.sqlDbApiService.selectSolidLiquidFlueGasMaterials();
            let selectedGas: SolidLiquidFlueGasMaterial = gases.find(gas => { return gas.id == tmpFlueGas.flueGasByMass.gasTypeId });
            let availableHeat: number = this.phastService.flueGasByMass(tmpFlueGas.flueGasByMass, settings);
            if (tmpFlueGas.flueGasByMass.oxygenCalculationMethod == 'Excess Air' && selectedGas) {
              results.calculatedExcessAir = tmpFlueGas.flueGasByMass.excessAirPercentage;
              let fluGasCo2Inputs: MaterialInputProperties = {
                carbon: selectedGas.carbon,
                hydrogen: selectedGas.hydrogen,
                sulphur: selectedGas.sulphur,
                inertAsh: selectedGas.inertAsh,
                o2: selectedGas.o2,
                moisture: selectedGas.moisture,
                nitrogen: selectedGas.nitrogen,
                excessAir: tmpFlueGas.flueGasByMass.excessAirPercentage,
                moistureInAirCombustion: tmpFlueGas.flueGasByMass.moistureInAirCombustion
              }
              results.calculatedFlueGasO2 = this.phastService.flueGasByMassCalculateO2(fluGasCo2Inputs);
            } else if (tmpFlueGas.flueGasByMass.oxygenCalculationMethod == 'Oxygen in Flue Gas' && selectedGas) {
              results.calculatedFlueGasO2 = tmpFlueGas.flueGasByMass.o2InFlueGas;
              //TODO: cal excessAir
              let fluGasCo2Inputs: MaterialInputProperties = {
                carbon: selectedGas.carbon,
                hydrogen: selectedGas.hydrogen,
                sulphur: selectedGas.sulphur,
                inertAsh: selectedGas.inertAsh,
                o2: selectedGas.o2,
                moisture: selectedGas.moisture,
                nitrogen: selectedGas.nitrogen,
                o2InFlueGas: tmpFlueGas.flueGasByMass.o2InFlueGas,
                moistureInAirCombustion: tmpFlueGas.flueGasByMass.moistureInAirCombustion
              }
              results.calculatedExcessAir = this.phastService.flueGasByMassCalculateExcessAir(fluGasCo2Inputs);
            }


            results.flueGasAvailableHeat = availableHeat * 100;
            results.flueGasGrossHeat = (results.totalInput / availableHeat);
            results.flueGasSystemLosses = results.flueGasGrossHeat * (1 - availableHeat);
            results.totalFlueGas = results.flueGasSystemLosses;
          }
        } else if (tmpFlueGas.flueGasType === 'By Volume') {
          let tmpForm = this.flueGasFormService.initByVolumeFormFromLoss(tmpFlueGas, true);
          if (tmpForm.status === 'VALID') {
            let flueGasResults: FlueGasByVolumeSuiteResults = this.phastService.flueGasByVolume(tmpFlueGas.flueGasByVolume, settings);
            let availableHeat = flueGasResults.availableHeat;

            results.calculatedFlueGasO2 = flueGasResults.flueGasO2 * 100;
            results.calculatedExcessAir = flueGasResults.excessAir * 100;
            results.flueGasAvailableHeat = availableHeat * 100;
            results.flueGasGrossHeat = (results.totalInput / availableHeat);
            results.flueGasSystemLosses = results.flueGasGrossHeat * (1 - availableHeat);
            results.totalFlueGas = results.flueGasSystemLosses;
          }
        }
        results.grossHeatInput = results.totalInput + results.flueGasSystemLosses - Math.abs(results.exothermicHeat);
      }
    }

    if (phast.co2SavingsData) {
      results.co2EmissionsOutput = this.co2SavingPhastService.setCo2EmissionsResults(phast, results, settings);   
    } 

    return results;
  }

  
  getEnergyUseReportData(phast: PHAST, phastResults: PhastResults, settings: Settings): EnergyUseReportData {
    let energyUseReportData: EnergyUseReportData = {
      fuelName: undefined,
      fuelEnergyUsed: undefined,
      fuelHeatingValue: undefined,
      energyPerMassUnit: undefined,
      electricEnergyUsed: undefined,
      baseEnergyUnit: undefined,
      steamEnergyUsed: undefined
    };

    if (settings.energySourceType === 'Electricity') {
      energyUseReportData.electricEnergyUsed = phastResults.electricalHeatDelivered;
      if (settings.furnaceType === 'Electric Arc Furnace (EAF)') {
        energyUseReportData.fuelName = 'Natural Gas';
        energyUseReportData.electricEnergyUsed = phastResults.hourlyEAFResults.electricEnergyUsed;
        energyUseReportData.fuelHeatingValue = phastResults.hourlyEAFResults.naturalGasHeatingValue;
        energyUseReportData.fuelEnergyUsed = phastResults.hourlyEAFResults.naturalGasUsed;
        if (settings.unitsOfMeasure == 'Imperial') {
          energyUseReportData.energyPerMassUnit = 'Btu/lb';
          energyUseReportData.baseEnergyUnit = 'MMBtu';
        } else {
          energyUseReportData.energyPerMassUnit = 'kJ/kg';
          energyUseReportData.baseEnergyUnit = 'GJ';
        }
      } else {
        energyUseReportData.fuelEnergyUsed = phastResults.energyInputHeatDelivered + phastResults.totalExhaustGas;
      }
    } else if (settings.energySourceType === 'Steam') {
      energyUseReportData.steamEnergyUsed = phastResults.grossHeatInput;
    } else { 
      energyUseReportData.fuelEnergyUsed = phastResults.grossHeatInput;
    }

    if (phast.losses.flueGasLosses) {
      if (phast.losses.flueGasLosses[0].flueGasType === 'By Mass') {
        let gas: SolidLiquidFlueGasMaterial = this.sqlDbApiService.selectSolidLiquidFlueGasMaterialById(phast.losses.flueGasLosses[0].flueGasByMass.gasTypeId);
        if (gas) {
          energyUseReportData.fuelHeatingValue = gas.heatingValue;
          energyUseReportData.fuelName = gas.substance;
        }
      } else if (phast.losses.flueGasLosses[0].flueGasType === 'By Volume') {
        let gas: FlueGasMaterial = this.sqlDbApiService.selectGasFlueGasMaterialById(phast.losses.flueGasLosses[0].flueGasByVolume.gasTypeId);
        if (gas) {
          energyUseReportData.fuelHeatingValue = gas.heatingValue;
          energyUseReportData.fuelName = gas.substance;
        }
      }

      if (settings.unitsOfMeasure === 'Metric') {
        energyUseReportData.fuelHeatingValue = this.convertUnitsService.value(energyUseReportData.fuelHeatingValue).from('kJ').to(settings.energyResultUnit);
      } else {
        energyUseReportData.fuelHeatingValue = this.convertUnitsService.value(energyUseReportData.fuelHeatingValue).from('Btu').to(settings.energyResultUnit);
      }
    }

    return energyUseReportData;
  }  



  setEAFResults(phast: PHAST, phastResults: PhastResults, settings: Settings): PhastResults {
    let EAFInputs: EnergyInputEAF = JSON.parse(JSON.stringify(phast.losses.energyInputEAF[0]));
    let naturalGasHeatingValue: number = 22030.7;
    if (settings.unitsOfMeasure === 'Metric') {
      naturalGasHeatingValue = this.convertUnitsService.value(naturalGasHeatingValue).from('Btu').to('kJ');
    } 
    let eafResults: EAFResults = {
      naturalGasUsed: EAFInputs.naturalGasHeatInput,
      electricEnergyUsed: EAFInputs.electricityInput,
      totalFuelEnergyUsed: undefined,
      electrodeHeatingValue: EAFInputs.electrodeHeatingValue,
      electrodeUse: EAFInputs.electrodeUse,
      coalHeatingValue: EAFInputs.coalHeatingValue,
      // coalCarbonInjection is in lb/hr the coalHeatingValue is in btu/lb.  the lbs cancel and you have btu/hr
      coalCarbonUsed: EAFInputs.coalCarbonInjection * EAFInputs.coalHeatingValue,
      electrodeEnergyUsed: EAFInputs.electrodeUse * EAFInputs.electrodeHeatingValue,
      otherFuelUsed: EAFInputs.otherFuels,
      naturalGasHeatingValue: naturalGasHeatingValue
    };
     if (settings.unitsOfMeasure == 'Metric') {
      eafResults.coalCarbonUsed = this.convertUnitsService.value(eafResults.coalCarbonUsed).from('kJ').to('GJ');
      eafResults.electrodeEnergyUsed = this.convertUnitsService.value(eafResults.electrodeEnergyUsed).from('kJ').to('GJ');
    } else {
      eafResults.coalCarbonUsed = this.convertUnitsService.value(eafResults.coalCarbonUsed).from('Btu').to('MMBtu');
      eafResults.electrodeEnergyUsed = this.convertUnitsService.value(eafResults.electrodeEnergyUsed).from('Btu').to('MMBtu');
    }
    
    eafResults.totalFuelEnergyUsed = eafResults.naturalGasUsed + eafResults.coalCarbonUsed + eafResults.electrodeEnergyUsed + eafResults.otherFuelUsed;
    phastResults.hourlyEAFResults = eafResults;

    let annualEAFResults: EAFResults = JSON.parse(JSON.stringify(eafResults));
    annualEAFResults.coalCarbonUsed = eafResults.coalCarbonUsed * phast.operatingHours.hoursPerYear;
    annualEAFResults.coalHeatingValue = eafResults.coalHeatingValue * phast.operatingHours.hoursPerYear;
    annualEAFResults.electrodeEnergyUsed = eafResults.electrodeEnergyUsed * phast.operatingHours.hoursPerYear;
    annualEAFResults.electrodeHeatingValue = eafResults.electrodeHeatingValue * phast.operatingHours.hoursPerYear;
    annualEAFResults.naturalGasUsed = eafResults.naturalGasUsed * phast.operatingHours.hoursPerYear;
    annualEAFResults.naturalGasHeatingValue = eafResults.naturalGasHeatingValue * phast.operatingHours.hoursPerYear;
    annualEAFResults.otherFuelUsed = eafResults.otherFuelUsed * phast.operatingHours.hoursPerYear;
    annualEAFResults.electricEnergyUsed = eafResults.electricEnergyUsed * phast.operatingHours.hoursPerYear;
    annualEAFResults.totalFuelEnergyUsed = eafResults.totalFuelEnergyUsed * phast.operatingHours.hoursPerYear;

    phastResults.annualEAFResults = annualEAFResults;

    // Legacy results
    let tmpResults = this.phastService.energyInputEAF(EAFInputs, settings);
    phastResults.energyInputTotalChemEnergy = tmpResults.totalChemicalEnergyInput;
    //use grossHeatInput here because it will be updated if exhaustGasEAF exists
    phastResults.grossHeatInput = phastResults.grossHeatInput + phastResults.totalExhaustGasEAF;
    phastResults.energyInputHeatDelivered = phastResults.grossHeatInput - tmpResults.totalChemicalEnergyInput;
    phastResults.energyInputTotal = phastResults.grossHeatInput;

    return phastResults;
  }



  getResultCategories(settings: Settings): ShowResultsCategories {
    let tmpResultCategories: ShowResultsCategories = {
      showSlag: false,
      showAuxPower: false,
      showSystemEff: false,
      showFlueGas: false,
      showEnInput1: false,
      showEnInput2: false,
      showExGas: false,
      showHeatDelivered: false,
      showElectricalDelivered: false,
      showChemicalEnergyDelivered: false,
    };
    if (settings.energySourceType === 'Fuel') {
      tmpResultCategories.showFlueGas = true;
      tmpResultCategories.showHeatDelivered = true;
    } else if (settings.energySourceType === 'Electricity') {
      tmpResultCategories.showHeatDelivered = true;
      tmpResultCategories.showElectricalDelivered = true;
      if (settings.furnaceType === 'Electric Arc Furnace (EAF)') {
        tmpResultCategories.showSlag = true;
        tmpResultCategories.showExGas = true;
        tmpResultCategories.showEnInput1 = true;
        tmpResultCategories.showHeatDelivered = false;
        tmpResultCategories.showChemicalEnergyDelivered = true;
      } else if (settings.furnaceType !== 'Custom Electrotechnology') {
        tmpResultCategories.showAuxPower = true;
        tmpResultCategories.showEnInput2 = true;
      } else if (settings.furnaceType === 'Custom Electrotechnology') {
        tmpResultCategories.showSystemEff = true;
      }
    } else if (settings.energySourceType === 'Steam') {
      tmpResultCategories.showSystemEff = true;
    }
    return tmpResultCategories;
  }

  calculatedByPhast(phast: PHAST, settings: Settings) {
    let sumFeedRate = 0;
    let phastResults = this.initResults();
    if (phast.losses) {
      sumFeedRate = this.phastService.sumChargeMaterialFeedRate(phast.losses.chargeMaterials);
      phastResults = this.getResults(phast, settings);
    }
    let calculatedFuelEnergyUsed = phastResults.grossHeatInput;
    let calculatedEnergyIntensity = (calculatedFuelEnergyUsed / sumFeedRate);
    //calculates aux equipment
    let tmpAuxResults = this.auxEquipmentService.calculate(phast);
    //sum aux equipment results
    let calculatedElectricityUsed = this.auxEquipmentService.getResultsSum(tmpAuxResults);
    if (settings.energyResultUnit === 'MMBtu') {
      calculatedEnergyIntensity = this.convertUnitsService.value(calculatedEnergyIntensity).from('MMBtu').to('Btu');
    } else if (settings.energyResultUnit === 'GJ') {
      calculatedEnergyIntensity = this.convertUnitsService.value(calculatedEnergyIntensity).from('GJ').to('kJ');
    }
    let phastCalcs: CalculatedByPhast = {
      fuelEnergyUsed: calculatedFuelEnergyUsed,
      energyIntensity: calculatedEnergyIntensity,
      electricityUsed: calculatedElectricityUsed
    };
    return phastCalcs;
  }


  getAvailableHeat(data: PhastResults, settings: Settings): number {
    let resultCategories: ShowResultsCategories = this.getResultCategories(settings);
    if (resultCategories.showFlueGas) {
      return data.flueGasAvailableHeat;
    }

    if (resultCategories.showSystemEff) {
      return data.heatingSystemEfficiency;
    }

    if (resultCategories.showEnInput2) {
      return data.availableHeatPercent;
    }

    if (resultCategories.showExGas) {
      return (1 - (data.totalExhaustGasEAF / data.grossHeatInput)) * 100;
    }
  }


}

export interface EnergyInputWarnings {
  energyInputHeatDelivered: string,
  electricityInputWarning?: string
}