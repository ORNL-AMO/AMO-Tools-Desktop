import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PhastService } from '../../../phast/phast.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { OperatingHours } from '../../../shared/models/operations';
import { AtmosphereLoss, AtmosphereLossOutput, AtmosphereLossResults } from '../../../shared/models/phast/losses/atmosphereLoss';
import { Settings } from '../../../shared/models/settings';
import { AtmosphereFormService } from './atmosphere-form.service';

@Injectable()
export class AtmosphereService {

  baselineData: BehaviorSubject<Array<AtmosphereLoss>>;
  modificationData: BehaviorSubject<Array<AtmosphereLoss>>;
  output: BehaviorSubject<AtmosphereLossOutput>;
  
  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  energySourceType: BehaviorSubject<string>;

  generateExample: BehaviorSubject<boolean>;
  operatingHours: OperatingHours;

  modalOpen: BehaviorSubject<boolean>;
  constructor(private atmosphereFormService: AtmosphereFormService, private convertUnitsService: ConvertUnitsService, private phastService: PhastService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);

    this.baselineData = new BehaviorSubject<Array<AtmosphereLoss>>(undefined);
    this.modificationData = new BehaviorSubject<Array<AtmosphereLoss>>(undefined);
    this.output = new BehaviorSubject<AtmosphereLossOutput>(undefined);

    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.energySourceType = new BehaviorSubject<string>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
  }

  calculate(settings: Settings) {
    let baselineAtmosphereLosses: Array<AtmosphereLoss> = this.baselineData.getValue();
    let modificationAtmosphereLosses: Array<AtmosphereLoss> = this.modificationData.getValue();
    let baselineResults: AtmosphereLossResults;
    let modificationResults: AtmosphereLossResults;

    this.initDefaultEmptyOutput();
    let output: AtmosphereLossOutput = this.output.getValue();
    
    let validBaseline = this.checkValidInputData(baselineAtmosphereLosses);
    let validModification: boolean;
    if (modificationAtmosphereLosses) {
      validModification = this.checkValidInputData(modificationAtmosphereLosses);
    }

    if (validBaseline) {
      output.energyUnit = this.getAnnualEnergyUnit(baselineAtmosphereLosses[0].energySourceType, settings);
      baselineAtmosphereLosses.forEach((loss, index) => {
        baselineResults = this.getAtmosphereLossResult(loss, settings);
        if (baselineResults) {
          output.baseline.losses.push(baselineResults);
          output.baseline.totalFuelUse += baselineResults.fuelUse;
          output.baseline.totalFuelCost += baselineResults.fuelCost;
          output.baseline.grossLoss += baselineResults.grossLoss;
        }

        if (validModification && modificationAtmosphereLosses[index]) {

          modificationResults = this.getAtmosphereLossResult(modificationAtmosphereLosses[index], settings);
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
    }

    this.output.next(output);
  }

  checkValidInputData(losses: Array<AtmosphereLoss>):boolean {
    if (losses.length > 0) {
      losses.forEach(data => {
        let form = this.atmosphereFormService.getAtmosphereForm(data);
        if (!form.valid) {
          return false;
        }
      })
      return true;
    } else {
      return false;
    }
  }

  getAtmosphereLossResult(atmosphereLossData: AtmosphereLoss, settings: Settings): AtmosphereLossResults {
    let energyUnit = this.getAnnualEnergyUnit(atmosphereLossData.energySourceType, settings);
    
    let result: AtmosphereLossResults = {
      atmosphereLoss: 0,
      grossLoss: 0,
      fuelUse: 0,
      fuelCost: 0,
      energyUnit: energyUnit
    }
    
    if (atmosphereLossData) {
      result.atmosphereLoss = this.phastService.atmosphere(atmosphereLossData, settings, energyUnit);
      result.grossLoss =  (result.atmosphereLoss / atmosphereLossData.availableHeat) * 100;
      result.fuelUse = result.grossLoss * atmosphereLossData.hoursPerYear;
      result.fuelCost = result.fuelUse * atmosphereLossData.fuelCost;
    }
    return result;
  }

  initDefaultEmptyInputs() {
    let emptyBaselineData: AtmosphereLoss = this.initDefaultLoss(0, undefined);
    let baselineData: Array<AtmosphereLoss> = [emptyBaselineData];
    this.baselineData.next(baselineData);
    this.modificationData.next(undefined);
    this.energySourceType.next('Fuel');

  }

  initDefaultLoss(index: number, treasureHours: number, atmoshpereLoss?: AtmosphereLoss) {
    let fuelCost: number = 0;
    let availableHeat: number = 100;
    let hoursPerYear = 8760;

    if (atmoshpereLoss) {
      fuelCost = atmoshpereLoss.fuelCost;
      availableHeat = atmoshpereLoss.availableHeat;

      if (treasureHours) {
        hoursPerYear = treasureHours;
      } else {
        hoursPerYear = atmoshpereLoss.hoursPerYear;
      }
    }

    let defaultBaselineData: AtmosphereLoss = {
      atmosphereGas: 1,
      specificHeat: 0,
      inletTemperature: 0,
      outletTemperature: 0,
      flowRate: 0,
      correctionFactor: 0,
      heatLoss: 0,
      name: 'Loss #' + (index + 1),
      energySourceType: 'Fuel',
      fuelCost: fuelCost,
      hoursPerYear: hoursPerYear,    
      availableHeat: availableHeat,  
    };

    return defaultBaselineData;
  }


  initDefaultEmptyOutput() {
     let output: AtmosphereLossOutput = {
      baseline: {totalFuelUse: 0, grossLoss: 0, totalFuelCost: 0, losses: []},
      modification: {totalFuelUse: 0, grossLoss: 0, totalFuelCost: 0, losses: []},
      fuelSavings: 0,
      costSavings: 0
    };
    this.output.next(output);
  }

  initModification() {
    let currentBaselineData: Array<AtmosphereLoss> = this.baselineData.getValue();
    let currentBaselineCopy = JSON.parse(JSON.stringify(currentBaselineData));
    this.modificationData.next(currentBaselineCopy);
  }

  updateDataArray(data: AtmosphereLoss, index: number, isBaseline: boolean) {
    let dataArray: Array<AtmosphereLoss>;
    if (isBaseline) {
      dataArray = this.baselineData.getValue();
    } else {
      dataArray = this.modificationData.getValue();
    }
    // dataArray won't exist during reset cycle w/ multiple subjects emitting
    if (dataArray && dataArray[index]) {
      dataArray[index].name = data.name;
      dataArray[index].hoursPerYear = data.hoursPerYear;
      dataArray[index].fuelCost = data.fuelCost;
      dataArray[index].availableHeat = data.availableHeat;
      dataArray[index].energySourceType = data.energySourceType;
      dataArray[index].atmosphereGas = data.atmosphereGas;
      dataArray[index].specificHeat = data.specificHeat;
      dataArray[index].inletTemperature = data.inletTemperature;
      dataArray[index].outletTemperature = data.outletTemperature
      dataArray[index].flowRate = data.flowRate;
      dataArray[index].correctionFactor = data.correctionFactor;
      dataArray[index].heatLoss = data.heatLoss;
    }

     if (isBaseline) {
      this.baselineData.next(dataArray);
    } else {
      this.modificationData.next(dataArray);
    }
  }

    
  removeLoss(i: number) {
    let currentBaselineData: Array<AtmosphereLoss> = this.baselineData.getValue();
    currentBaselineData.splice(i, 1);
    this.baselineData.next(currentBaselineData);
    let currentModificationData: Array<AtmosphereLoss> = this.modificationData.getValue();
    if (currentModificationData) {
      currentModificationData.splice(i, 1);
      this.modificationData.next(currentModificationData);
    }
  }
  
  addLoss(treasureHours: number, modificationExists: boolean) {
    let currentBaselineData: Array<AtmosphereLoss> = JSON.parse(JSON.stringify(this.baselineData.getValue()));
    let index = currentBaselineData.length;
    let baselineObj: AtmosphereLoss = this.initDefaultLoss(index, treasureHours, currentBaselineData[0]);
    currentBaselineData.push(baselineObj)
    this.baselineData.next(currentBaselineData);
    
    if (modificationExists) {
      let currentModificationData: Array<AtmosphereLoss> = this.modificationData.getValue();
      let modificationObj: AtmosphereLoss = this.initDefaultLoss(index, treasureHours, currentBaselineData[0]);
      currentModificationData.push(modificationObj);
      this.modificationData.next(currentModificationData);
    }
  }

  generateExampleData(settings: Settings) {
    let specificHeat: number = .0185;
    let inletTemperature: number = 30;
    let outletTemperature: number = 1000;
    let modOutletTemperature: number = 900;
    let flowRate: number = 120000;

    if(settings.unitsOfMeasure != 'Imperial'){
      specificHeat = this.convertUnitsService.value(specificHeat).from('btuScfF').to('kJm3C');
      specificHeat = Number(specificHeat.toFixed(5));

      inletTemperature = this.convertUnitsService.value(inletTemperature).from('F').to('C');
      inletTemperature = Number(inletTemperature.toFixed(2));

      outletTemperature = this.convertUnitsService.value(outletTemperature).from('F').to('C');
      outletTemperature = Number(outletTemperature.toFixed(2));

      modOutletTemperature = this.convertUnitsService.value(modOutletTemperature).from('F').to('C');
      modOutletTemperature = Number(modOutletTemperature.toFixed(2));

      flowRate = this.convertUnitsService.value(flowRate).from('ft3/h').to('m3/h');
      flowRate = Number(flowRate.toFixed(2));
    }

    let baselineExample: AtmosphereLoss = {
      atmosphereGas: 1,
      specificHeat: specificHeat,
      inletTemperature: inletTemperature,
      outletTemperature: outletTemperature,
      flowRate: flowRate,
      correctionFactor: 1,
      heatLoss: 0,
      energySourceType: 'Fuel',
      fuelCost: 3.99,
      hoursPerYear: 8760,    
      availableHeat: 100,
      name: 'Loss #1'
    };
    this.baselineData.next([baselineExample]);

    let modExample: AtmosphereLoss = {
      atmosphereGas: 1,
      specificHeat: specificHeat,
      inletTemperature: inletTemperature,
      outletTemperature: modOutletTemperature,
      flowRate: flowRate,
      correctionFactor: 1,
      heatLoss: 0,
      energySourceType: 'Fuel',
      fuelCost: 3.99,
      hoursPerYear: 8760,    
      availableHeat: 100,
      name: 'Loss #1 (Lower Outlet Temp)'
    };
    
    this.modificationData.next([modExample]);
    this.generateExample.next(true);
  }

  getAnnualEnergyUnit(energySourceType: string, settings: Settings) {
    let energyUnit: string = settings.energyResultUnit;
    if (energySourceType === 'Electricity') {
      energyUnit = 'kWh';
    } else if (settings.unitsOfMeasure === 'Metric') {
      energyUnit = 'GJ';
    } else {
      energyUnit = 'MMBtu';
    }
    return energyUnit;
  }

}