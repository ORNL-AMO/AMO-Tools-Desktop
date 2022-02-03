import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { EnergyData } from '../../../shared/models/phast/losses/chargeMaterial';
import { CoolingLoss, CoolingLossOutput, CoolingLossResults } from '../../../shared/models/phast/losses/coolingLoss';
import { Settings } from '../../../shared/models/settings';
import { EnergyFormService } from '../charge-material/energy-form/energy-form.service';
import { CoolingFormService } from './cooling-form.service';

@Injectable()
export class CoolingService {
  baselineData: BehaviorSubject<Array<CoolingLoss>>;
  modificationData: BehaviorSubject<Array<CoolingLoss>>;
  baselineEnergyData: BehaviorSubject<EnergyData>;
  modificationEnergyData: BehaviorSubject<EnergyData>;
  output: BehaviorSubject<CoolingLossOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  energySourceType: BehaviorSubject<string>;

  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private coolingFormService: CoolingFormService, 
    private energyFormService: EnergyFormService,
    private convertUnitsService: ConvertUnitsService, 
    private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<Array<CoolingLoss>>(undefined);
    this.modificationData = new BehaviorSubject<Array<CoolingLoss>>(undefined);
    this.baselineEnergyData = new BehaviorSubject<EnergyData>(undefined);
    this.modificationEnergyData = new BehaviorSubject<EnergyData>(undefined);
    this.output = new BehaviorSubject<CoolingLossOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculate(settings: Settings) {
    let baselineCoolingLosses: Array<CoolingLoss> = this.baselineData.getValue();
    let modificationCoolingLosses: Array<CoolingLoss> = this.modificationData.getValue();
    let baselineResults: CoolingLossResults;
    let modificationResults: CoolingLossResults;
    let baselineEnergyData: EnergyData = this.baselineEnergyData.getValue();
    let modificationEnergyData: EnergyData = this.modificationEnergyData.getValue();

    this.initDefaultEmptyOutput();
    let output: CoolingLossOutput = this.output.getValue();
    output.energyUnit = this.getAnnualEnergyUnit(baselineEnergyData.energySourceType, settings);

    baselineCoolingLosses.forEach((loss, index) => {
      let validBaseline = this.getValidCoolingLoss(loss, baselineEnergyData);
      baselineResults = this.getCoolingLossResult(loss, baselineEnergyData, validBaseline, settings);
      if (baselineResults) {
        output.baseline.losses.push(baselineResults);
        output.baseline.totalFuelUse += baselineResults.fuelUse;
        output.baseline.totalFuelCost += baselineResults.fuelCost;
        output.baseline.grossLoss += baselineResults.grossLoss;
      }

      if (modificationCoolingLosses && modificationCoolingLosses[index]) {
        let validModification = this.getValidCoolingLoss(modificationCoolingLosses[index], modificationEnergyData);
        modificationResults = this.getCoolingLossResult(modificationCoolingLosses[index], modificationEnergyData, validModification, settings);
        if (modificationResults) {
          output.modification.losses.push(modificationResults);
          output.modification.totalFuelUse += modificationResults.fuelUse;
          output.modification.totalFuelCost += modificationResults.fuelCost;
          output.modification.grossLoss += modificationResults.grossLoss;
        }
      }
    });

    if (baselineResults && modificationResults) {
      output.fuelSavings = output.baseline.totalFuelUse - output.modification.totalFuelUse;
      output.costSavings = output.baseline.totalFuelCost - output.modification.totalFuelCost;
    }

    this.output.next(output);
  }

  getValidCoolingLoss(coolingLoss: CoolingLoss, energyData: EnergyData) {
    let valid: boolean = false;
    if (coolingLoss.coolingMedium == "Liquid" && coolingLoss.liquidCoolingLoss) {
      valid = this.coolingFormService.initLiquidFormFromLoss(coolingLoss).valid;
    }
    if (coolingLoss.coolingMedium == "Gas" && coolingLoss.gasCoolingLoss) {
      valid = this.coolingFormService.initGasFormFromLoss(coolingLoss).valid;
    }

    valid = valid && this.energyFormService.getEnergyForm(energyData).valid;
    return valid;
  }

