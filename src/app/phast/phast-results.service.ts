import { Injectable } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories, CalculatedByPhast } from '../shared/models/phast/phast';
import { PhastService } from './phast.service';
import { Settings } from '../shared/models/settings';
import { AuxEquipmentService } from './aux-equipment/aux-equipment.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { EnergyInputExhaustGasService } from './losses/energy-input-exhaust-gas-losses/energy-input-exhaust-gas.service';
import { EnergyInputService } from './losses/energy-input/energy-input.service';
import { FlueGasFormService } from '../calculator/furnaces/flue-gas/flue-gas-form.service';
import { FlueGasByVolumeSuiteResults } from '../shared/models/phast/losses/flueGas';
import { Co2SavingsPhastService } from './losses/operations/co2-savings-phast/co2-savings-phast.service';
import { EnergyInputEAF } from '../shared/models/phast/losses/energyInputEAF';


@Injectable()
export class PhastResultsService {

  constructor(private phastService: PhastService,
    private flueGasFormService: FlueGasFormService,
    private auxEquipmentService: AuxEquipmentService,
    private convertUnitsService: ConvertUnitsService,
    private energyInputExhaustGasService: EnergyInputExhaustGasService,
    private energyInputService: EnergyInputService,
    private co2SavingPhastService: Co2SavingsPhastService) { }
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
      availableHeatPercent: 0
    };
    return results;
  }

  getResults(phast: PHAST, settings: Settings): PhastResults {
    let resultCats: ShowResultsCategories = this.getResultCategories(settings);
    let results: PhastResults = this.initResults();
    results.exothermicHeat = 0 - Math.abs(this.phastService.sumChargeMaterialExothermic(phast.losses.chargeMaterials, settings));
    results.totalInput = this.phastService.sumHeatInput(phast.losses, settings);
    results.grossHeatInput = results.totalInput;
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
        let tmpResults = this.phastService.energyInputExhaustGasLosses(phast.losses.energyInputExhaustGasLoss[0], settings);
        results.energyInputHeatDelivered = tmpResults.heatDelivered;
        results.totalExhaustGas = tmpResults.exhaustGasLosses;
        results.grossHeatInput = results.totalInput - Math.abs(results.exothermicHeat) + tmpResults.exhaustGasLosses;
        results.availableHeatPercent = tmpResults.availableHeat;
        results.electricalHeatDelivered = results.grossHeatInput - results.energyInputHeatDelivered - results.totalExhaustGas;
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
            const availableHeat = this.phastService.flueGasByMass(tmpFlueGas.flueGasByMass, settings);
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
      phast.co2SavingsData.electricityUse = results.grossHeatInput;
      results.co2EmissionsOutput = this.co2SavingPhastService.getCo2EmissionsResult(phast.co2SavingsData, settings);   
    } else {
      results.co2EmissionsOutput = 0;
    }

    return results;
  }

  setEAFResults(phast: PHAST, results: PhastResults, settings: Settings): PhastResults {
    let EAFInputs: EnergyInputEAF = JSON.parse(JSON.stringify(phast.losses.energyInputEAF[0]));
    results.EAFCoalCarbonUsed = EAFInputs.coalCarbonInjection * EAFInputs.coalHeatingValue;
    results.EAFElectrodeUsed = EAFInputs.electrodeUse * EAFInputs.electrodeHeatingValue;
    results.EAFNaturalGasUsed = EAFInputs.naturalGasHeatInput;
    results.EAFOtherFuelUsed = EAFInputs.otherFuels;
    results.EAFElectricEnergyUsed = EAFInputs.electricityInput;
    
    results.EAFCoalHeatingValue = EAFInputs.coalHeatingValue;
    results.EAFElectrodeHeatingValue = EAFInputs.electrodeHeatingValue;
    
    if (settings.unitsOfMeasure == 'Metric') {
      results.EAFCoalCarbonUsed = this.convertUnitsService.value(results.EAFCoalCarbonUsed).from('kJ').to('GJ');
      results.EAFElectrodeUsed = this.convertUnitsService.value(results.EAFElectrodeUsed).from('kJ').to('GJ');
    } else {
      results.EAFCoalCarbonUsed = this.convertUnitsService.value(results.EAFCoalCarbonUsed).from('Btu').to('MMBtu');
      results.EAFElectrodeUsed = this.convertUnitsService.value(results.EAFElectrodeUsed).from('Btu').to('MMBtu');
    }
    
    results.EAFTotalFuelEnergyUsed = results.EAFNaturalGasUsed + results.EAFCoalCarbonUsed + results.EAFElectrodeUsed + results.EAFOtherFuelUsed;
    
    // Legacy results
    let tmpResults = this.phastService.energyInputEAF(EAFInputs, settings);
    results.energyInputTotalChemEnergy = tmpResults.totalChemicalEnergyInput;
    //use grossHeatInput here because it will be updated if exhaustGasEAF exists
    results.grossHeatInput = results.grossHeatInput + results.totalExhaustGasEAF;
    results.energyInputHeatDelivered = results.grossHeatInput - tmpResults.totalChemicalEnergyInput;
    results.energyInputTotal = results.grossHeatInput;

    return results;
  }

  getResultCategories(settings: Settings): ShowResultsCategories {
    let tmpResultCategories: ShowResultsCategories = {
      showSlag: false,
      showAuxPower: false,
      showSystemEff: false,
      showFlueGas: false,
      showEnInput1: false,
      showEnInput2: false,
      showExGas: false
    };
    if (settings.energySourceType === 'Fuel') {
      tmpResultCategories.showFlueGas = true;
    } else if (settings.energySourceType === 'Electricity') {
      if (settings.furnaceType === 'Electric Arc Furnace (EAF)') {
        tmpResultCategories.showSlag = true;
        tmpResultCategories.showExGas = true;
        tmpResultCategories.showEnInput1 = true;
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

  getMinElectricityInputRequirement(phast: PHAST, settings: Settings): number {
    if (phast.losses) {
      let results: PhastResults = this.getResults(phast, settings);
      return results.totalInput + results.exothermicHeat - results.energyInputTotalChemEnergy;
    } else {
      return undefined;
    }
  }
}