  getCoolingLossResult(coolingLossData: CoolingLoss, energyData: EnergyData, isValid: boolean, settings: Settings): CoolingLossResults {
    let calculatorEnergyUnit = this.getAnnualEnergyUnit(energyData.energySourceType, settings);
    let result: CoolingLossResults = {
      coolingLoss: 0,
      grossLoss: 0,
      fuelUse: 0,
      fuelCost: 0,
      energyUnit: calculatorEnergyUnit
    }

    if (isValid) {
      if (coolingLossData && coolingLossData.coolingMedium == 'Gas') {
        result.coolingLoss = this.phastService.gasCoolingLosses(coolingLossData.gasCoolingLoss, settings, calculatorEnergyUnit);
      } else if (coolingLossData && coolingLossData.coolingMedium == 'Liquid') {
        result.coolingLoss = this.phastService.liquidCoolingLosses(coolingLossData.liquidCoolingLoss, settings, calculatorEnergyUnit);
      }
      result.grossLoss =  (result.coolingLoss / energyData.availableHeat) * 100;
      result.fuelUse = result.grossLoss * energyData.hoursPerYear;
      result.fuelCost = result.fuelUse * energyData.fuelCost;
    }
    return result;
  }

  initDefaultEmptyInputs(settings: Settings) {
    let emptyBaselineData: CoolingLoss = this.initDefaultLoss(0, settings);
    let baselineData: Array<CoolingLoss> = [emptyBaselineData];
    this.baselineData.next(baselineData);
    this.modificationData.next(undefined);

    let energyData: EnergyData = {
      energySourceType: "Fuel",
      fuelCost: 0,
      hoursPerYear: 8760,
      availableHeat: 100
    }
    this.baselineEnergyData.next(energyData);
    this.modificationEnergyData.next(undefined);
    this.energySourceType.next('Fuel');

  }

  initDefaultLoss(index: number, settings: Settings, coolingLoss?: CoolingLoss) {
    let coolingMedium = coolingLoss? coolingLoss.coolingMedium : 'Liquid';
    let defaultGasDensity: number = .074887;
    let defaultGasSpecificHeat: number = .2371;
    let defaultLiquidDensity: number = 8.338;
    let defaultLiquidSpecificHeat: number = 1;

    if (settings.unitsOfMeasure === 'Metric') {
      defaultGasDensity = 1.2;
      defaultGasSpecificHeat = 0.993;
      defaultLiquidDensity = .999;
      defaultLiquidSpecificHeat = 4.187;
    }

    let loss: CoolingLoss;
    if (coolingMedium == 'Liquid') {
      loss = {
        name: 'Loss #' + (index + 1),
        coolingMedium: 'Liquid',
        gasCoolingLoss: undefined,
        liquidCoolingLoss: {
          flowRate: 0,
          initialTemperature: 0,
          outletTemperature: 0,
          finalTemperature: 0,
          specificHeat: defaultLiquidSpecificHeat,
          correctionFactor: 1.0,
          density: defaultLiquidDensity,
        }
      }
    } else if (coolingMedium == 'Gas') {
      loss = {
        name: 'Loss #' + (index + 1),
        coolingMedium: 'Gas',
        liquidCoolingLoss: undefined,
        gasCoolingLoss: {
          flowRate: 0,
          initialTemperature: 0,
          outletTemperature: 0,
          finalTemperature: 0,
          specificHeat: defaultGasSpecificHeat,
          correctionFactor: 1.0,
          gasDensity: defaultGasDensity,
        }
      }
    }

    return loss;
  }

  initDefaultEmptyOutput() {
     let output: CoolingLossOutput = {
      baseline: {totalFuelUse: 0, grossLoss: 0, totalFuelCost: 0, losses: []},
      modification: {totalFuelUse: 0, grossLoss: 0, totalFuelCost: 0, losses: []},
      fuelSavings: 0,
      costSavings: 0
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: Array<CoolingLoss> = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    let currentBaselineEnergy: EnergyData = this.baselineEnergyData.getValue();
    let baselineEnergyCopy: EnergyData = JSON.parse(JSON.stringify(currentBaselineEnergy));

    this.modificationEnergyData.next(baselineEnergyCopy);
    this.modificationData.next(currentBaselineCopy);
  }

  updateDataArray(data: CoolingLoss, index: number, isBaseline: boolean) {
    let dataArray: Array<CoolingLoss>;
    if (isBaseline) {
      dataArray = this.baselineData.getValue();
    } else {
      dataArray = this.modificationData.getValue();
    }
    // dataArray won't exist during reset cycle w/ multiple subjects emitting
    if (dataArray && dataArray[index]) {
      Object.assign(dataArray[index], data);
    }

     if (isBaseline) {
      this.baselineData.next(dataArray);
    } else {
      this.modificationData.next(dataArray);
    }
  }

    
  removeLoss(i: number) {
    let currentBaselineData: Array<CoolingLoss> = this.baselineData.getValue();
    currentBaselineData.splice(i, 1);
    this.baselineData.next(currentBaselineData);
    let currentModificationData: Array<CoolingLoss> = this.modificationData.getValue();
    if (currentModificationData) {
      currentModificationData.splice(i, 1);
      this.modificationData.next(currentModificationData);
    }
  }
  
  addLoss(settings, treasureHours: number, modificationExists: boolean) {
    let currentBaselineData: Array<CoolingLoss> = JSON.parse(JSON.stringify(this.baselineData.getValue()));
    let index = currentBaselineData.length;
    let baselineObj: CoolingLoss = this.initDefaultLoss(index, settings, currentBaselineData[0]);
    currentBaselineData.push(baselineObj)
    this.baselineData.next(currentBaselineData);
    
    if (modificationExists) {
      let currentModificationData: Array<CoolingLoss> = this.modificationData.getValue();
      let modificationObj: CoolingLoss = this.initDefaultLoss(index, settings, currentBaselineData[0]);
      currentModificationData.push(modificationObj);
      this.modificationData.next(currentModificationData);
    }

    let currentBaselineEnergy = this.baselineEnergyData.getValue();
    
    if (treasureHours) {
      currentBaselineEnergy.hoursPerYear = treasureHours;
      this.baselineEnergyData.next(currentBaselineEnergy);

      let currentModificationEnergy = this.modificationEnergyData.getValue();
      currentModificationEnergy.hoursPerYear = treasureHours;
      this.modificationEnergyData.next(currentModificationEnergy);
    }

  }

  generateExampleData(settings: Settings) {
    let specificHeat: number = 1;
    let initialTemperature: number = 77;
    let outletTemperature: number = 91;
    let modOutletTemperature: number = 82;
    let flowRate: number = 3450;
    let density: number = 8.338;

    if(settings.unitsOfMeasure != 'Imperial'){
      specificHeat = this.convertUnitsService.value(specificHeat).from('btuScfF').to('kJm3C');
      specificHeat = Number(specificHeat.toFixed(5));

      initialTemperature = this.convertUnitsService.value(initialTemperature).from('F').to('C');
      initialTemperature = Number(initialTemperature.toFixed(2));

      outletTemperature = this.convertUnitsService.value(outletTemperature).from('F').to('C');
      outletTemperature = Number(outletTemperature.toFixed(2));

      modOutletTemperature = this.convertUnitsService.value(modOutletTemperature).from('F').to('C');
      modOutletTemperature = Number(outletTemperature.toFixed(2));
      
      flowRate = this.convertUnitsService.value(flowRate).from('gal').to('L');
      flowRate = Number(outletTemperature.toFixed(2));

      density = this.convertUnitsService.value(density).from('lbgal').to('kgL');
      density = Number(outletTemperature.toFixed(2));
    }


    let energyExample: EnergyData = {
      energySourceType: 'Fuel',
      hoursPerYear: 8760,
      fuelCost: 3.99,
      availableHeat: 100
    };

    let baselineExample: CoolingLoss = {
      name: 'Loss #1',
      coolingMedium: 'Liquid',
      liquidCoolingLoss: {
        flowRate: flowRate,
        initialTemperature: initialTemperature,
        outletTemperature: outletTemperature,
        finalTemperature: 0,
        specificHeat: specificHeat,
        correctionFactor: 1.0,
        density: density
      }
    };
    
    let modExample: CoolingLoss = {
      name: 'Loss #1',
      coolingMedium: 'Liquid',
      liquidCoolingLoss: {
        flowRate: flowRate,
        initialTemperature: initialTemperature,
        outletTemperature: modOutletTemperature,
        finalTemperature: 0,
        specificHeat: specificHeat,
        correctionFactor: 1.0,
        density: density
      }
    };

    this.energySourceType.next('Fuel');
    this.baselineEnergyData.next(energyExample);
    this.modificationEnergyData.next(energyExample);
    
    this.baselineData.next([baselineExample]);
    this.modificationData.next([modExample]);
    this.generateExample.next(true);
  }

  getAnnualEnergyUnit(energySourceType: string, settings: Settings) {
    let energyUnit: string = settings.energyResultUnit;
    if (energySourceType === 'Electricity') {
      energyUnit = settings.phastRollupElectricityUnit;
    } 
    if (energySourceType === 'Steam') {
      energyUnit = settings.phastRollupSteamUnit;;
    } 
    if (energySourceType === 'Fuel') {
      energyUnit = settings.phastRollupFuelUnit;;
    } 
    return energyUnit;
  }

}